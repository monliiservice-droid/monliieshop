// SEO nastavení webu (Nastavení → SEO) – texty pro výsledky vyhledávání, klíčová slova,
// ověřovací kódy vyhledávačů a údaje o firmě pro strukturovaná data (Google, AI asistenti).
// Sdílené mezi serverem a administrací.

export interface SeoSettings {
  /** Titulek homepage ve výsledcích vyhledávání (ideálně do 60 znaků) */
  title: string
  /** Popis homepage ve výsledcích vyhledávání (ideálně 120–160 znaků) */
  description: string
  /** Klíčová slova oddělená čárkou – použijí se v meta keywords a v popisu firmy pro AI (llms.txt) */
  keywords: string
  /** Obrázek pro sdílení na sociálních sítích (1200 × 630 px) */
  shareImage: string
  /** Krátký popis firmy pro AI asistenty a strukturovaná data */
  about: string
  email: string
  phone: string
  instagram: string
  facebook: string
  /** Odkaz na firemní profil Google (Mapy) – propojí web s profilem */
  googleBusinessUrl: string
  /** Obsah meta značky google-site-verification (jen když neověřujete přes DNS) */
  googleVerification: string
  /** Obsah meta značky seznam-wmt (Seznam Webmaster) */
  seznamVerification: string
  /** Obsah meta značky msvalidate.01 (Bing Webmaster – i pro ChatGPT a Copilot) */
  bingVerification: string
}

export const SEO_SETTINGS_KEY = 'seo'

export const DEFAULT_SEO_SETTINGS: SeoSettings = {
  title: 'Monlii – slow fashion z české rodinné dílny',
  description:
    'Oblečení a prádlo pro ženy, muže i děti z přírodních a certifikovaných materiálů (bavlna, bambus, OEKO-TEX®). Česká malosériová výroba, šetrnější k přírodě.',
  keywords:
    'slow fashion, udržitelná móda, ekologické oblečení, oblečení z bambusu, bavlněné oblečení, OEKO-TEX, česká výroba, české oblečení, rodinná značka, dámské oblečení, pánské oblečení, dětské oblečení, spodní prádlo, prádlo na míru, Frenštát pod Radhoštěm, Havířov',
  shareImage: '/story_4.jpg',
  about:
    'Monlii je malá česká rodinná značka – maminka a její dvě dcery. Tvoří v duchu slow fashion oblečení a prádlo pro ženy, muže i děti: v malých sériích, s důrazem na kvalitu, pohodlí a nadčasové střihy. Vybírá převážně přírodní a certifikované materiály (bavlna, bambusový úplet, OEKO-TEX® STANDARD 100), visačky jsou z rostoucího papíru. Prodává přes e-shop monlii.cz s dopravou do Z-BOXu Zásilkovny a osobním odběrem ve Frenštátu pod Radhoštěm a v Havířově.',
  email: 'monlli@seznam.cz',
  phone: '+420 702 559 369',
  instagram: 'https://www.instagram.com/monlii_i/',
  facebook: 'https://www.facebook.com/monlii.cz',
  googleBusinessUrl: '',
  googleVerification: '',
  seznamVerification: '',
  bingVerification: '',
}

export function mergeSeoSettings(stored: unknown): SeoSettings {
  const value = stored && typeof stored === 'object' ? (stored as Record<string, unknown>) : {}
  const result = { ...DEFAULT_SEO_SETTINGS }
  for (const key of Object.keys(DEFAULT_SEO_SETTINGS) as (keyof SeoSettings)[]) {
    if (typeof value[key] === 'string') result[key] = (value[key] as string).trim().slice(0, 2000)
  }
  return result
}

/** Klíčová slova jako seznam */
export function keywordList(settings: SeoSettings): string[] {
  return settings.keywords.split(/[,\n]/).map((k) => k.trim()).filter(Boolean)
}

/** Ověřovací kód z celé vložené meta značky nebo jen z hodnoty content */
export function verificationCode(value: string): string {
  const match = value.match(/content=["']([^"']+)["']/)
  return (match ? match[1] : value).trim()
}
