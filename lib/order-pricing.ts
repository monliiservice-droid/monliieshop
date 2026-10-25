// Serverový přepočet objednávky. Ceny, názvy, dopravu i poplatky bere výhradně
// z databáze a ceníků v `lib/pricing.ts`, ne z dat poslaných prohlížečem.

import { prisma } from './prisma'
import { getActivePrice, type SetConfiguration } from './set-config-types'
import { calculateDiscountAmount, findValidDiscountCode } from './discount'
import { getCategoryTree, getEffectiveSizeType } from './categories'
import { findVariant, parseSizeOptions, primarySizeField, productSizeFields, resolveSizeType } from './product-stock'
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
  /** Skladová varianta (velikost × barva); null = sklad celého produktu */
  stockVariant: { size: string; color: string } | null
  /** Co není skladem, lze objednat na zakázku */
  allowBackorder: boolean
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
    stockVariant: null,
    allowBackorder: true,
  }
}

async function priceProductItems(items: any[]): Promise<Map<any, PricedOrderItem>> {
  if (items.length === 0) return new Map()

  const productIds = [...new Set(items.map((item) => item.productId))]
  if (productIds.some((id) => typeof id !== 'string' || !id)) {
    throw new OrderValidationError('Neplatný produkt v košíku')
  }

  const [products, tree, sales] = await Promise.all([
    prisma.product.findMany({
      where: { id: { in: productIds }, isVisible: true },
      include: { variants: { select: { size: true, color: true, stock: true } } },
    }),
    getCategoryTree(),
    getActiveSales(),
  ])
  const productsById = new Map(products.map((product) => [product.id, product]))

  const result = new Map<any, PricedOrderItem>()
  for (const item of items) {
    const product = productsById.get(item.productId)
    if (!product) {
      throw new OrderValidationError('Některý z produktů v košíku již není dostupný')
    }

    let price = product.price
    let setBraType: 'bralette' | 'wired' | undefined
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
      setBraType = braType
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

    // Zvolené velikosti musí patřit mezi velikosti, které produkt nabízí
    const sizeType = resolveSizeType(product, getEffectiveSizeType(tree, product.categoryId))
    const sizes: Record<string, unknown> = item.sizes && typeof item.sizes === 'object' ? item.sizes : {}
    for (const field of productSizeFields(sizeType, parseSizeOptions(product.sizeOptions), setBraType)) {
      const chosen = sizes[field.name]
      if (chosen !== undefined && chosen !== '' && !field.options.includes(chosen as string)) {
        throw new OrderValidationError(`Zvolená velikost produktu ${product.name} není dostupná`)
      }
    }

    // Sklad po variantách: najdeme variantu podle hlavní velikosti a barvy
    let stockVariant: PricedOrderItem['stockVariant'] = null
    if (product.variants.length > 0) {
      const primary = primarySizeField(sizeType)
      const size = primary && typeof sizes[primary] === 'string' ? (sizes[primary] as string) : ''
      const color = typeof item.color === 'string' ? item.color : ''
      if (!findVariant(product.variants, size, color)) {
        throw new OrderValidationError(
          `Zvolená varianta produktu ${product.name} (${[size, color].filter(Boolean).join(', ') || 'bez varianty'}) není dostupná. Odeberte ji prosím z košíku a vyberte znovu.`
        )
      }
      stockVariant = { size, color }
    }

    result.set(item, {
      productId: product.id,
      name: product.name,
      quantity: parseQuantity(item.quantity),
      price,
      variant: sanitizeVariant(item.variant),
      stockVariant,
      allowBackorder: product.allowBackorder,
    })
  }

  // Kontrola skladu (součet přes všechny řádky stejné varianty) u produktů, které se prodávají jen ze skladu.
  // Závazné odečtení probíhá atomicky až při vytváření objednávky.
  const requested = new Map<string, { item: PricedOrderItem; stock: number; quantity: number }>()
  for (const priced of result.values()) {
    if (priced.allowBackorder) continue
    const product = productsById.get(priced.productId!)!
    const key = [priced.productId, priced.stockVariant?.size, priced.stockVariant?.color].join('\u0000')
    const stock = priced.stockVariant
      ? findVariant(product.variants, priced.stockVariant.size, priced.stockVariant.color)!.stock
      : product.stock
    const entry = requested.get(key)
    requested.set(key, { item: priced, stock, quantity: (entry?.quantity || 0) + priced.quantity })
  }
  for (const { item, stock, quantity } of requested.values()) {
    if (stock < quantity) {
      const label = [item.name, item.stockVariant?.size, item.stockVariant?.color].filter(Boolean).join(' – ')
      throw new OrderValidationError(
        stock > 0 ? `${label} je skladem pouze v počtu ${stock} ks` : `${label} již není skladem`
      )
    }
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

export type CartQuote = { price: number } | { error: string }

/**
 * Aktuální cena každé položky košíku (nebo důvod, proč ji nelze objednat).
 * Košík si drží cenu z doby přidání; po změně ceny nebo konci výprodeje by jinak
 * server objednávku odmítal kvůli rozdílné částce a zákazník by se zasekl.
 */
export async function quoteCartItems(rawItems: unknown): Promise<CartQuote[]> {
  if (!Array.isArray(rawItems) || rawItems.length > MAX_ITEMS) {
    throw new OrderValidationError('Neplatný obsah košíku')
  }
  const subscriptionEnabled = rawItems.some((item) => item?.type === 'subscription')
    ? (await getShopSettings()).subscriptionEnabled
    : false

  return Promise.all(
    rawItems.map(async (item): Promise<CartQuote> => {
      try {
        if (!item || typeof item !== 'object') throw new OrderValidationError('Neplatná položka košíku')
        if (item.type === 'subscription') {
          if (!subscriptionEnabled) throw new OrderValidationError('Předplatné momentálně nenabízíme')
          return { price: priceSubscription(item).price }
        }
        const priced = await priceProductItems([item])
        return { price: priced.get(item)!.price }
      } catch (error) {
        if (error instanceof OrderValidationError) return { error: error.message }
        throw error
      }
    })
  )
}
