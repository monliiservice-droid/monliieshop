// Shop builder – typy sekcí, jejich data a výchozí rozložení homepage.
// Sdílené mezi serverem (vykreslení) a administrací (editor).

export type ButtonLink = { text: string; link: string }

export interface HeroData {
  eyebrow: string
  title: string
  subtitle: string
  image: string
  mobileImage: string
  primary: ButtonLink
  secondary: ButtonLink
  align: 'left' | 'center'
  height: 'tall' | 'medium'
}

export interface CategoryTilesData {
  eyebrow: string
  title: string
  items: { label: string; caption: string; link: string; image: string }[]
}

export interface ProductCarouselData {
  eyebrow: string
  title: string
  source: 'newest' | 'featured' | 'sale' | 'category'
  categoryId: string
  limit: number
  layout: 'carousel' | 'grid'
  link: ButtonLink
}

export interface ImageTextData {
  eyebrow: string
  title: string
  text: string
  image: string
  imagePosition: 'left' | 'right'
  button: ButtonLink
}

export interface ValuesData {
  eyebrow: string
  title: string
  items: { title: string; text: string }[]
}

export interface SaleBannerData {
  saleId: string // prázdné = první aktivní výprodej
  eyebrow: string
  title: string // prázdné = název výprodeje
  text: string // prázdné = popis výprodeje
  image: string // prázdné = banner výprodeje
  buttonText: string
}

export interface StoriesData {
  eyebrow: string
  title: string
  items: { name: string; role: string; text: string; image: string }[]
}

export interface ReviewsData {
  eyebrow: string
  title: string
  items: { name: string; product: string; text: string }[]
}

export interface InstagramData {
  eyebrow: string
  title: string
  handle: string
  link: string
  items: { image: string; url: string }[]
}

export interface TextData {
  eyebrow: string
  title: string
  text: string
  align: 'left' | 'center'
}

export interface CustomImageData {
  image: string
  mobileImage: string
  alt: string
  link: string
  width: 'full' | 'container'
  spacing: 'none' | 'normal'
}

export interface SectionDataMap {
  hero: HeroData
  categoryTiles: CategoryTilesData
  productCarousel: ProductCarouselData
  imageText: ImageTextData
  values: ValuesData
  saleBanner: SaleBannerData
  stories: StoriesData
  reviews: ReviewsData
  instagram: InstagramData
  text: TextData
  customImage: CustomImageData
}

export type SectionType = keyof SectionDataMap

export interface Section<T extends SectionType = SectionType> {
  id: string
  type: T
  isVisible: boolean
  sortOrder: number
  data: SectionDataMap[T]
}

export const SECTION_TYPE_LABELS: Record<SectionType, { label: string; description: string }> = {
  hero: { label: 'Úvodní banner', description: 'Velká fotka s nadpisem a tlačítky' },
  categoryTiles: { label: 'Dlaždice kategorií', description: 'Rozcestník např. Ženy / Muži / Děti' },
  productCarousel: { label: 'Produkty', description: 'Novinky, doporučené, výprodej nebo kategorie' },
  imageText: { label: 'Fotka + text', description: 'Příběh, kolekce, informace' },
  values: { label: 'Hodnoty', description: 'Krátké body (ruční výroba, česká dílna…)' },
  saleBanner: { label: 'Výprodej', description: 'Banner aktivní výprodejové akce' },
  stories: { label: 'Příběhy', description: 'Příběhy zákaznic a zákazníků s fotkou' },
  reviews: { label: 'Recenze', description: 'Krátké citace zákazníků' },
  instagram: { label: 'Instagram', description: 'Fotky z Instagramu s odkazy' },
  text: { label: 'Text', description: 'Samostatný odstavec textu' },
  customImage: { label: 'Vlastní grafika', description: 'Vlastní obrázek (např. z Canvy) v SVG nebo PNG' },
}

export const SECTION_TYPES = Object.keys(SECTION_TYPE_LABELS) as SectionType[]

