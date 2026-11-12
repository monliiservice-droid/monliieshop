import Link from 'next/link'
import { Facebook, Instagram } from 'lucide-react'
import { prisma } from '@/lib/prisma'
import { getSiteNavigation } from '@/lib/navigation'
import { getSeoSettings } from '@/lib/site-settings-server'

async function getCompanyInfo() {
  try {
    return await prisma.companySettings.findFirst({
      select: { companyName: true, ico: true, street: true, city: true, zip: true },
    })
  } catch {
    return null
  }
}

const INFO_LINKS = [
  { label: 'Doprava a platba', href: '/doprava' },
  { label: 'Obchodní podmínky', href: '/obchodni-podminky' },
  { label: 'Reklamace a vrácení', href: '/reklamace' },
  { label: 'Ochrana osobních údajů', href: '/ochrana-osobnich-udaju' },
]

export async function SiteFooter() {
  // Kontakt je jeden pro celý web (Nastavení → SEO), aby se shodoval s firemním profilem Google
  const [navigation, company, seo] = await Promise.all([getSiteNavigation(), getCompanyInfo(), getSeoSettings()])
  const year = new Date().getFullYear()

  return (
    <footer className="mt-24 bg-ink text-linen/80">
      <div className="site-container grid gap-12 py-16 md:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1fr]">
        <div className="space-y-5">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo-light.svg" alt="Monlii" className="h-12 w-auto" />
          <p className="max-w-xs text-sm leading-relaxed">
            Malá rodinná značka. Slow fashion pro ženy, muže i děti z přírodních a certifikovaných materiálů, šité v Česku v malých sériích.
          </p>
          <div className="flex gap-3">
            <a href="https://www.instagram.com/monlii_i/" target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="flex h-10 w-10 items-center justify-center border border-linen/25 transition-colors hover:bg-linen hover:text-ink">
              <Instagram className="h-4 w-4" />
            </a>
            <a href="https://www.facebook.com/monlii.cz" target="_blank" rel="noopener noreferrer" aria-label="Facebook" className="flex h-10 w-10 items-center justify-center border border-linen/25 transition-colors hover:bg-linen hover:text-ink">
              <Facebook className="h-4 w-4" />
            </a>
          </div>
        </div>

        <div>
          <h2 className="eyebrow text-linen/60">Nakupovat</h2>
          <ul className="mt-5 space-y-3 text-sm">
            {navigation.primary.map((item) => (
              <li key={item.href}>
                <Link href={item.href} className="link-line hover:text-linen">{item.label}</Link>
              </li>
            ))}
            {navigation.secondary
              .filter((l) => l.href === '/obchod' || l.href === '/predplatne')
              .map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="link-line hover:text-linen">{link.label === 'Obchod' ? 'Celý obchod' : link.label}</Link>
                </li>
              ))}
          </ul>
        </div>

        <div>
          <h2 className="eyebrow text-linen/60">Informace</h2>
          <ul className="mt-5 space-y-3 text-sm">
            {INFO_LINKS.map((link) => (
              <li key={link.href}>
                <Link href={link.href} className="link-line hover:text-linen">{link.label}</Link>
              </li>
            ))}
            <li>
              <Link href="/o-nas" className="link-line hover:text-linen">O nás</Link>
            </li>
          </ul>
        </div>

        <div>
          <h2 className="eyebrow text-linen/60">Kontakt</h2>
          <ul className="mt-5 space-y-3 text-sm">
            {seo.email && (
              <li>
                <a href={`mailto:${seo.email}`} className="link-line hover:text-linen">{seo.email}</a>
              </li>
            )}
            {seo.phone && (
              <li>
                <a href={`tel:${seo.phone.replace(/\s/g, '')}`} className="link-line hover:text-linen">{seo.phone}</a>
              </li>
            )}
            <li>
              <Link href="/kontakty" className="link-line hover:text-linen">Kontaktní formulář</Link>
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-linen/10">
        <div className="site-container flex flex-col gap-3 py-6 text-xs text-linen/55 md:flex-row md:items-center md:justify-between">
          <p>
            © {year} Monlii
            {company && (
              <>
                {' · '}
                {company.companyName}
                {company.ico && `, IČO ${company.ico}`}
                {company.street && `, ${company.street}, ${company.zip} ${company.city}`}
              </>
            )}
          </p>
          <p>
            Platba QR kódem, dobírkou nebo na prodejně · Doprava Zásilkovnou ·{' '}
            Stránku vytvořil{' '}
            <a href="https://nevymyslis.cz" target="_blank" rel="noopener noreferrer" className="link-line hover:text-linen">Roman Velička z nevymyslis.cz</a>
          </p>
        </div>
      </div>
    </footer>
  )
}
