import type { Metadata } from 'next'
import { getPageSections } from '@/lib/sections-server'
import { RenderSections } from '@/components/sections/render-sections'

// Obsah stránky se upravuje v Obsahu webu; po uložení se obnoví okamžitě
export const revalidate = 300

export const metadata: Metadata = {
  title: 'Reklamační řád | Monlii - Podmínky reklamace',
  description: 'Kompletní reklamační řád pro produkty z Monlii e-shopu. Informace o záruce, postupu při reklamaci a vašich právech jako spotřebitele.',
  keywords: ['reklamace monlii', 'reklamační řád', 'záruka', 'vrácení zboží', 'výměna produktu'],
  openGraph: {
    title: 'Reklamační řád | Monlii',
    description: 'Informace o reklamacích a záruce produktů Monlii.',
    url: '/reklamace',
    images: ['/story_4.jpg'],
  },
}

export default async function ComplaintsPage() {
  return <RenderSections sections={await getPageSections('reklamace')} firstTitleIsPageTitle />
}