export const DEFAULT_SECTION_DATA: SectionDataMap = {
  hero: {
    eyebrow: 'Ruční výroba z české dílny',
    title: 'Šité s láskou k tělu i přírodě',
    subtitle: 'Prádlo a oblečení pro ženy, muže i děti. Malé série, poctivé materiály a střihy, které sedí.',
    image: '/hero_section_alternative_2.jpg',
    mobileImage: '',
    primary: { text: 'Nakupovat', link: '/obchod' },
    secondary: { text: 'Náš příběh', link: '/o-nas' },
    align: 'left',
    height: 'tall',
  },
  categoryTiles: {
    eyebrow: 'Pro koho šijeme',
    title: 'Vyberte si svou kolekci',
    items: [
      { label: 'Ženy', caption: 'Prádlo, sety a oblečení', link: '/obchod/zeny', image: '/story_2.jpg' },
      // Bez fotky se dlaždice zobrazí jako typografická karta – fotku doplňte v Obsahu webu
      { label: 'Muži', caption: 'Pohodlí na každý den', link: '/obchod/muzi', image: '' },
      { label: 'Děti', caption: 'Měkké materiály pro malé', link: '/obchod/deti', image: '' },
    ],
  },
  productCarousel: {
    eyebrow: 'Čerstvě ušité',
    title: 'Novinky',
    source: 'newest',
    categoryId: '',
    limit: 8,
    layout: 'carousel',
    link: { text: 'Zobrazit vše', link: '/obchod' },
  },
  imageText: {
    eyebrow: 'Náš příběh',
    title: 'Rodinná dílna, kde vzniká každý kus ručně',
    text: 'Monlii je rodinná značka. Každý kousek vzniká v rukách zkušené švadleny a nese s sebou kus české tradice.\n\nVěříme, že oblečení má být nejen krásné, ale hlavně pohodlné – proto dbáme na kvalitu materiálů a precizní zpracování každého detailu.',
    image: '/about_us.jpg',
    imagePosition: 'left',
    button: { text: 'Více o nás', link: '/o-nas' },
  },
  values: {
    eyebrow: 'Proč Monlii',
    title: 'Pomalá móda, která vydrží',
    items: [
      { title: 'Ruční výroba', text: 'Žádná masová výroba – každý kus ušijeme ručně s péčí o detail.' },
      { title: 'Česká dílna', text: 'Navazujeme na českou švadlenskou tradici a podporujeme lokální výrobu.' },
      { title: 'Originalita', text: 'Malé série a vlastní vzory. Každý kousek má své vlastní kouzlo.' },
    ],
  },
  saleBanner: {
    saleId: '',
    eyebrow: 'Výprodej',
    title: '',
    text: '',
    image: '',
    buttonText: 'Nakoupit ve výprodeji',
  },
  stories: {
    eyebrow: 'Příběhy',
    title: 'Lidé, kteří nosí Monlii',
    items: [
      {
        name: 'Agáta',
        role: 'Tvář Monlii',
        text: 'Mám trochu větší velikost, takže vždycky oceňuju, když prádlo opravdu sedí a drží tam, kde má. Když jsem poprvé vyzkoušela Monlii, byla jsem nadšená — pohodlné, krásné a v originálních vzorech, které v běžných obchodech nenajdu.',
        image: '/story_1.jpg',
      },
      {
        name: 'Terez',
        role: 'Modelka a zákaznice',
        text: 'Přístup holek, atmosféra i samotné prádlo… všechno působilo osobně, lidsky a hlavně pohodlně. Od té doby už nejsem jen modelka na fotkách — jsem i jejich stálá zákaznice.',
        image: '/story_2.jpg',
      },
      {
        name: 'Natka',
        role: 'Šité na míru',
        text: 'Jsem drobnější postavy s větší velikostí prsou. Když jsem si u Monlii nechala ušít prádlo na míru, poprvé v životě jsem měla pocit, že se myslí i na ženy jako jsem já.',
        image: '/story_3_new.jpg',
      },
      {
        name: 'Lucka',
        role: 'Zakladatelka',
        text: 'Dlouho jsem byla ten typ, který prádlo neřeší. Až když mamka začala šít, pochopila jsem, že oblečení není jen věc ve skříni, ale malý každodenní rituál.',
        image: '/story_4.jpg',
      },
    ],
  },
  reviews: {
    eyebrow: 'Recenze',
    title: 'Co o nás říkají',
    items: [
      { name: 'Ester', product: 'Set Dark', text: 'Prádlo je pohodlné, nikde nic neškrtí ani neškrábe. Materiál je na těle příjemný a navíc vypadá opravdu skvěle!' },
      { name: 'Jana', product: 'Bezešvé kalhotky a podprsenka', text: 'Neskutečně mě překvapila rychlost dodání, kvalita a cena. Úžasně sedí, nikde neškrábe a netahá. Objednala jsem si další soupravu.' },
      { name: 'Alena', product: 'Set Smaragd', text: 'Děkuji za krásné kousky! Kvalitně zpracované, příjemné na nošení. Oceňuji rychlost a vstřícnou komunikaci.' },
      { name: 'Viki', product: 'Krajkový set s podvazky', text: 'Prádlo úžasně sedí a každý design je opravdu krásný. Je praktické a pohodlné na celodenní nošení.' },
    ],
  },
  instagram: {
    eyebrow: 'Instagram',
    title: 'Ze zákulisí dílny',
    handle: '@monlii_i',
    link: 'https://www.instagram.com/monlii_i/',
    items: [
      { image: '/instagram/post-1.jpg', url: 'https://www.instagram.com/p/DQsCraPAhTW/' },
      { image: '/instagram/post-2.jpg', url: 'https://www.instagram.com/p/DKrQpFWs5NJ/' },
      { image: '/instagram/post-3.jpg', url: 'https://www.instagram.com/p/DHMQj__MpA5/' },
      { image: '/instagram/post-4.jpg', url: 'https://www.instagram.com/p/DHYlZ1fIjPv/' },
    ],
  },
  text: {
    eyebrow: '',
    title: 'Nadpis',
    text: 'Text sekce.',
    align: 'center',
  },
  customImage: {
    image: '',
    mobileImage: '',
    alt: '',
    link: '',
    width: 'full',
    spacing: 'none',
  },
}

