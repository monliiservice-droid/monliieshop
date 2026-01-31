// Zásilkovna Z-BOX API Integration
// Automatically finds nearest Z-BOX to customer's address

export interface ZBoxPoint {
  id: string
  name: string
  place: string
  street: string
  city: string
  zip: string
  country: string
  latitude: number
  longitude: number
  url?: string
}

export interface CustomerAddress {
  street: string
  city: string
  zip: string
  country?: string
}

/**
 * Calculate distance between two coordinates using Haversine formula
 */
function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371 // Radius of Earth in kilometers
  const dLat = ((lat2 - lat1) * Math.PI) / 180
  const dLon = ((lon2 - lon1) * Math.PI) / 180
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}

/**
 * Geocode address using Nominatim (OpenStreetMap)
 */
async function geocodeAddress(
  address: CustomerAddress
): Promise<{ lat: number; lon: number } | null> {
  try {
    const query = `${address.street}, ${address.zip} ${address.city}, ${address.country || 'Czech Republic'}`
    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=1`

    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Monlii-Eshop/1.0',
      },
    })

    if (!response.ok) {
      console.error('Geocoding failed:', response.statusText)
      return null
    }

    const data = await response.json()
    if (data && data.length > 0) {
      return {
        lat: parseFloat(data[0].lat),
        lon: parseFloat(data[0].lon),
      }
    }

    return null
  } catch (error) {
    console.error('Geocoding error:', error)
    return null
  }
}

/**
 * Fetch all Z-BOX points from Zásilkovna API
 */
async function fetchZBoxPoints(): Promise<ZBoxPoint[]> {
  try {
    const apiKey = process.env.NEXT_PUBLIC_ZASILKOVNA_API_KEY
    
    if (!apiKey) {
      console.error('Zásilkovna API key not configured')
      return []
    }

    // Zásilkovna API endpoint for branch list (Z-BOX type)
    const url = `https://www.zasilkovna.cz/api/v4/${apiKey}/branch.json?country=cz`

    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      console.error('Failed to fetch Z-BOX points:', response.statusText)
      return []
    }

    const data = await response.json()
    
    // Filter only Z-BOX type points (type: 'zbox' or similar identifier)
    // Note: You may need to adjust the filter based on actual API response structure
    const zboxPoints: ZBoxPoint[] = []
    
    if (data.data) {
      Object.values(data.data).forEach((point: any) => {
        // Check if it's a Z-BOX (automated locker)
        if (point.place && point.place.toLowerCase().includes('z-box')) {
          zboxPoints.push({
            id: point.id || point.zip,
            name: point.name || point.place,
            place: point.place,
            street: point.street,
            city: point.city,
            zip: point.zip,
            country: point.country || 'cz',
            latitude: parseFloat(point.latitude),
            longitude: parseFloat(point.longitude),
            url: point.url,
          })
        }
      })
    }

    return zboxPoints
  } catch (error) {
    console.error('Error fetching Z-BOX points:', error)
    return []
  }
}

/**
 * Find nearest Z-BOX to customer address
 */
export async function findNearestZBox(
  customerAddress: CustomerAddress
): Promise<ZBoxPoint | null> {
  try {
    // Step 1: Geocode customer address
    const customerCoords = await geocodeAddress(customerAddress)
    if (!customerCoords) {
      console.error('Could not geocode customer address')
      return null
    }

    // Step 2: Fetch all Z-BOX points
    const zboxPoints = await fetchZBoxPoints()
    if (zboxPoints.length === 0) {
      console.error('No Z-BOX points found')
      return null
    }

    // Step 3: Calculate distances and find nearest
    let nearestZBox: ZBoxPoint | null = null
    let minDistance = Infinity

    for (const zbox of zboxPoints) {
      const distance = calculateDistance(
        customerCoords.lat,
        customerCoords.lon,
        zbox.latitude,
        zbox.longitude
      )

      if (distance < minDistance) {
        minDistance = distance
        nearestZBox = zbox
      }
    }

    console.log(`Found nearest Z-BOX: ${nearestZBox?.name} (${minDistance.toFixed(2)} km away)`)
    
    return nearestZBox
  } catch (error) {
    console.error('Error finding nearest Z-BOX:', error)
    return null
  }
}

/**
 * Zásilkovna configuration
 */
export const ZASILKOVNA_CONFIG = {
  apiKey: process.env.NEXT_PUBLIC_ZASILKOVNA_API_KEY || '',
  zboxDeliveryPrice: 69, // Kč - Z-BOX delivery
  freeShippingThreshold: 2500, // Kč - free shipping threshold
  codFee: 30, // Kč - cash on delivery fee
}
