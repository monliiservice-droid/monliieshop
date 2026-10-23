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
