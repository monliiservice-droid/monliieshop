import type { MetadataRoute } from 'next'

// Pozor: /_next/ se nesmí blokovat – jsou v něm styly, skripty a optimalizované obrázky,
// bez kterých Google stránku nevidí celou a obrázky produktů nezaindexuje.
const PRIVATE_PATHS = ['/admin', '/api/', '/kosik', '/checkout', '/souhrn-objednavky', '/faktury']

// AI vyhledávače a asistenti – výslovně povolené, aby mohli e-shop doporučovat a citovat
const AI_CRAWLERS = [
  'GPTBot',
  'OAI-SearchBot',
  'ChatGPT-User',
  'ClaudeBot',
  'Claude-SearchBot',
  'Claude-User',
  'PerplexityBot',
  'Perplexity-User',
  'Google-Extended',
  'Applebot-Extended',
  'Bingbot',
]

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_URL || 'https://monlii.cz'
  return {
    rules: [
      { userAgent: '*', allow: '/', disallow: PRIVATE_PATHS },
      { userAgent: AI_CRAWLERS, allow: '/', disallow: PRIVATE_PATHS },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  }
}
