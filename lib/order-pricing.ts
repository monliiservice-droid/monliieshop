// Serverový přepočet objednávky. Ceny, názvy, dopravu i poplatky bere výhradně
// z databáze a ceníků v `lib/pricing.ts`, ne z dat poslaných prohlížečem.

import { prisma } from './prisma'
import { getActivePrice, type SetConfiguration } from './set-config-types'
import {
  ALLOWED_PAYMENT_METHODS,
  SUBSCRIPTION_PLANS,
  getPaymentFee,
  getShippingPrice,
  getSubscriptionName,
  getSubscriptionPrice,
  type PaymentMethod,
  type ShippingMethod,
  type SubscriptionPlan,
} from './pricing'

const MAX_ITEMS = 50
const MAX_QUANTITY = 20
const MAX_VARIANT_LENGTH = 500

export interface PricedOrderItem {
  productId: string | null
  name: string
  quantity: number
  price: number
  variant: { name: string; value: string } | null
}

export interface PricedOrder {
  items: PricedOrderItem[]
  subtotal: number
  shippingMethod: ShippingMethod
  shippingCost: number
  paymentMethod: PaymentMethod
  paymentFee: number
  total: number
}

export class OrderValidationError extends Error {}

function cleanString(value: unknown, maxLength: number): string {
  return typeof value === 'string' ? value.trim().slice(0, maxLength) : ''
}

function parseQuantity(value: unknown): number {
  const quantity = value === undefined || value === null ? 1 : Number(value)
  if (!Number.isInteger(quantity) || quantity < 1 || quantity > MAX_QUANTITY) {
    throw new OrderValidationError('Neplatné množství produktu')
  }
  return quantity
}

function sanitizeVariant(variant: any): PricedOrderItem['variant'] {
  if (!variant || typeof variant !== 'object') return null
  const value = cleanString(variant.value, MAX_VARIANT_LENGTH)
  if (!value) return null
  return { name: cleanString(variant.name, 50) || 'Varianta', value }
}

function priceSubscription(item: any): PricedOrderItem {
  const plan = Number(item.plan) as SubscriptionPlan
  const braType = item.braType
  const withGarters = item.withGarters === true

  if (!SUBSCRIPTION_PLANS.includes(plan) || (braType !== 'wired' && braType !== 'bralette')) {
    throw new OrderValidationError('Neplatná konfigurace předplatného')
  }

  // Míry ukládáme jako variantu, aby se dostaly do objednávky i do adminu
  const measurements = item.measurements || {}
  const size = cleanString(measurements.size, 30)
  const group = cleanString(measurements.group, 30)
  const pantiesSize = cleanString(measurements.pantiesSize, 30)
  const parts = [
    size && `Podprsenka: ${size}`,
    braType === 'wired' && group && `Košíček: ${group}`,
    pantiesSize && `Kalhotky: ${pantiesSize}`,
  ].filter(Boolean)

  return {
    productId: null,
    name: getSubscriptionName(braType, withGarters, plan),
    quantity: parseQuantity(item.quantity),
    price: getSubscriptionPrice(braType, withGarters, plan),
    variant: parts.length > 0 ? { name: 'Míry', value: parts.join(', ') } : null,
  }
}

async function priceProductItems(items: any[]): Promise<Map<any, PricedOrderItem>> {
  if (items.length === 0) return new Map()

  const productIds = [...new Set(items.map((item) => item.productId))]
  if (productIds.some((id) => typeof id !== 'string' || !id)) {
    throw new OrderValidationError('Neplatný produkt v košíku')
  }

  const products = await prisma.product.findMany({ where: { id: { in: productIds } } })
  const productsById = new Map(products.map((product) => [product.id, product]))

  const result = new Map<any, PricedOrderItem>()
  for (const item of items) {
    const product = productsById.get(item.productId)
    if (!product) {
      throw new OrderValidationError('Některý z produktů v košíku již není dostupný')
    }

    let price = product.price
    if (product.isSet) {
      let config: SetConfiguration
      try {
        config = JSON.parse(product.setOptions || '{}')
      } catch {
        throw new OrderValidationError(`Produkt ${product.name} nelze momentálně objednat`)
      }

      const requestedBraType = item.setSelection?.braType
      const braType = config.braType === 'both' ? requestedBraType : config.braType
      if (braType !== 'bralette' && braType !== 'wired') {
        throw new OrderValidationError(`Neplatná varianta setu ${product.name}`)
      }
      const withGarters = config.hasGartersOption ? item.setSelection?.hasGarters === true : false
      price = getActivePrice(config, braType, withGarters)
    }

    if (!(price > 0)) {
      throw new OrderValidationError(`Produkt ${product.name} nelze momentálně objednat`)
    }

    result.set(item, {
      productId: product.id,
      name: product.name,
      quantity: parseQuantity(item.quantity),
      price,
      variant: sanitizeVariant(item.variant),
    })
  }
  return result
}

/**
 * Přepočítá objednávku na serveru. Při neplatných datech vyhodí OrderValidationError.
 */
export async function priceOrder(data: any): Promise<PricedOrder> {
  const rawItems = data?.items
  if (!Array.isArray(rawItems) || rawItems.length === 0 || rawItems.length > MAX_ITEMS) {
    throw new OrderValidationError('Neplatný obsah košíku')
  }
  if (rawItems.some((item) => !item || typeof item !== 'object')) {
    throw new OrderValidationError('Neplatný obsah košíku')
  }

  const shippingMethod = data?.shipping?.method as ShippingMethod
  const paymentMethod = data?.payment?.method as PaymentMethod
  if (!ALLOWED_PAYMENT_METHODS[shippingMethod]?.includes(paymentMethod)) {
    throw new OrderValidationError('Neplatná kombinace dopravy a platby')
  }

  const productItems = rawItems.filter((item) => item.type !== 'subscription')
  const pricedProducts = await priceProductItems(productItems)

  // Zachováme pořadí položek z košíku
  const items = rawItems.map((item) =>
    item.type === 'subscription' ? priceSubscription(item) : pricedProducts.get(item)!
  )

  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const shippingCost = getShippingPrice(shippingMethod, subtotal)
  const paymentFee = getPaymentFee(paymentMethod)

  return {
    items,
    subtotal,
    shippingMethod,
    shippingCost,
    paymentMethod,
    paymentFee,
    total: subtotal + shippingCost + paymentFee,
  }
}
