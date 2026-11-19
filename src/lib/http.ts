export class ApiError extends Error {
  readonly status?: number
  readonly retryable: boolean

  constructor(message: string, options: { status?: number; retryable?: boolean } = {}) {
    super(message)
    this.name = 'ApiError'
    this.status = options.status
    this.retryable = options.retryable ?? false
  }
}

interface FetchJsonOptions {
  signal?: AbortSignal
  timeoutMs?: number
  retries?: number
  /** Cache successful responses for this long. 0 disables caching. */
  ttlMs?: number
}

interface CacheEntry {
  expires: number
  value: unknown
}

const cache = new Map<string, CacheEntry>()

export function clearApiCache(): void {
  cache.clear()
}

export function isAbortError(error: unknown): boolean {
  return (
    (error instanceof DOMException && error.name === 'AbortError') ||
    (error instanceof Error && error.name === 'AbortError')
  )
}

export function describeError(error: unknown): string {
  if (error instanceof ApiError) return error.message
  if (error instanceof TypeError) {
    return "Couldn't reach the air quality service. Check your connection and try again."
  }
  if (error instanceof Error && error.message) return error.message
  return 'Something went wrong while loading air quality data.'
}

const sleep = (ms: number, signal?: AbortSignal) =>
  new Promise<void>((resolve, reject) => {
    if (signal?.aborted) {
      reject(new DOMException('Aborted', 'AbortError'))
      return
    }
    const timer = setTimeout(() => {
      cleanup()
      resolve()
    }, ms)
    const onAbort = () => {
      clearTimeout(timer)
      cleanup()
      reject(new DOMException('Aborted', 'AbortError'))
    }
    const cleanup = () => signal?.removeEventListener('abort', onAbort)
    signal?.addEventListener('abort', onAbort, { once: true })
  })

async function requestOnce<T>(url: string, signal: AbortSignal | undefined, timeoutMs: number): Promise<T> {
  const controller = new AbortController()
  let timedOut = false
  const timer = setTimeout(() => {
    timedOut = true
    controller.abort()
  }, timeoutMs)

  const onAbort = () => controller.abort()
  signal?.addEventListener('abort', onAbort, { once: true })

  try {
    const response = await fetch(url, {
      signal: controller.signal,
      headers: { Accept: 'application/json' },
    })

    if (!response.ok) {
      let reason = ''
      try {
        const body = (await response.json()) as { reason?: string }
        reason = body?.reason ?? ''
      } catch {
        // Non-JSON error body — fall back to the status code.
      }
      throw new ApiError(reason || `The service responded with status ${response.status}.`, {
        status: response.status,
        retryable: response.status === 429 || response.status >= 500,
      })
    }

    return (await response.json()) as T
  } catch (error) {
    if (timedOut) {
      throw new ApiError('The service took too long to respond. Please try again.', { retryable: true })
    }
    throw error
  } finally {
    clearTimeout(timer)
    signal?.removeEventListener('abort', onAbort)
  }
}

/**
 * Fetch JSON with a hard timeout, bounded retries for transient failures, and
 * an optional TTL cache so quick navigation does not hammer the free API.
 */
export async function fetchJson<T>(url: string, options: FetchJsonOptions = {}): Promise<T> {
  const { signal, timeoutMs = 12_000, retries = 2, ttlMs = 0 } = options

  if (ttlMs > 0) {
    const hit = cache.get(url)
    if (hit && hit.expires > Date.now()) return hit.value as T
  }

  let lastError: unknown
  for (let attempt = 0; attempt <= retries; attempt += 1) {
    try {
      const value = await requestOnce<T>(url, signal, timeoutMs)
      if (ttlMs > 0) cache.set(url, { expires: Date.now() + ttlMs, value })
      return value
    } catch (error) {
      lastError = error
      if (isAbortError(error) && signal?.aborted) throw error
      const retryable = error instanceof ApiError ? error.retryable : error instanceof TypeError
      if (!retryable || attempt === retries) throw error
      await sleep(350 * 2 ** attempt, signal)
    }
  }

  throw lastError ?? new ApiError('Request failed.')
}
