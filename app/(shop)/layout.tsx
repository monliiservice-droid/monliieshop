import { SiteHeader } from '@/components/site/site-header'
import { SiteFooter } from '@/components/site/site-footer'
import { CookieConsent } from '@/components/cookie-consent'

export default function ShopLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-linen text-ink">
      <SiteHeader />
      <main className="flex-1">{children}</main>
      <SiteFooter />
      <CookieConsent />
    </div>
  )
}
