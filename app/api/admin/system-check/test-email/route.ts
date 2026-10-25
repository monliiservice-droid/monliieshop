import { NextResponse } from 'next/server'
import { requireAdminAuth } from '@/lib/auth'
import { sendTestEmail } from '@/lib/email'
import { getNotificationEmails } from '@/lib/notification-emails'

export const dynamic = 'force-dynamic'

// Pošle testovací e-mail na všechny adresy pro upozornění
export async function POST() {
  if (!(await requireAdminAuth())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const to = (await getNotificationEmails()).join(', ')
  if (!to) {
    return NextResponse.json({ message: 'Nejsou nastavené adresy pro upozornění (Nastavení → Upozornění).' }, { status: 400 })
  }
  const result = await sendTestEmail(to)
  return result.ok
    ? NextResponse.json({ message: `Testovací e-mail odeslán na ${to}. Zkontrolujte schránku (i spam).` })
    : NextResponse.json({ message: `Odeslání selhalo: ${result.error}` }, { status: 502 })
}
