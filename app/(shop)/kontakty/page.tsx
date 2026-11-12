import type { Metadata } from 'next'
import { getPageHeaders } from '@/lib/site-settings-server'
import { getPageSections } from '@/lib/sections-server'
import { PageHero } from '@/components/site/page-hero'
import { RenderSections } from '@/components/sections/render-sections'

// Obsah stránky se upravuje v Obsahu webu; po uložení se obnoví okamžitě
export const revalidate = 300

export const metadata: Metadata = {
  title: 'Kontakty | Monlii',
  description: 'Napište nám nebo zavolejte. Objednávky si můžete vyzvednout na výdejních místech v Havířově a ve Frenštátu pod Radhoštěm.',
  alternates: { canonical: '/kontakty' },
}

export default async function ContactPage() {
  const [headers, sections] = await Promise.all([getPageHeaders(), getPageSections('kontakty')])
  const header = headers['kontakty']

  return (
    <>
      <PageHero eyebrow={header.eyebrow} title={header.title} subtitle={header.subtitle} image={header.image} />
      <RenderSections sections={sections} />
    </>
  )
}
