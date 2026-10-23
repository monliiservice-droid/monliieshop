// Rezervace a uvolnění skladu a slevových kódů pro objednávky.
// Volá se uvnitř transakce, aby se objednávka, sklad i použití kódu změnily společně.

import type { Prisma } from '@prisma/client'
import { OrderValidationError, type PricedOrder } from './order-pricing'

type Tx = Prisma.TransactionClient

// Stavy, ve kterých objednávka nedrží zboží ani slevový kód
export const RELEASED_STATUSES = ['rejected', 'cancelled']

/**
 * Odečte sklad a započítá použití slevového kódu. Podmínky ve `where` zajistí,
 * že ani při souběžných objednávkách nepůjde sklad do mínusu a kód se nepřečerpá.
 */
export async function reserveOrderResources(tx: Tx, priced: PricedOrder) {
  const quantities = new Map<string, { name: string; quantity: number }>()
  for (const item of priced.items) {
    if (!item.productId) continue
    const current = quantities.get(item.productId)
    quantities.set(item.productId, {
      name: item.name,
      quantity: (current?.quantity || 0) + item.quantity,
    })
  }

  for (const [productId, { name, quantity }] of quantities) {
    const { count } = await tx.product.updateMany({
      where: { id: productId, stock: { gte: quantity } },
      data: { stock: { decrement: quantity } },
    })
    if (count === 0) {
      throw new OrderValidationError(`Produkt ${name} již není skladem v požadovaném množství`)
    }
  }

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
}

/**
 * Vrátí zboží na sklad a uvolní použití slevového kódu (při odmítnutí/zrušení objednávky).
 */
export async function releaseOrderResources(
  tx: Tx,
  order: {
    discountCode: string | null
    totalAmount: number
    items: { productId: string | null; quantity: number }[]
  }
) {
  for (const item of order.items) {
    if (!item.productId) continue
    // updateMany nespadne, pokud byl produkt mezitím smazán
    await tx.product.updateMany({
      where: { id: item.productId },
      data: { stock: { increment: item.quantity } },
    })
  }

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
    items: { productId: string | null; quantity: number }[]
  }
) {
  for (const item of order.items) {
    if (!item.productId) continue
    await tx.product.updateMany({
      where: { id: item.productId },
      data: { stock: { decrement: item.quantity } },
    })
  }

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
