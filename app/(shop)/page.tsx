import { RenderSections } from '@/components/sections/render-sections'
import { getPageSections } from '@/lib/sections-server'

// Homepage se skládá ze sekcí z adminu (Obsah webu); po uložení se obnoví okamžitě
export const revalidate = 300

export default async function HomePage() {
  const sections = await getPageSections('home')
  return <RenderSections sections={sections} />
}
