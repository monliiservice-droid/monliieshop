// Nastavení obchodu a hlaviček stránek – ukládá se do tabulky Settings (klíč → JSON).
// Typy a výchozí hodnoty jsou sdílené s klientem (admin formuláře).

export type ProductCardStyle = 'classic' | 'minimal' | 'overlay'

export interface ShopSettings {
  subscriptionEnabled: boolean
  productCardStyle: ProductCardStyle
  productGridColumns: 2 | 3 | 4
  announcement: {
    enabled: boolean
    text: string
    link: string
  }
}

export interface PageHeader {
  eyebrow: string
  title: string
  subtitle: string
  image: string
}

export type PageHeaderKey = 'obchod' | 'o-nas' | 'kontakty' | 'predplatne' | 'vyprodej'

export type PageHeaders = Record<PageHeaderKey, PageHeader>

export const PAGE_HEADER_LABELS: Record<PageHeaderKey, string> = {
  obchod: 'Obchod',
  'o-nas': 'O nás',
  kontakty: 'Kontakty',
  predplatne: 'Předplatné',
  vyprodej: 'Výprodeje (výchozí hlavička)',
}

export const DEFAULT_SHOP_SETTINGS: ShopSettings = {
  subscriptionEnabled: false,
  productCardStyle: 'classic',
  productGridColumns: 4,
  announcement: {
    enabled: true,
    text: 'Doprava zdarma do Z-BOXu při nákupu nad 2 500 Kč',
    link: '/obchod',
  },
}

export const DEFAULT_PAGE_HEADERS: PageHeaders = {
  obchod: {
    eyebrow: 'Obchod',
    title: 'Šité pro ženy, muže i děti',
    subtitle: 'Prádlo a oblečení z české dílny – každý kus vzniká ručně, v malých sériích.',
    image: '/hero_section_alternative_2.jpg',
  },
  'o-nas': {
    eyebrow: 'O nás',
    title: 'Rodinná dílna s láskou k řemeslu',
    subtitle: 'Šijeme s láskou k tělu i přírodě – pomalu, poctivě a v Česku.',
    image: '/about_us.jpg',
  },
  kontakty: {
    eyebrow: 'Kontakty',
    title: 'Ozvěte se nám',
    subtitle: 'Rády poradíme s velikostí, materiálem i šitím na míru.',
    image: '/story_1.jpg',
  },
  predplatne: {
    eyebrow: 'Předplatné',
    title: 'Nové prádlo každý měsíc',
    subtitle: 'Vyberte si délku předplatného a my se postaráme o zbytek.',
    image: '/story_2.jpg',
  },
  vyprodej: {
    eyebrow: 'Výprodej',
    title: 'Akční nabídka',
    subtitle: 'Vybrané kousky za nižší cenu – jen po omezenou dobu.',
    image: '/story_4.jpg',
  },
}

export const SHOP_SETTINGS_KEY = 'shop'
export const PAGE_HEADERS_KEY = 'pageHeaders'

/** Sloučí uložené hodnoty s výchozími – chybějící klíče (např. po přidání nové volby) se doplní. */
export function mergeShopSettings(stored: unknown): ShopSettings {
  const value = (stored && typeof stored === 'object' ? stored : {}) as Partial<ShopSettings>
  return {
    ...DEFAULT_SHOP_SETTINGS,
    ...value,
    announcement: { ...DEFAULT_SHOP_SETTINGS.announcement, ...(value.announcement || {}) },
  }
}

export function mergePageHeaders(stored: unknown): PageHeaders {
  const value = (stored && typeof stored === 'object' ? stored : {}) as Partial<PageHeaders>
  const result = { ...DEFAULT_PAGE_HEADERS }
  for (const key of Object.keys(DEFAULT_PAGE_HEADERS) as PageHeaderKey[]) {
    result[key] = { ...DEFAULT_PAGE_HEADERS[key], ...(value[key] || {}) }
  }
  return result
}
