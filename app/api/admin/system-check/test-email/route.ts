import { NextResponse } from 'next/server'
import { requireAdminAuth } from '@/lib/auth'
import { sendTestEmail } from '@/lib/email'

export const dynamic = 'force-dynamic'

// Pošle testovací e-mail na adresu prodejce (SELLER_EMAIL)
export async function POST() {
  if (!(await requireAdminAuth())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const to = process.env.SELLER_EMAIL?.trim()
  if (!to) {
    return NextResponse.json({ message: 'Není nastavený SELLER_EMAIL – není kam e-mail poslat.' }, { status: 400 })
  }
  const result = await sendTestEmail(to)
  return result.ok
    ? NextResponse.json({ message: `Testovací e-mail odeslán na ${to}. Zkontrolujte schránku (i spam).` })
    : NextResponse.json({ message: `Odeslání selhalo: ${result.error}` }, { status: 502 })
}
