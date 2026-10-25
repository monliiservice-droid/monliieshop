// Komu chodí upozornění na nové objednávky a zprávy z kontaktního formuláře.
// Adresy se spravují v Administraci → Nastavení → Upozornění; dokud tam nic není,
// použije se proměnná SELLER_EMAIL (může obsahovat víc adres oddělených čárkou).

import { prisma } from './prisma'

export const NOTIFICATION_EMAILS_KEY = 'notificationEmails'
export const MAX_NOTIFICATION_EMAILS = 10

const EMAIL_REGEX = /^[^\s@<>,;]+@[^\s@<>,;]+\.[^\s@<>,;]+$/

/** Seznam adres z pole nebo textu (oddělené čárkou, středníkem či novým řádkem); neplatné vrátí zvlášť */
export function parseEmailList(input: unknown): { emails: string[]; invalid: string[] } {
  const parts = Array.isArray(input) ? input : typeof input === 'string' ? input.split(/[,;\n]/) : []
  const emails: string[] = []
  const invalid: string[] = []
  for (const part of parts) {
    const email = typeof part === 'string' ? part.trim().toLowerCase() : ''
    if (!email) continue
    if (!EMAIL_REGEX.test(email) || email.length > 254) invalid.push(email)
    else if (!emails.includes(email)) emails.push(email)
  }
  return { emails, invalid }
}

/** Adresy uložené v administraci (bez záložní proměnné prostředí) */
export async function getStoredNotificationEmails(): Promise<string[]> {
  try {
    const row = await prisma.settings.findUnique({ where: { key: NOTIFICATION_EMAILS_KEY } })
    return row ? parseEmailList(JSON.parse(row.value)).emails : []
  } catch (error) {
    console.error('Error reading notification emails:', error)
    return []
  }
}

export function getEnvNotificationEmails(): string[] {
  return parseEmailList(process.env.SELLER_EMAIL || '').emails
}

/** Adresy pro upozornění – z administrace, jinak ze SELLER_EMAIL */
export async function getNotificationEmails(): Promise<string[]> {
  const stored = await getStoredNotificationEmails()
  return stored.length > 0 ? stored : getEnvNotificationEmails()
}
