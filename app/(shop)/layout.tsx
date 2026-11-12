import { SiteHeader } from '@/components/site/site-header'
import { SiteFooter } from '@/components/site/site-footer'
import { CookieConsent } from '@/components/cookie-consent'
import { getSeoSettings, getShopSettings } from '@/lib/site-settings-server'
import { SiteStructuredData } from '@/components/site/structured-data'
import { fontStyle } from '@/lib/font-options'

export default async function ShopLayout({ children }: { children: React.ReactNode }) {
  const [settings, seo] = await Promise.all([getShopSettings(), getSeoSettings()])
  return (
    // Písmo nadpisů a textu se volí v Nastavení → Obchod
    <div className="flex min-h-screen flex-col bg-linen font-sans text-ink" style={fontStyle(settings.headingFont, settings.bodyFont)}>
      <SiteStructuredData seo={seo} />
      <SiteHeader />
      <main className="flex-1">{children}</main>
      <SiteFooter />
      <CookieConsent />
    </div>
  )
}
