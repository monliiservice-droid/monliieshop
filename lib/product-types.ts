// Definice kategorií produktů
export const PRODUCT_CATEGORIES = {
  BRA_WIRED: 'Podprsenka s kosticí',
  BRA_BRALETTE: 'Braletka',
  PANTIES: 'Kalhotky',
  GARTERS: 'Podvazky',
  SET_WIRED_WITH_GARTERS: 'Set s kosticí s podvazky',
  SET_WIRED_WITHOUT_GARTERS: 'Set s kosticí bez podvazků',
  SET_BRALETTE_WITH_GARTERS: 'Set s braletkou s podvazky',
  SET_BRALETTE_WITHOUT_GARTERS: 'Set s braletkou bez podvazků',
  OTHER: 'Ostatní'
} as const

// Kategorie organizované do skupin pro lepší zobrazení
export const CATEGORY_GROUPS = [
  {
    label: 'Podprsenky',
    categories: [
      { key: 'BRA_WIRED', value: PRODUCT_CATEGORIES.BRA_WIRED },
      { key: 'BRA_BRALETTE', value: PRODUCT_CATEGORIES.BRA_BRALETTE }
    ]
  },
  {
    label: 'Sety s kosticí',
    categories: [
      { key: 'SET_WIRED_WITH_GARTERS', value: PRODUCT_CATEGORIES.SET_WIRED_WITH_GARTERS },
      { key: 'SET_WIRED_WITHOUT_GARTERS', value: PRODUCT_CATEGORIES.SET_WIRED_WITHOUT_GARTERS }
    ]
  },
  {
    label: 'Sety s braletkou',
    categories: [
      { key: 'SET_BRALETTE_WITH_GARTERS', value: PRODUCT_CATEGORIES.SET_BRALETTE_WITH_GARTERS },
      { key: 'SET_BRALETTE_WITHOUT_GARTERS', value: PRODUCT_CATEGORIES.SET_BRALETTE_WITHOUT_GARTERS }
    ]
  },
  {
    label: 'Samostatné',
    categories: [
      { key: 'PANTIES', value: PRODUCT_CATEGORIES.PANTIES },
      { key: 'GARTERS', value: PRODUCT_CATEGORIES.GARTERS }
    ]
  },
  {
    label: 'Ostatní',
    categories: [
      { key: 'OTHER', value: PRODUCT_CATEGORIES.OTHER }
    ]
  }
]

export type ProductCategory = typeof PRODUCT_CATEGORIES[keyof typeof PRODUCT_CATEGORIES]

// Velikosti pro různé typy produktů
export const SIZE_OPTIONS = {
  // Pro podprsenky (s kosticí i braletky)
  BRA_SIZE: ['XS', 'S', 'M', 'L', 'XL'] as const,
  BRA_CUP: ['MINI', 'SOFT', 'BALANCED', 'FULL', 'MAXI'] as const,
  
  // Pro kalhotky, podvazky
  STANDARD_SIZE: ['XS', 'S', 'M', 'L', 'XL'] as const,
  
  // Pro sety - kombinace obou
  SET_SIZES: {
    braSize: ['XS', 'S', 'M', 'L', 'XL'] as const,
    braCup: ['MINI', 'SOFT', 'BALANCED', 'FULL', 'MAXI'] as const,
    pantiesSize: ['XS', 'S', 'M', 'L', 'XL'] as const,
  }
} as const

// Funkce pro získání velikostí podle kategorie
export function getSizeOptionsForCategory(category: string): {
  fields: Array<{
    name: string
    label: string
    options: readonly string[]
  }>
} {
  switch (category) {
    case PRODUCT_CATEGORIES.BRA_WIRED:
      return {
        fields: [
          {
            name: 'braSize',
            label: 'Velikost podprsenky',
            options: SIZE_OPTIONS.BRA_SIZE
          },
          {
            name: 'braCup',
            label: 'Velikost košíčku',
            options: SIZE_OPTIONS.BRA_CUP
          }
        ]
      }
    
    case PRODUCT_CATEGORIES.BRA_BRALETTE:
      return {
        fields: [
          {
            name: 'braSize',
            label: 'Velikost',
            options: SIZE_OPTIONS.BRA_SIZE
          }
        ]
      }
    
    case PRODUCT_CATEGORIES.PANTIES:
    case PRODUCT_CATEGORIES.GARTERS:
      return {
        fields: [
          {
            name: 'size',
            label: 'Velikost',
            options: SIZE_OPTIONS.STANDARD_SIZE
          }
        ]
      }
    
    case PRODUCT_CATEGORIES.SET_WIRED_WITH_GARTERS:
    case PRODUCT_CATEGORIES.SET_WIRED_WITHOUT_GARTERS:
      return {
        fields: [
          {
            name: 'braSize',
            label: 'Velikost podprsenky',
            options: SIZE_OPTIONS.SET_SIZES.braSize
          },
          {
            name: 'braCup',
            label: 'Velikost košíčku',
            options: SIZE_OPTIONS.SET_SIZES.braCup
          },
          {
            name: 'pantiesSize',
            label: 'Velikost kalhotek',
            options: SIZE_OPTIONS.SET_SIZES.pantiesSize
          }
        ]
      }
    
    case PRODUCT_CATEGORIES.SET_BRALETTE_WITH_GARTERS:
    case PRODUCT_CATEGORIES.SET_BRALETTE_WITHOUT_GARTERS:
      return {
        fields: [
          {
            name: 'braSize',
            label: 'Velikost podprsenky',
            options: SIZE_OPTIONS.SET_SIZES.braSize
          },
          {
            name: 'pantiesSize',
            label: 'Velikost kalhotek',
            options: SIZE_OPTIONS.SET_SIZES.pantiesSize
          }
        ]
      }
    
    case PRODUCT_CATEGORIES.OTHER:
    default:
      return {
        fields: []
      }
  }
}

// Labels pro zobrazení
export const SIZE_LABELS = {
  // Košíčky
  MINI: 'MINI',
  SOFT: 'SOFT',
  BALANCED: 'BALANCED',
  FULL: 'FULL',
  MAXI: 'MAXI'
}
