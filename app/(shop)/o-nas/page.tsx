import type { Metadata } from 'next'
import { getPageHeaders } from '@/lib/site-settings-server'
import { getPageSections } from '@/lib/sections-server'
import { PageHero } from '@/components/site/page-hero'
import { RenderSections } from '@/components/sections/render-sections'

// Obsah stránky se upravuje v Obsahu webu; po uložení se obnoví okamžitě
export const revalidate = 300

export const metadata: Metadata = {
  title: 'O nás | Monlii',
  description:
    'Monlii je malá česká rodinná značka – maminka a dvě dcery. Tvoříme slow fashion oblečení a prádlo pro ženy, muže i děti z přírodních a certifikovaných materiálů.',
  alternates: { canonical: '/o-nas' },
}

export default async function AboutPage() {
  const [headers, sections] = await Promise.all([getPageHeaders(), getPageSections('o-nas')])
  const header = headers['o-nas']

  return (
    <>
      <PageHero eyebrow={header.eyebrow} title={header.title} subtitle={header.subtitle} image={header.image} />
      <RenderSections sections={sections} />
    </>
  )
}
