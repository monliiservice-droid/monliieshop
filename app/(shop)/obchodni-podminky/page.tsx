import type { Metadata } from 'next'
import { getPageSections } from '@/lib/sections-server'
import { RenderSections } from '@/components/sections/render-sections'

// Obsah stránky se upravuje v Obsahu webu; po uložení se obnoví okamžitě
export const revalidate = 300

export const metadata: Metadata = {
  title: 'Obchodní podmínky | Monlii - VOP e-shopu',
  description: 'Všeobecné obchodní podmínky pro nákup v Monlii e-shopu. Informace o objednávání, platbě, dopravě a odstoupení od smlouvy.',
  keywords: ['obchodní podmínky monlii', 'VOP', 'podmínky nákupu', 'odstoupení od smlouvy', 'nákupní podmínky'],
  openGraph: {
    title: 'Obchodní podmínky | Monlii',
    description: 'Všeobecné obchodní podmínky pro nákup v Monlii e-shopu.',
    url: '/obchodni-podminky',
    images: ['/story_4.jpg'],
  },
}

export default async function TermsPage() {
  return <RenderSections sections={await getPageSections('obchodni-podminky')} firstTitleIsPageTitle />
}
