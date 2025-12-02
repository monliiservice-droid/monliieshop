// Zásilkovna API konfigurace
export const ZASILKOVNA_API_KEY = 'dee61660b640a98d'

export const ZASILKOVNA_CONFIG = {
  apiKey: ZASILKOVNA_API_KEY,
  defaultCountry: 'cz',
  defaultLanguage: 'cs',
  pickupPointPrice: 69, // Kč - výdejní místo
  homeDeliveryPrice: 99, // Kč - doručení na adresu (BEZ free shipping)
  freeShippingThreshold: 2500, // Kč - doprava zdarma pouze pro výdejní místo
  codFee: 30, // Kč - poplatek za dobírku
}

export const SHIPPING_METHODS = {
  ZASILKOVNA_PICKUP: 'zasilkovna_pickup',
  ZASILKOVNA_HOME: 'zasilkovna_home',
  PERSONAL: 'personal',
} as const

export type ShippingMethod = typeof SHIPPING_METHODS[keyof typeof SHIPPING_METHODS]

// Definice typu pro výdejní místo
export interface ZasilkovnaPickupPoint {
  id: string
  name: string
  street: string
  city: string
  zip: string
  country: string
  latitude?: number
  longitude?: number
}
