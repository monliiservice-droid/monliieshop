import type { Section, SectionDataMap } from '@/lib/sections'
import {
  CategoryTilesSection,
  ContactSection,
  SubscriptionSection,
  CustomImageSection,
  HeroSection,
  ImageTextSection,
  InstagramSection,
  ProductCarouselSection,
  ReviewsSection,
  SaleBannerSection,
  StoriesSection,
  TextSection,
  ValuesSection,
} from './sections'

/**
 * Vykreslí viditelné sekce stránky v pořadí z shop builderu.
 * firstTitleIsPageTitle: stránka nemá hlavičku, nadpis první textové sekce je hlavní nadpis (h1).
 */
export function RenderSections({ sections, firstTitleIsPageTitle = false }: { sections: Section[]; firstTitleIsPageTitle?: boolean }) {
  const visible = sections.filter((s) => s.isVisible)
  return (
    <>
      {visible.map((section, index) => {
        const key = section.id
        switch (section.type) {
          case 'hero':
            return <HeroSection key={key} data={section.data as SectionDataMap['hero']} priority={index === 0} />
          case 'categoryTiles':
            return <CategoryTilesSection key={key} data={section.data as SectionDataMap['categoryTiles']} />
          case 'productCarousel':
            return <ProductCarouselSection key={key} data={section.data as SectionDataMap['productCarousel']} />
          case 'imageText':
            return <ImageTextSection key={key} data={section.data as SectionDataMap['imageText']} />
          case 'values':
            return <ValuesSection key={key} data={section.data as SectionDataMap['values']} />
          case 'saleBanner':
            return <SaleBannerSection key={key} data={section.data as SectionDataMap['saleBanner']} />
          case 'stories':
            return <StoriesSection key={key} data={section.data as SectionDataMap['stories']} />
          case 'reviews':
            return <ReviewsSection key={key} data={section.data as SectionDataMap['reviews']} />
          case 'instagram':
            return <InstagramSection key={key} data={section.data as SectionDataMap['instagram']} />
          case 'text':
            return <TextSection key={key} data={section.data as SectionDataMap['text']} asPageTitle={firstTitleIsPageTitle && index === 0} />
          case 'contact':
            return <ContactSection key={key} data={section.data as SectionDataMap['contact']} />
          case 'subscription':
            return <SubscriptionSection key={key} />
          case 'customImage':
            return <CustomImageSection key={key} data={section.data as SectionDataMap['customImage']} />
          default:
            return null
        }
      })}
    </>
  )
}
