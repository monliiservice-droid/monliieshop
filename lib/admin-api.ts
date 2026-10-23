// Pomocné funkce pro admin API routy
import { NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
import { requireAdminAuth } from './auth'

export async function unauthorizedResponse(): Promise<NextResponse | null> {
  return (await requireAdminAuth()) ? null : NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
}

/** Po změně obsahu z adminu obnoví cachované stránky webu */
export function revalidateStorefront() {
  revalidatePath('/', 'layout')
}

export function badRequest(message: string) {
  return NextResponse.json({ message }, { status: 400 })
}

export function cleanText(value: unknown, maxLength = 500): string {
  return typeof value === 'string' ? value.trim().slice(0, maxLength) : ''
}

export function optionalText(value: unknown, maxLength = 500): string | null {
  const text = cleanText(value, maxLength)
  return text || null
}

export function isPrismaUniqueError(error: unknown): boolean {
  return typeof error === 'object' && error !== null && (error as { code?: string }).code === 'P2002'
}

/** Chybí tabulka/sloupec = na databázi nebyla spuštěna migrace */
export function isMissingMigrationError(error: unknown): boolean {
  const code = typeof error === 'object' && error !== null ? (error as { code?: string }).code : undefined
  return code === 'P2021' || code === 'P2022'
}

export const MISSING_MIGRATION_MESSAGE =
  'Databáze není aktualizovaná pro tuto verzi e-shopu. Je potřeba spustit migraci (npx prisma migrate deploy) – návod je v README.'

/** Jednotná chybová odpověď admin API – srozumitelná hláška místo obecné chyby 500 */
export function adminErrorResponse(error: unknown, fallbackMessage: string) {
  if (isMissingMigrationError(error)) {
    console.error('Database schema is out of date (missing migration):', error)
    return NextResponse.json({ message: MISSING_MIGRATION_MESSAGE }, { status: 503 })
  }
  console.error(fallbackMessage, error)
  return NextResponse.json({ message: fallbackMessage }, { status: 500 })
}
