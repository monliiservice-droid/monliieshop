import { NextRequest, NextResponse } from 'next/server'
import { adminErrorResponse, badRequest, unauthorizedResponse } from '@/lib/admin-api'
import { writeSetting } from '@/lib/site-settings-server'
import {
  MAX_NOTIFICATION_EMAILS,
  NOTIFICATION_EMAILS_KEY,
  getEnvNotificationEmails,
  getStoredNotificationEmails,
  parseEmailList,
} from '@/lib/notification-emails'

export async function GET() {
  const denied = await unauthorizedResponse()
  if (denied) return denied
  return NextResponse.json({ emails: await getStoredNotificationEmails(), envEmails: getEnvNotificationEmails() })
}

export async function PUT(request: NextRequest) {
  const denied = await unauthorizedResponse()
  if (denied) return denied

  const body = await request.json().catch(() => null)
  const { emails, invalid } = parseEmailList(body?.emails)
  if (invalid.length > 0) return badRequest(`Neplatná e-mailová adresa: ${invalid.join(', ')}`)
  if (emails.length > MAX_NOTIFICATION_EMAILS) return badRequest(`Nejvýše ${MAX_NOTIFICATION_EMAILS} adres`)

  try {
    await writeSetting(NOTIFICATION_EMAILS_KEY, emails)
    return NextResponse.json({ emails })
  } catch (err) {
    return adminErrorResponse(err, 'Adresy se nepodařilo uložit')
  }
}
