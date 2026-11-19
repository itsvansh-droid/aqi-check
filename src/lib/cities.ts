import type { Continent, Location } from './types'

export type { Continent }

export interface GlobalCity extends Location {
  continent: Continent
}

interface CitySeed {
  name: string
  country: string
  countryCode: string
  admin1?: string
  latitude: number
  longitude: number
  timezone: string
  continent: Continent
}

const SEEDS: CitySeed[] = [
  // Asia
  { name: 'New Delhi', country: 'India', countryCode: 'IN', admin1: 'Delhi', latitude: 28.6139, longitude: 77.209, timezone: 'Asia/Kolkata', continent: 'Asia' },
  { name: 'Mumbai', country: 'India', countryCode: 'IN', admin1: 'Maharashtra', latitude: 19.076, longitude: 72.8777, timezone: 'Asia/Kolkata', continent: 'Asia' },
  { name: 'Kolkata', country: 'India', countryCode: 'IN', admin1: 'West Bengal', latitude: 22.5726, longitude: 88.3639, timezone: 'Asia/Kolkata', continent: 'Asia' },
  { name: 'Bengaluru', country: 'India', countryCode: 'IN', admin1: 'Karnataka', latitude: 12.9716, longitude: 77.5946, timezone: 'Asia/Kolkata', continent: 'Asia' },
  { name: 'Chennai', country: 'India', countryCode: 'IN', admin1: 'Tamil Nadu', latitude: 13.0827, longitude: 80.2707, timezone: 'Asia/Kolkata', continent: 'Asia' },
  { name: 'Ahmedabad', country: 'India', countryCode: 'IN', admin1: 'Gujarat', latitude: 23.0225, longitude: 72.5714, timezone: 'Asia/Kolkata', continent: 'Asia' },
  { name: 'Pune', country: 'India', countryCode: 'IN', admin1: 'Maharashtra', latitude: 18.5204, longitude: 73.8567, timezone: 'Asia/Kolkata', continent: 'Asia' },
  { name: 'Hyderabad', country: 'India', countryCode: 'IN', admin1: 'Telangana', latitude: 17.385, longitude: 78.4867, timezone: 'Asia/Kolkata', continent: 'Asia' },
  { name: 'Jaipur', country: 'India', countryCode: 'IN', admin1: 'Rajasthan', latitude: 26.9124, longitude: 75.7873, timezone: 'Asia/Kolkata', continent: 'Asia' },
  { name: 'Lucknow', country: 'India', countryCode: 'IN', admin1: 'Uttar Pradesh', latitude: 26.8467, longitude: 80.9462, timezone: 'Asia/Kolkata', continent: 'Asia' },
  { name: 'Kanpur', country: 'India', countryCode: 'IN', admin1: 'Uttar Pradesh', latitude: 26.4499, longitude: 80.3319, timezone: 'Asia/Kolkata', continent: 'Asia' },
  { name: 'Nagpur', country: 'India', countryCode: 'IN', admin1: 'Maharashtra', latitude: 21.1458, longitude: 79.0882, timezone: 'Asia/Kolkata', continent: 'Asia' },
  { name: 'Indore', country: 'India', countryCode: 'IN', admin1: 'Madhya Pradesh', latitude: 22.7196, longitude: 75.8577, timezone: 'Asia/Kolkata', continent: 'Asia' },
  { name: 'Bhopal', country: 'India', countryCode: 'IN', admin1: 'Madhya Pradesh', latitude: 23.2599, longitude: 77.4126, timezone: 'Asia/Kolkata', continent: 'Asia' },
  { name: 'Patna', country: 'India', countryCode: 'IN', admin1: 'Bihar', latitude: 25.5941, longitude: 85.1376, timezone: 'Asia/Kolkata', continent: 'Asia' },
  { name: 'Varanasi', country: 'India', countryCode: 'IN', admin1: 'Uttar Pradesh', latitude: 25.3176, longitude: 82.9739, timezone: 'Asia/Kolkata', continent: 'Asia' },
  { name: 'Surat', country: 'India', countryCode: 'IN', admin1: 'Gujarat', latitude: 21.1702, longitude: 72.8311, timezone: 'Asia/Kolkata', continent: 'Asia' },
  { name: 'Chandigarh', country: 'India', countryCode: 'IN', admin1: 'Chandigarh', latitude: 30.7333, longitude: 76.7794, timezone: 'Asia/Kolkata', continent: 'Asia' },
  { name: 'Kochi', country: 'India', countryCode: 'IN', admin1: 'Kerala', latitude: 9.9312, longitude: 76.2673, timezone: 'Asia/Kolkata', continent: 'Asia' },
  { name: 'Visakhapatnam', country: 'India', countryCode: 'IN', admin1: 'Andhra Pradesh', latitude: 17.6868, longitude: 83.2185, timezone: 'Asia/Kolkata', continent: 'Asia' },
  { name: 'Guwahati', country: 'India', countryCode: 'IN', admin1: 'Assam', latitude: 26.1445, longitude: 91.7362, timezone: 'Asia/Kolkata', continent: 'Asia' },
  { name: 'Karachi', country: 'Pakistan', countryCode: 'PK', admin1: 'Sindh', latitude: 24.8607, longitude: 67.0011, timezone: 'Asia/Karachi', continent: 'Asia' },
  { name: 'Lahore', country: 'Pakistan', countryCode: 'PK', admin1: 'Punjab', latitude: 31.5204, longitude: 74.3587, timezone: 'Asia/Karachi', continent: 'Asia' },
  { name: 'Dhaka', country: 'Bangladesh', countryCode: 'BD', latitude: 23.8103, longitude: 90.4125, timezone: 'Asia/Dhaka', continent: 'Asia' },
  { name: 'Kathmandu', country: 'Nepal', countryCode: 'NP', latitude: 27.7172, longitude: 85.324, timezone: 'Asia/Kathmandu', continent: 'Asia' },
  { name: 'Bangkok', country: 'Thailand', countryCode: 'TH', latitude: 13.7563, longitude: 100.5018, timezone: 'Asia/Bangkok', continent: 'Asia' },
  { name: 'Jakarta', country: 'Indonesia', countryCode: 'ID', latitude: -6.2088, longitude: 106.8456, timezone: 'Asia/Jakarta', continent: 'Asia' },
  { name: 'Singapore', country: 'Singapore', countryCode: 'SG', latitude: 1.3521, longitude: 103.8198, timezone: 'Asia/Singapore', continent: 'Asia' },
  { name: 'Kuala Lumpur', country: 'Malaysia', countryCode: 'MY', latitude: 3.139, longitude: 101.6869, timezone: 'Asia/Kuala_Lumpur', continent: 'Asia' },
  { name: 'Manila', country: 'Philippines', countryCode: 'PH', latitude: 14.5995, longitude: 120.9842, timezone: 'Asia/Manila', continent: 'Asia' },
  { name: 'Hanoi', country: 'Vietnam', countryCode: 'VN', latitude: 21.0278, longitude: 105.8342, timezone: 'Asia/Ho_Chi_Minh', continent: 'Asia' },
  { name: 'Beijing', country: 'China', countryCode: 'CN', latitude: 39.9042, longitude: 116.4074, timezone: 'Asia/Shanghai', continent: 'Asia' },
  { name: 'Shanghai', country: 'China', countryCode: 'CN', latitude: 31.2304, longitude: 121.4737, timezone: 'Asia/Shanghai', continent: 'Asia' },
  { name: 'Seoul', country: 'South Korea', countryCode: 'KR', latitude: 37.5665, longitude: 126.978, timezone: 'Asia/Seoul', continent: 'Asia' },
  { name: 'Tokyo', country: 'Japan', countryCode: 'JP', latitude: 35.6762, longitude: 139.6503, timezone: 'Asia/Tokyo', continent: 'Asia' },
  { name: 'Dubai', country: 'United Arab Emirates', countryCode: 'AE', latitude: 25.2048, longitude: 55.2708, timezone: 'Asia/Dubai', continent: 'Asia' },
  { name: 'Riyadh', country: 'Saudi Arabia', countryCode: 'SA', latitude: 24.7136, longitude: 46.6753, timezone: 'Asia/Riyadh', continent: 'Asia' },
  { name: 'Tehran', country: 'Iran', countryCode: 'IR', latitude: 35.6892, longitude: 51.389, timezone: 'Asia/Tehran', continent: 'Asia' },
  { name: 'Tashkent', country: 'Uzbekistan', countryCode: 'UZ', latitude: 41.2995, longitude: 69.2401, timezone: 'Asia/Tashkent', continent: 'Asia' },
  { name: 'Istanbul', country: 'Türkiye', countryCode: 'TR', latitude: 41.0082, longitude: 28.9784, timezone: 'Europe/Istanbul', continent: 'Europe' },

  // Europe
  { name: 'London', country: 'United Kingdom', countryCode: 'GB', latitude: 51.5074, longitude: -0.1278, timezone: 'Europe/London', continent: 'Europe' },
  { name: 'Paris', country: 'France', countryCode: 'FR', latitude: 48.8566, longitude: 2.3522, timezone: 'Europe/Paris', continent: 'Europe' },
  { name: 'Berlin', country: 'Germany', countryCode: 'DE', latitude: 52.52, longitude: 13.405, timezone: 'Europe/Berlin', continent: 'Europe' },
  { name: 'Madrid', country: 'Spain', countryCode: 'ES', latitude: 40.4168, longitude: -3.7038, timezone: 'Europe/Madrid', continent: 'Europe' },
  { name: 'Rome', country: 'Italy', countryCode: 'IT', latitude: 41.9028, longitude: 12.4964, timezone: 'Europe/Rome', continent: 'Europe' },
  { name: 'Amsterdam', country: 'Netherlands', countryCode: 'NL', latitude: 52.3676, longitude: 4.9041, timezone: 'Europe/Amsterdam', continent: 'Europe' },
  { name: 'Warsaw', country: 'Poland', countryCode: 'PL', latitude: 52.2297, longitude: 21.0122, timezone: 'Europe/Warsaw', continent: 'Europe' },
  { name: 'Moscow', country: 'Russia', countryCode: 'RU', latitude: 55.7558, longitude: 37.6173, timezone: 'Europe/Moscow', continent: 'Europe' },
  { name: 'Kyiv', country: 'Ukraine', countryCode: 'UA', latitude: 50.4501, longitude: 30.5234, timezone: 'Europe/Kyiv', continent: 'Europe' },
  { name: 'Stockholm', country: 'Sweden', countryCode: 'SE', latitude: 59.3293, longitude: 18.0686, timezone: 'Europe/Stockholm', continent: 'Europe' },

  // North America
  { name: 'New York', country: 'United States', countryCode: 'US', admin1: 'New York', latitude: 40.7128, longitude: -74.006, timezone: 'America/New_York', continent: 'North America' },
  { name: 'Los Angeles', country: 'United States', countryCode: 'US', admin1: 'California', latitude: 34.0522, longitude: -118.2437, timezone: 'America/Los_Angeles', continent: 'North America' },
  { name: 'Chicago', country: 'United States', countryCode: 'US', admin1: 'Illinois', latitude: 41.8781, longitude: -87.6298, timezone: 'America/Chicago', continent: 'North America' },
  { name: 'Toronto', country: 'Canada', countryCode: 'CA', latitude: 43.6532, longitude: -79.3832, timezone: 'America/Toronto', continent: 'North America' },
  { name: 'Vancouver', country: 'Canada', countryCode: 'CA', latitude: 49.2827, longitude: -123.1207, timezone: 'America/Vancouver', continent: 'North America' },
  { name: 'Mexico City', country: 'Mexico', countryCode: 'MX', latitude: 19.4326, longitude: -99.1332, timezone: 'America/Mexico_City', continent: 'North America' },

  // South America
  { name: 'São Paulo', country: 'Brazil', countryCode: 'BR', latitude: -23.5505, longitude: -46.6333, timezone: 'America/Sao_Paulo', continent: 'South America' },
  { name: 'Buenos Aires', country: 'Argentina', countryCode: 'AR', latitude: -34.6037, longitude: -58.3816, timezone: 'America/Argentina/Buenos_Aires', continent: 'South America' },
  { name: 'Lima', country: 'Peru', countryCode: 'PE', latitude: -12.0464, longitude: -77.0428, timezone: 'America/Lima', continent: 'South America' },
  { name: 'Bogotá', country: 'Colombia', countryCode: 'CO', latitude: 4.711, longitude: -74.0721, timezone: 'America/Bogota', continent: 'South America' },
  { name: 'Santiago', country: 'Chile', countryCode: 'CL', latitude: -33.4489, longitude: -70.6693, timezone: 'America/Santiago', continent: 'South America' },

  // Africa
  { name: 'Cairo', country: 'Egypt', countryCode: 'EG', latitude: 30.0444, longitude: 31.2357, timezone: 'Africa/Cairo', continent: 'Africa' },
  { name: 'Lagos', country: 'Nigeria', countryCode: 'NG', latitude: 6.5244, longitude: 3.3792, timezone: 'Africa/Lagos', continent: 'Africa' },
  { name: 'Nairobi', country: 'Kenya', countryCode: 'KE', latitude: -1.2921, longitude: 36.8219, timezone: 'Africa/Nairobi', continent: 'Africa' },
  { name: 'Johannesburg', country: 'South Africa', countryCode: 'ZA', latitude: -26.2041, longitude: 28.0473, timezone: 'Africa/Johannesburg', continent: 'Africa' },
  { name: 'Casablanca', country: 'Morocco', countryCode: 'MA', latitude: 33.5731, longitude: -7.5898, timezone: 'Africa/Casablanca', continent: 'Africa' },
  { name: 'Accra', country: 'Ghana', countryCode: 'GH', latitude: 5.6037, longitude: -0.187, timezone: 'Africa/Accra', continent: 'Africa' },
  { name: 'Addis Ababa', country: 'Ethiopia', countryCode: 'ET', latitude: 9.032, longitude: 38.7469, timezone: 'Africa/Addis_Ababa', continent: 'Africa' },

  // Oceania
  { name: 'Sydney', country: 'Australia', countryCode: 'AU', latitude: -33.8688, longitude: 151.2093, timezone: 'Australia/Sydney', continent: 'Oceania' },
  { name: 'Melbourne', country: 'Australia', countryCode: 'AU', latitude: -37.8136, longitude: 144.9631, timezone: 'Australia/Melbourne', continent: 'Oceania' },
  { name: 'Auckland', country: 'New Zealand', countryCode: 'NZ', latitude: -36.8509, longitude: 174.7645, timezone: 'Pacific/Auckland', continent: 'Oceania' },
]

