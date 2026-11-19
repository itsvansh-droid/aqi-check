import '@testing-library/jest-dom/vitest'
import { afterEach, beforeEach, vi } from 'vitest'
import { cleanup } from '@testing-library/react'
import { clearApiCache } from '../lib/http'

/**
 * Node 26 exposes an experimental `localStorage` global that can shadow the
 * jsdom implementation. Keep a small in-memory Storage so component tests
 * exercise the real persistence code paths regardless of the host runtime.
 */
function installStorage(): void {
  try {
    if (window.localStorage) return
  } catch {
    // jsdom throws for opaque origins; fall through to the polyfill.
  }

  let store = new Map<string, string>()
  const storage: Storage = {
    get length() {
      return store.size
    },
    clear() {
      store = new Map()
    },
    getItem(key) {
      return store.has(key) ? (store.get(key) as string) : null
    },
    key(index) {
      return [...store.keys()][index] ?? null
    },
    removeItem(key) {
      store.delete(key)
    },
    setItem(key, value) {
      store.set(key, String(value))
    },
  }

  Object.defineProperty(window, 'localStorage', { value: storage, configurable: true })
  Object.defineProperty(globalThis, 'localStorage', { value: storage, configurable: true })
}

installStorage()

const createMatchMedia = (query: string): MediaQueryList =>
  ({
    matches: true,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  }) as unknown as MediaQueryList

beforeEach(() => {
  window.localStorage.clear()
  clearApiCache()
  window.matchMedia = createMatchMedia as unknown as typeof window.matchMedia
  window.scrollTo = vi.fn()
  class ResizeObserverStub {
    observe = vi.fn()
    unobserve = vi.fn()
    disconnect = vi.fn()
  }
  vi.stubGlobal('ResizeObserver', ResizeObserverStub)
})

afterEach(() => {
  cleanup()
  vi.unstubAllGlobals()
  vi.restoreAllMocks()
})
