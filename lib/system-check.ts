// Kontrola, že je e-shop připravený přijímat objednávky: nastavení na Vercelu (proměnné prostředí),
// databáze a údaje v administraci. Zobrazuje se v Administraci → Kontrola e-shopu.

import { prisma } from './prisma'
import { isMissingMigrationError } from './admin-api'
import { verifyEmailTransport } from './email'
import { getNotificationEmails } from './notification-emails'

export type CheckStatus = 'ok' | 'warn' | 'error'

export interface SystemCheck {
  label: string
  status: CheckStatus
  detail: string
  /** Co udělat, když kontrola neprošla */
  fix?: string
}

export interface CheckGroup {
  title: string
  checks: SystemCheck[]
}

const env = (name: string) => process.env[name]?.trim() || ''

const VERCEL_ENV_FIX = 'Vercel → projekt → Settings → Environment Variables (prostředí Production), pak Redeploy.'

function envCheck(name: string, label: string, detailWhenSet: string, missing: { status: CheckStatus; detail: string }): SystemCheck {
  return env(name)
    ? { label, status: 'ok', detail: detailWhenSet }
    : { label, status: missing.status, detail: missing.detail, fix: `Nastavte ${name}: ${VERCEL_ENV_FIX}` }
}

async function databaseChecks(): Promise<SystemCheck[]> {
  const checks: SystemCheck[] = []
  try {
    // Sloupce z poslední migrace – když chybí, Prisma vyhodí P2021/P2022
    await Promise.all([
      prisma.productVariant.findFirst({ select: { size: true, color: true } }),
      prisma.orderItem.findFirst({ select: { stockReserved: true } }),
      prisma.product.findFirst({ select: { allowBackorder: true, hideWhenSoldOut: true } }),
    ])
    checks.push({ label: 'Databáze', status: 'ok', detail: 'Připojeno, všechny migrace proběhly.' })
  } catch (error) {
    checks.push(
      isMissingMigrationError(error)
        ? { label: 'Databáze', status: 'error', detail: 'Chybí migrace – objednávky neprojdou.', fix: 'Spusťte `npx prisma migrate deploy` proti produkční databázi.' }
        : { label: 'Databáze', status: 'error', detail: 'Nepodařilo se připojit k databázi.', fix: 'Zkontrolujte DATABASE_URL a DIRECT_URL ve Vercelu.' }
    )
    return checks
  }

  const [visible, orderable, company] = await Promise.all([
    prisma.product.count({ where: { isVisible: true } }),
    prisma.product.count({ where: { isVisible: true, OR: [{ stock: { gt: 0 } }, { allowBackorder: true }] } }),
    prisma.companySettings.findFirst(),
  ])
  checks.push(
    orderable > 0
      ? { label: 'Produkty k objednání', status: 'ok', detail: `${orderable} z ${visible} viditelných produktů jde objednat.` }
      : { label: 'Produkty k objednání', status: 'error', detail: `Žádný viditelný produkt není skladem ani na zakázku (viditelných: ${visible}).`, fix: 'Doplňte sklad nebo zapněte prodej na zakázku v Produktech.' }
  )

  const companyComplete = company && company.companyName && company.ico && company.street && company.city && company.zip
  checks.push(
    companyComplete
      ? { label: 'Fakturační údaje', status: 'ok', detail: `${company.companyName}, IČO ${company.ico}. Další faktura: ${company.invoicePrefix}${company.nextInvoiceNum}.` }
      : { label: 'Fakturační údaje', status: 'error', detail: 'Nejsou vyplněné – u platby QR kódem se nevystaví faktura.', fix: 'Vyplňte je v Nastavení → Fakturace.' }
  )
  return checks
}

