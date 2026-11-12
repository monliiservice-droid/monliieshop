import type { Metadata } from 'next'
import { getPageSections } from '@/lib/sections-server'
import { RenderSections } from '@/components/sections/render-sections'

// Obsah stránky se upravuje v Obsahu webu; po uložení se obnoví okamžitě
export const revalidate = 300

export const metadata: Metadata = {
  title: 'Ochrana osobních údajů | Monlii - GDPR a soukromí',
  description: 'Informace o zpracování a ochraně vašich osobních údajů v souladu s GDPR. Zjistěte, jak nakládáme s vašimi daty při nákupu v Monlii e-shopu.',
  keywords: ['ochrana osobních údajů', 'GDPR', 'zpracování údajů', 'soukromí', 'cookies'],
  openGraph: {
    title: 'Ochrana osobních údajů | Monlii',
    description: 'Informace o zpracování a ochraně vašich osobních údajů v souladu s GDPR.',
    url: '/ochrana-osobnich-udaju',
    images: ['/story_4.jpg'],
  },
}

export default async function PrivacyPolicyPage() {
  return <RenderSections sections={await getPageSections('ochrana-osobnich-udaju')} firstTitleIsPageTitle />
}
