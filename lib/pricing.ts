// Sdílené ceníky a výpočty cen – používá je klient (zobrazení) i server (přepočet objednávky).
// Server vždy počítá ceny sám, hodnotám z prohlížeče nevěří.

import { ZASILKOVNA_CONFIG } from './zasilkovna-zbox'

export type SubscriptionPlan = 3 | 6 | 12
export type SubscriptionBraType = 'wired' | 'bralette'

export const SUBSCRIPTION_PLANS: SubscriptionPlan[] = [3, 6, 12]

export const SUBSCRIPTION_PRICES: Record<
  SubscriptionBraType,
  Record<'with' | 'without', Record<SubscriptionPlan, number>>
> = {
  wired: {
    without: { 3: 3300, 6: 6600, 12: 13200 },
    with: { 3: 4200, 6: 8400, 12: 16800 },
  },
  bralette: {
    without: { 3: 2800, 6: 5600, 12: 11200 },
    with: { 3: 3700, 6: 7400, 12: 14800 },
  },
}

export function getSubscriptionPrice(
  braType: SubscriptionBraType,
  withGarters: boolean,
  months: SubscriptionPlan
): number {
  return SUBSCRIPTION_PRICES[braType][withGarters ? 'with' : 'without'][months]
}

export function getSubscriptionName(
  braType: SubscriptionBraType,
  withGarters: boolean,
  months: SubscriptionPlan
): string {
  return `Předplatné ${months} měsíců - ${braType === 'wired' ? 'S kosticemi' : 'Braletková'} ${withGarters ? 'S podvazky' : 'Bez podvazků'}`
}

export type ShippingMethod = 'zbox' | 'personal'
export type PaymentMethod = 'qr_code' | 'cod' | 'store_payment'

export const COD_FEE = ZASILKOVNA_CONFIG.codFee

// Povolené kombinace dopravy a platby
export const ALLOWED_PAYMENT_METHODS: Record<ShippingMethod, PaymentMethod[]> = {
  zbox: ['qr_code', 'cod'],
  personal: ['qr_code', 'store_payment'],
}

export function getShippingPrice(method: ShippingMethod, subtotal: number): number {
  if (method === 'zbox') {
    return subtotal >= ZASILKOVNA_CONFIG.freeShippingThreshold ? 0 : ZASILKOVNA_CONFIG.zboxDeliveryPrice
  }
  return 0
}

export function getPaymentFee(method: PaymentMethod): number {
  return method === 'cod' ? COD_FEE : 0
}
