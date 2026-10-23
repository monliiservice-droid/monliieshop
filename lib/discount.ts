import type { DiscountCode } from '@prisma/client'
import { prisma } from './prisma'

export { calculateDiscountAmount } from './pricing'

export type DiscountCheck =
  | { valid: true; discountCode: DiscountCode }
  | { valid: false; message: string; status: number }

/**
 * Najde a ověří slevový kód pro danou částku zboží (bez dopravy a poplatků).
 */
export async function findValidDiscountCode(code: unknown, orderAmount: number): Promise<DiscountCheck> {
  if (typeof code !== 'string' || !code.trim()) {
    return { valid: false, message: 'Slevový kód je povinný', status: 400 }
  }

  const discountCode = await prisma.discountCode.findUnique({
    where: { code: code.trim().toUpperCase() }
  })

  if (!discountCode) {
    return { valid: false, message: 'Slevový kód nebyl nalezen', status: 404 }
  }

  if (!discountCode.isActive) {
    return { valid: false, message: 'Slevový kód již není aktivní', status: 400 }
  }

  const now = new Date()
  if (discountCode.validFrom && discountCode.validFrom > now) {
    return { valid: false, message: 'Slevový kód ještě není platný', status: 400 }
  }

  if (discountCode.validUntil && discountCode.validUntil < now) {
    return { valid: false, message: 'Platnost slevového kódu již vypršela', status: 400 }
  }

  if (discountCode.maxUses !== null && discountCode.usedCount >= discountCode.maxUses) {
    return { valid: false, message: 'Slevový kód byl již využit maximální počet krát', status: 400 }
  }

  if (discountCode.minAmount && orderAmount < discountCode.minAmount) {
    return {
      valid: false,
      message: `Minimální částka objednávky pro tento kód je ${discountCode.minAmount} Kč`,
      status: 400
    }
  }

  return { valid: true, discountCode }
}
