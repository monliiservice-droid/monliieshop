import type { Metadata } from 'next'
import { getPageSections } from '@/lib/sections-server'
import { RenderSections } from '@/components/sections/render-sections'

// Obsah stránky se upravuje v Obsahu webu; po uložení se obnoví okamžitě
export const revalidate = 300

export const metadata: Metadata = {
  title: 'Doprava a platba | Monlii - Informace o doručení',
  description: 'Doprava zdarma nad 2500 Kč do Z-BOXu Zásilkovny. Osobní odběr zdarma v Havířově nebo Frenštátě. Platba QR kódem nebo na dobírku.',
  keywords: ['doprava monlii', 'zásilkovna', 'z-box', 'osobní odběr', 'QR platba', 'dobírka', 'havířov', 'frenštát'],
  openGraph: {
    title: 'Doprava a platba | Monlii',
    description: 'Doprava zdarma nad 2500 Kč do Z-BOXu. Platba QR kódem nebo na dobírku.',
    url: '/doprava',
    images: ['/story_4.jpg'],
  },
}

export default async function ShippingPage() {
  return <RenderSections sections={await getPageSections('doprava')} firstTitleIsPageTitle />
}
