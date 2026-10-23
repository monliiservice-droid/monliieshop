// Rezervace a uvolnění skladu a slevových kódů pro objednávky.
// Volá se uvnitř transakce, aby se objednávka, sklad i použití kódu změnily společně.

import type { Prisma } from '@prisma/client'
import { OrderValidationError, type PricedOrder } from './order-pricing'

type Tx = Prisma.TransactionClient

// Stavy, ve kterých objednávka nedrží zboží ani slevový kód
export const RELEASED_STATUSES = ['rejected', 'cancelled']

type StockTarget = { productId: string; variant: { size: string; color: string } | null }

/** Řádek skladu – varianta (velikost × barva), nebo celý produkt */
function stockWhere(target: StockTarget) {
  return target.variant
    ? { model: 'variant' as const, where: { productId: target.productId, size: target.variant.size, color: target.variant.color } }
    : { model: 'product' as const, where: { id: target.productId } }
}

async function changeStock(tx: Tx, target: StockTarget, delta: number, condition?: { gte?: number; equals?: number }) {
  const { model, where } = stockWhere(target)
  const data = { stock: delta >= 0 ? { increment: delta } : { decrement: -delta } }
  const fullWhere = condition ? { ...where, stock: condition } : where
  const { count } = model === 'variant'
    ? await tx.productVariant.updateMany({ where: fullWhere, data })
    : await tx.product.updateMany({ where: fullWhere, data })
  return count
}

async function readStock(tx: Tx, target: StockTarget): Promise<number | null> {
  const { model, where } = stockWhere(target)
  const row = model === 'variant'
    ? await tx.productVariant.findFirst({ where, select: { stock: true } })
    : await tx.product.findFirst({ where, select: { stock: true } })
  return row ? row.stock : null
}

/** Sklad produktu se skladem po variantách je součtem variant */
async function syncProductStock(tx: Tx, productId: string) {
  const { _sum, _count } = await tx.productVariant.aggregate({ where: { productId }, _sum: { stock: true }, _count: true })
  if (_count > 0) {
    await tx.product.updateMany({ where: { id: productId }, data: { stock: Math.max(0, _sum.stock ?? 0) } })
  }
}

/**
 * Odečte sklad a započítá použití slevového kódu. Podmínky ve `where` zajistí,
 * že ani při souběžných objednávkách nepůjde sklad do mínusu a kód se nepřečerpá.
 * U produktů na zakázku se ze skladu vezme, co tam je, a zbytek se ušije.
 * Vrací pro každou položku objednávky počet kusů odebraných ze skladu.
 */
export async function reserveOrderResources(tx: Tx, priced: PricedOrder): Promise<number[]> {
  const reserved: number[] = []
  const touched = new Set<string>()

  for (const item of priced.items) {
    if (!item.productId) {
      reserved.push(0)
      continue
    }
    const target: StockTarget = { productId: item.productId, variant: item.stockVariant }

    if (!item.allowBackorder) {
      if ((await changeStock(tx, target, -item.quantity, { gte: item.quantity })) === 0) {
        const label = [item.name, item.stockVariant?.size, item.stockVariant?.color].filter(Boolean).join(' – ')
        throw new OrderValidationError(`${label} již není skladem v požadovaném množství`)
      }
      reserved.push(item.quantity)
    } else {
      // Optimistický zámek: odečteme jen pokud se sklad mezitím nezměnil, jinak zkusíme znovu
      let taken = 0
      for (let attempt = 0; attempt < 5; attempt++) {
        const stock = await readStock(tx, target)
        const take = Math.min(Math.max(stock ?? 0, 0), item.quantity)
        if (take === 0) break
        if ((await changeStock(tx, target, -take, { equals: stock! })) > 0) {
          taken = take
          break
        }
      }
      reserved.push(taken)
    }
    if (item.stockVariant) touched.add(item.productId)
  }

  for (const productId of touched) await syncProductStock(tx, productId)

  if (priced.discount) {
    const { count } = await tx.discountCode.updateMany({
      where: {
        id: priced.discount.id,
        isActive: true,
        ...(priced.discount.maxUses !== null && { usedCount: { lt: priced.discount.maxUses } }),
      },
      data: {
        usedCount: { increment: 1 },
        totalRevenue: { increment: priced.total },
      },
    })
    if (count === 0) {
      throw new OrderValidationError('Slevový kód byl mezitím vyčerpán', 'DISCOUNT_INVALID')
    }
  }

  return reserved
}

interface OrderStockItem {
  productId: string | null
  quantity: number
  variantSize: string | null
  variantColor: string | null
  stockReserved: number | null
}

/**
 * Vrátí (direction 1) nebo znovu odebere (-1) kusy, které objednávka vzala ze skladu.
 * Kusy na zakázku sklad neovlivňují. Starší objednávky bez údaje berou celé množství.
 */
async function moveOrderStock(tx: Tx, items: OrderStockItem[], direction: 1 | -1) {
  const touched = new Set<string>()
  for (const item of items) {
    const amount = item.stockReserved ?? item.quantity
    if (!item.productId || amount <= 0) continue
    const variant = item.variantSize !== null || item.variantColor !== null
      ? { size: item.variantSize ?? '', color: item.variantColor ?? '' }
      : null
    // updateMany nespadne, pokud byl produkt nebo varianta mezitím smazán(a)
    const count = await changeStock(tx, { productId: item.productId, variant }, direction * amount)
    if (variant && count > 0) touched.add(item.productId)
    else if (variant) await changeStock(tx, { productId: item.productId, variant: null }, direction * amount)
  }
  for (const productId of touched) await syncProductStock(tx, productId)
}

/**
 * Vrátí zboží na sklad a uvolní použití slevového kódu (při odmítnutí/zrušení objednávky).
 */
export async function releaseOrderResources(
  tx: Tx,
  order: {
    discountCode: string | null
    totalAmount: number
    items: OrderStockItem[]
  }
) {
  await moveOrderStock(tx, order.items, 1)

  if (order.discountCode) {
    await tx.discountCode.updateMany({
      where: { code: order.discountCode, usedCount: { gt: 0 } },
      data: {
        usedCount: { decrement: 1 },
        totalRevenue: { decrement: order.totalAmount },
      },
    })
  }
}

/**
 * Opak releaseOrderResources – když admin vrátí zrušenou objednávku zpět do běhu.
 * Sklad se odečte bez kontroly dostupnosti – rozhodnutí admina má přednost.
 */
export async function reclaimOrderResources(
  tx: Tx,
  order: {
    discountCode: string | null
    totalAmount: number
    items: OrderStockItem[]
  }
) {
  await moveOrderStock(tx, order.items, -1)

  if (order.discountCode) {
    await tx.discountCode.updateMany({
      where: { code: order.discountCode },
      data: {
        usedCount: { increment: 1 },
        totalRevenue: { increment: order.totalAmount },
      },
    })
  }
}
