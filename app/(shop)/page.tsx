import type { Metadata } from 'next'
import { RenderSections } from '@/components/sections/render-sections'
import { getPageSections } from '@/lib/sections-server'
import { ThreadPath } from '@/components/site/thread-path'

// Homepage se skládá ze sekcí z adminu (Obsah webu); po uložení se obnoví okamžitě
export const revalidate = 300

export const metadata: Metadata = { alternates: { canonical: '/' } }

export default async function HomePage() {
  const sections = await getPageSections('home')
  return (
    <div className="relative">
      <RenderSections sections={sections} />
      <ThreadPath />
    </div>
  )
}
