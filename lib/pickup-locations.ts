// Místa osobního odběru – jediný zdroj adres pro checkout, admin i e-maily.
// TODO: doplnit skutečné adresy prodejen (ulice a číslo jsou zatím zástupné).

export type PickupLocationId = 'havirov' | 'frenstat'

export interface PickupLocation {
  name: string
  address: string
  zip: string
  city: string
}

export const PICKUP_LOCATIONS: Record<PickupLocationId, PickupLocation> = {
  havirov: {
    name: 'Havířov',
    address: 'Hlavní 1234',
    zip: '736 01',
    city: 'Havířov',
  },
  frenstat: {
    name: 'Frenštát pod Radhoštěm',
    address: 'Hlavní 5678',
    zip: '744 01',
    city: 'Frenštát p. R.',
  },
}

export function getPickupLocation(id: unknown): PickupLocation {
  return PICKUP_LOCATIONS[id === 'havirov' ? 'havirov' : 'frenstat']
}
