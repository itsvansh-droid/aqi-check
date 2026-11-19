export class GeolocationError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'GeolocationError'
  }
}

export function requestPosition(): Promise<{ latitude: number; longitude: number }> {
  return new Promise((resolve, reject) => {
    if (!('geolocation' in navigator)) {
      reject(new GeolocationError('Location is not available in this browser.'))
      return
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({ latitude: position.coords.latitude, longitude: position.coords.longitude })
      },
      (error) => {
        switch (error.code) {
          case error.PERMISSION_DENIED:
            reject(
              new GeolocationError('Location permission was blocked. You can still search for a city.'),
            )
            break
          case error.POSITION_UNAVAILABLE:
            reject(new GeolocationError("Your location couldn't be determined right now."))
            break
          case error.TIMEOUT:
            reject(new GeolocationError('Finding your location took too long. Please try again.'))
            break
          default:
            reject(new GeolocationError('Location is unavailable right now.'))
        }
      },
      { enableHighAccuracy: false, timeout: 12_000, maximumAge: 5 * 60 * 1000 },
    )
  })
}
