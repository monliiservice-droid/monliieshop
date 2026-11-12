import { PICKUP_LOCATIONS } from '@/lib/pickup-locations'
import { keywordList, type SeoSettings } from '@/lib/seo-settings'

/** JSON-LD do stránky; "<" escapujeme, aby text z administrace nemohl ukončit <script> */
export function JsonLd({ data }: { data: unknown }) {
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, '\\u003c') }} />
}

/**
 * Strukturovaná data o firmě pro Google a AI asistenty: organizace, web a prodejna ve Frenštátě
 * (shodné údaje jako ve firemním profilu Google pomáhají propojit web s profilem).
 */
export function SiteStructuredData({ seo }: { seo: SeoSettings }) {
  const baseUrl = process.env.NEXT_PUBLIC_URL || 'https://monlii.cz'
  const store = PICKUP_LOCATIONS.frenstat
  const sameAs = [seo.instagram, seo.facebook, seo.googleBusinessUrl].filter((url) => /^https:\/\//.test(url))

  const organization = {
    '@type': 'Organization',
    '@id': `${baseUrl}/#organization`,
    name: 'Monlii',
    url: baseUrl,
    logo: `${baseUrl}/icon-512.png`,
    description: seo.about,
    ...(seo.email && { email: seo.email }),
    ...(seo.phone && { telephone: seo.phone }),
    ...(sameAs.length > 0 && { sameAs }),
    knowsAbout: keywordList(seo),
  }

  const website = {
    '@type': 'WebSite',
    '@id': `${baseUrl}/#website`,
    url: baseUrl,
    name: 'Monlii',
    description: seo.description,
    inLanguage: 'cs-CZ',
    publisher: { '@id': `${baseUrl}/#organization` },
  }

  const shop = {
    '@type': 'ClothingStore',
    '@id': `${baseUrl}/#store-frenstat`,
    name: 'Monlii',
    url: baseUrl,
    image: `${baseUrl}${seo.shareImage.startsWith('/') ? seo.shareImage : '/story_4.jpg'}`,
    description: seo.about,
    ...(seo.phone && { telephone: seo.phone }),
    ...(seo.email && { email: seo.email }),
    ...(seo.googleBusinessUrl && { hasMap: seo.googleBusinessUrl }),
    parentOrganization: { '@id': `${baseUrl}/#organization` },
    priceRange: '$$',
    currenciesAccepted: 'CZK',
    address: {
      '@type': 'PostalAddress',
      streetAddress: store.address,
      addressLocality: store.city,
      postalCode: store.zip,
      addressCountry: 'CZ',
    },
    ...(store.openingHours && {
      openingHoursSpecification: store.openingHours.map((h) => ({
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: h.days,
        opens: h.opens,
        closes: h.closes,
      })),
    }),
  }

  return <JsonLd data={{ '@context': 'https://schema.org', '@graph': [organization, website, shop] }} />
}