export const CONTINENTS: Array<Continent | 'World'> = [
  'World',
  'Africa',
  'Asia',
  'Europe',
  'North America',
  'South America',
  'Oceania',
]

export const GLOBAL_CITIES: GlobalCity[] = SEEDS.map((seed) => ({
  id: `${seed.latitude.toFixed(3)},${seed.longitude.toFixed(3)}`,
  name: seed.name,
  admin1: seed.admin1,
  country: seed.country,
  countryCode: seed.countryCode,
  latitude: seed.latitude,
  longitude: seed.longitude,
  timezone: seed.timezone,
  continent: seed.continent,
}))

export const HOME_FALLBACK: Location = {
  id: GLOBAL_CITIES[0].id,
  name: GLOBAL_CITIES[0].name,
  latitude: GLOBAL_CITIES[0].latitude,
  longitude: GLOBAL_CITIES[0].longitude,
  admin1: GLOBAL_CITIES[0].admin1,
  country: GLOBAL_CITIES[0].country,
  countryCode: GLOBAL_CITIES[0].countryCode,
  timezone: GLOBAL_CITIES[0].timezone,
}

export function locationFromCity(city: GlobalCity): Location {
  return {
    id: city.id,
    name: city.name,
    admin1: city.admin1,
    country: city.country,
    countryCode: city.countryCode,
    latitude: city.latitude,
    longitude: city.longitude,
    timezone: city.timezone,
  }
}

/** Pick a sensible first city from the browser timezone. */
export function guessHomeLocation(): Location {
  try {
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone
    const match = GLOBAL_CITIES.find((city) => city.timezone === timezone)
    if (match) return locationFromCity(match)
  } catch {
    // Intl is unavailable — fall through to the default.
  }
  return HOME_FALLBACK
}
