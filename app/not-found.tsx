import { SiteHeader } from '@/components/site/site-header'
import { SiteFooter } from '@/components/site/site-footer'
import { NotFoundContent } from '@/components/site/not-found-content'
import { CookieConsent } from '@/components/cookie-consent'
import { getShopSettings } from '@/lib/site-settings-server'
import { fontStyle } from '@/lib/font-options'

export default async function NotFound() {
  const settings = await getShopSettings()
  return (
    <div className="flex min-h-screen flex-col bg-linen font-sans text-ink" style={fontStyle(settings.headingFont, settings.bodyFont)}>
      <SiteHeader />
      <main className="flex-1">
        <NotFoundContent title="Stránka se nenašla" text="Odkaz je možná starý nebo v něm je překlep. Zkuste to přes menu nebo rovnou do obchodu." />
      </main>
      <SiteFooter />
      <CookieConsent />
    </div>
  )
}
