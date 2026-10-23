// Serverový přepočet objednávky. Ceny, názvy, dopravu i poplatky bere výhradně
// z databáze a ceníků v `lib/pricing.ts`, ne z dat poslaných prohlížečem.

import { prisma } from './prisma'
import { getActivePrice, type SetConfiguration } from './set-config-types'
import { calculateDiscountAmount, findValidDiscountCode } from './discount'
import { getCategoryTree } from './categories'
import { findBestSale, getActiveSales } from './sales'
import { getShopSettings } from './site-settings-server'
import {
  ALLOWED_PAYMENT_METHODS,
  applySaleDiscount,
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
  discount: { id: string; code: string; maxUses: number | null } | null
  discountAmount: number
  shippingMethod: ShippingMethod
  shippingCost: number
  paymentMethod: PaymentMethod
  paymentFee: number
  total: number
}

export class OrderValidationError extends Error {
  constructor(message: string, public readonly code?: 'DISCOUNT_INVALID') {
    super(message)
  }
}

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

  const [products, tree, sales] = await Promise.all([
    prisma.product.findMany({ where: { id: { in: productIds }, isVisible: true } }),
    getCategoryTree(),
    getActiveSales(),
  ])
  const productsById = new Map(products.map((product) => [product.id, product]))

  // Kontrola skladu (součet množství přes všechny řádky stejného produktu).
  // Závazné odečtení probíhá atomicky až při vytváření objednávky.
  const requestedQuantities = new Map<string, number>()
  for (const item of items) {
    requestedQuantities.set(item.productId, (requestedQuantities.get(item.productId) || 0) + parseQuantity(item.quantity))
  }
  for (const [productId, quantity] of requestedQuantities) {
    const product = productsById.get(productId)
    if (product && product.stock < quantity) {
      throw new OrderValidationError(
        product.stock > 0
          ? `Produkt ${product.name} je skladem pouze v počtu ${product.stock} ks`
          : `Produkt ${product.name} již není skladem`
      )
    }
  }

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

    // Aktivní výprodej snižuje cenu (u setu cenu zvolené varianty)
    const sale = findBestSale(product, sales, tree)
    if (sale) {
      price = applySaleDiscount(price, sale.discountPercent)
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

  const hasSubscription = rawItems.some((item) => item.type === 'subscription')
  if (hasSubscription && !(await getShopSettings()).subscriptionEnabled) {
    throw new OrderValidationError('Předplatné momentálně nenabízíme. Odeberte ho prosím z košíku.')
  }

  const productItems = rawItems.filter((item) => item.type !== 'subscription')
  const pricedProducts = await priceProductItems(productItems)

  // Zachováme pořadí položek z košíku
  const items = rawItems.map((item) =>
    item.type === 'subscription' ? priceSubscription(item) : pricedProducts.get(item)!
  )

  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0)

  // Slevový kód se uplatňuje jen na zboží, ne na dopravu a poplatky
  let discount: PricedOrder['discount'] = null
  let discountAmount = 0
  if (data?.discountCode) {
    const check = await findValidDiscountCode(data.discountCode, subtotal)
    if (!check.valid) {
      throw new OrderValidationError(`Slevový kód nelze uplatnit: ${check.message}`, 'DISCOUNT_INVALID')
    }
    discount = {
      id: check.discountCode.id,
      code: check.discountCode.code,
      maxUses: check.discountCode.maxUses,
    }
    discountAmount = calculateDiscountAmount(check.discountCode, subtotal)
  }

  // Doprava zdarma se počítá z částky po slevě
  const shippingCost = getShippingPrice(shippingMethod, subtotal - discountAmount)
  const paymentFee = getPaymentFee(paymentMethod)

  return {
    items,
    subtotal,
    discount,
    discountAmount,
    shippingMethod,
    shippingCost,
    paymentMethod,
    paymentFee,
    total: subtotal - discountAmount + shippingCost + paymentFee,
  }
}