/** Výchozí rozložení homepage (použije se, dokud admin nic neuloží) */
export const DEFAULT_HOME_LAYOUT: { type: SectionType; data?: Partial<SectionDataMap[SectionType]> }[] = [
  { type: 'hero' },
  { type: 'categoryTiles' },
  { type: 'saleBanner' },
  { type: 'productCarousel' },
  { type: 'imageText' },
  { type: 'values' },
  { type: 'stories' },
  { type: 'reviews' },
  { type: 'instagram' },
]

/** Doplní chybějící pole výchozími hodnotami (uložená data mohou být starší verze) */
export function normalizeSectionData<T extends SectionType>(type: T, data: unknown): SectionDataMap[T] {
  const defaults = DEFAULT_SECTION_DATA[type]
  const value = data && typeof data === 'object' && !Array.isArray(data) ? (data as Record<string, unknown>) : {}
  const result: Record<string, unknown> = { ...defaults }
  for (const [key, defaultValue] of Object.entries(defaults)) {
    const stored = value[key]
    if (stored === undefined || stored === null) continue
    if (Array.isArray(defaultValue)) {
      if (Array.isArray(stored)) result[key] = stored
    } else if (typeof defaultValue === 'object' && defaultValue !== null) {
      if (typeof stored === 'object') result[key] = { ...defaultValue, ...(stored as object) }
    } else if (typeof stored === typeof defaultValue) {
      result[key] = stored
    }
  }
  return result as unknown as SectionDataMap[T]
}

export function isSectionType(value: unknown): value is SectionType {
  return typeof value === 'string' && value in SECTION_TYPE_LABELS
}