async function emailChecks(): Promise<SystemCheck[]> {
  const host = env('MAILTRAP_HOST')
  const checks: SystemCheck[] = []

  if (!host || host.includes('sandbox')) {
    checks.push({
      label: 'SMTP server',
      status: 'error',
      detail: host
        ? `${host} je testovací schránka Mailtrapu – e-maily se zákazníkům ani vám nedoručí.`
        : 'MAILTRAP_HOST není nastavený – použije se testovací schránka a e-maily se nedoručí.',
      fix: 'V Mailtrapu použijte Email Sending (ne Email Testing): host live.smtp.mailtrap.io, port 587, uživatel a heslo ze sekce Sending Domains → SMTP. Nastavte MAILTRAP_HOST, MAILTRAP_PORT, MAILTRAP_USER, MAILTRAP_PASS ve Vercelu.',
    })
  } else {
    checks.push({ label: 'SMTP server', status: 'ok', detail: `${host}:${env('MAILTRAP_PORT') || '2525'}` })
  }

  if (env('MAILTRAP_USER') && env('MAILTRAP_PASS')) {
    const result = await Promise.race([
      verifyEmailTransport(),
      new Promise<{ ok: false; error: string }>((resolve) => setTimeout(() => resolve({ ok: false, error: 'server neodpověděl do 12 s' }), 12_000)),
    ])
    checks.push(
      result.ok
        ? { label: 'Přihlášení k SMTP', status: 'ok', detail: 'Server přijal přihlašovací údaje.' }
        : { label: 'Přihlášení k SMTP', status: 'error', detail: `Nepodařilo se přihlásit: ${result.error}`, fix: 'Zkontrolujte MAILTRAP_HOST, MAILTRAP_PORT, MAILTRAP_USER a MAILTRAP_PASS ve Vercelu.' }
    )
  } else {
    checks.push({ label: 'Přihlášení k SMTP', status: 'error', detail: 'Chybí MAILTRAP_USER nebo MAILTRAP_PASS.', fix: VERCEL_ENV_FIX })
  }

  const from = env('EMAIL_FROM')
  checks.push(
    from
      ? { label: 'Odesílatel', status: 'ok', detail: `${from} – doména musí být v Mailtrapu ověřená (Sending Domains).` }
      : { label: 'Odesílatel', status: 'warn', detail: 'EMAIL_FROM není nastavený, použije se noreply@monlii.cz.', fix: `Nastavte EMAIL_FROM na adresu z ověřené domény. ${VERCEL_ENV_FIX}` }
  )
  const recipients = await getNotificationEmails()
  checks.push(
    recipients.length > 0
      ? { label: 'Upozornění na objednávky', status: 'ok', detail: `Chodí na: ${recipients.join(', ')}` }
      : {
          label: 'Upozornění na objednávky',
          status: 'error',
          detail: 'Není nastavená žádná adresa – upozornění na nové objednávky chodí na prodejce@monlii.cz.',
          fix: 'Přidejte adresy v Nastavení → Upozornění.',
        }
  )
  return checks
}

function paymentAndShippingChecks(): SystemCheck[] {
  // Bez proměnných se použije výchozí účet e-shopu z lib/qr-payment.ts (ověřený jako správný)
  const custom = env('BANK_ACCOUNT_NUMBER') && env('BANK_CODE')
  const account = custom ? `${env('BANK_ACCOUNT_NUMBER')}/${env('BANK_CODE')}` : '7843801238/6363'
  return [
    {
      label: 'Účet pro QR platby',
      status: 'ok',
      detail: `${account}${custom ? ' (z nastavení ve Vercelu)' : ' (výchozí účet e-shopu)'}`,
    },
    envCheck('ZASILKOVNA_API_KEY', 'Mapa Zásilkovny (Z-BOX)', 'API klíč je nastavený.', {
      status: 'error',
      detail: 'Chybí API klíč – zákazník nevybere Z-BOX a nemůže objednat s doručením.',
    }),
  ]
}

function otherChecks(): SystemCheck[] {
  const url = env('NEXT_PUBLIC_URL')
  return [
    url
      ? { label: 'Adresa webu', status: url.startsWith('https://') ? 'ok' : 'warn', detail: `${url} – používá se v odkazech v e-mailech.` }
      : { label: 'Adresa webu', status: 'warn', detail: 'NEXT_PUBLIC_URL není nastavená, použije se https://monlii.cz.', fix: VERCEL_ENV_FIX },
    envCheck('BLOB_READ_WRITE_TOKEN', 'Nahrávání fotek', 'Úložiště Vercel Blob je připojené.', {
      status: 'warn',
      detail: 'Chybí BLOB_READ_WRITE_TOKEN – v adminu nepůjdou nahrávat fotky.',
    }),
    envCheck('CRON_SECRET', 'E-maily s žádostí o recenzi', 'Denní odesílání je zabezpečené.', {
      status: 'warn',
      detail: 'CRON_SECRET není nastavený – e-maily s žádostí o recenzi se neposílají.',
    }),
  ]
}

export async function runSystemChecks(): Promise<CheckGroup[]> {
  const [database, email] = await Promise.all([databaseChecks(), emailChecks()])
  return [
    { title: 'Databáze a obchod', checks: database },
    { title: 'E-maily', checks: email },
    { title: 'Platba a doprava', checks: paymentAndShippingChecks() },
    { title: 'Ostatní', checks: otherChecks() },
  ]
}
