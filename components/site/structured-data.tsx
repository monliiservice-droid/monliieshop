import { keywordList, type SeoSettings } from '@/lib/seo-settings'

/** JSON-LD do stránky; "<" escapujeme, aby text z administrace nemohl ukončit <script> */
export function JsonLd({ data }: { data: unknown }) {
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, '\\u003c') }} />
}

/**
 * Strukturovaná data o firmě pro Google a AI asistenty: online obchod a web.
 * Monlii nemá vlastní prodejnu – výdejní místa jsou partnerské obchody, proto je neuvádíme jako pobočky
 * (údaje se musí shodovat s firemním profilem Google).
 */
export function SiteStructuredData({ seo }: { seo: SeoSettings }) {
  const baseUrl = process.env.NEXT_PUBLIC_URL || 'https://monlii.cz'
  const sameAs = [seo.instagram, seo.facebook, seo.googleBusinessUrl].filter((url) => /^https:\/\//.test(url))

  const organization = {
    '@type': ['Organization', 'OnlineStore'],
    '@id': `${baseUrl}/#organization`,
    name: 'Monlii',
    url: baseUrl,
    logo: `${baseUrl}/icon-512.png`,
    image: `${baseUrl}${seo.shareImage.startsWith('/') ? seo.shareImage : '/story_4.jpg'}`,
    description: seo.about,
    ...(seo.email && { email: seo.email }),
    ...(seo.phone && { telephone: seo.phone }),
    ...(sameAs.length > 0 && { sameAs }),
    areaServed: { '@type': 'Country', name: 'Česká republika' },
    currenciesAccepted: 'CZK',
    knowsAbout: keywordList(seo),
    ...(seo.email || seo.phone
      ? {
          contactPoint: {
            '@type': 'ContactPoint',
            contactType: 'customer service',
            availableLanguage: 'cs',
            ...(seo.email && { email: seo.email }),
            ...(seo.phone && { telephone: seo.phone }),
          },
        }
      : {}),
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

  return <JsonLd data={{ '@context': 'https://schema.org', '@graph': [organization, website] }} />
}
