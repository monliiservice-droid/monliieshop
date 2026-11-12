// Místa osobního odběru – jediný zdroj adres pro checkout, kontakty, admin i e-maily.

export type PickupLocationId = 'havirov' | 'frenstat'

export interface PickupLocation {
  name: string
  place: string
  address: string
  note?: string
  zip: string
  city: string
  hours: { days: string; time: string }[]
  /** Otevírací doba pro vyhledávače (schema.org) – jen u vlastní prodejny */
  openingHours?: { days: string[]; opens: string; closes: string }[]
}

export const PICKUP_LOCATIONS: Record<PickupLocationId, PickupLocation> = {
  havirov: {
    name: 'Havířov',
    place: 'Obchod Kyšky Lišky',
    address: 'Dlouhá tř. 95c',
    note: 'vstup vedle marketu Albert',
    zip: '736 01',
    city: 'Havířov',
    hours: [{ days: 'Otevírací doba', time: 'podle provozní doby obchodu' }],
  },
  frenstat: {
    name: 'Frenštát pod Radhoštěm',
    place: 'Prodejna Monlii',
    address: 'Rožnovská 1824',
    zip: '744 01',
    city: 'Frenštát pod Radhoštěm',
    hours: [
      { days: 'Po–Pá', time: '8:30–12:00, 12:30–17:00' },
      { days: 'So', time: '8:00–12:00' },
      { days: 'Ne', time: 'zavřeno' },
    ],
    openingHours: [
      { days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'], opens: '08:30', closes: '12:00' },
      { days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'], opens: '12:30', closes: '17:00' },
      { days: ['Saturday'], opens: '08:00', closes: '12:00' },
    ],
  },
}

export function getPickupLocation(id: unknown): PickupLocation {
  return PICKUP_LOCATIONS[id === 'havirov' ? 'havirov' : 'frenstat']
}
