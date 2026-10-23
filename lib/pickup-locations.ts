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
  },
}

export function getPickupLocation(id: unknown): PickupLocation {
  return PICKUP_LOCATIONS[id === 'havirov' ? 'havirov' : 'frenstat']
}
