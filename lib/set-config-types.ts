export interface SetConfiguration {
  hasGartersOption: boolean
  braType: 'bralette' | 'wired' | 'both'
  prices: {
    braletteWithGarters: number
    braletteWithoutGarters: number
    wiredWithGarters: number
    wiredWithoutGarters: number
  }
}

export const DEFAULT_SET_CONFIG: SetConfiguration = {
  hasGartersOption: false,
  braType: 'bralette',
  prices: {
    braletteWithGarters: 0,
    braletteWithoutGarters: 0,
    wiredWithGarters: 0,
    wiredWithoutGarters: 0
  }
}

export function getActivePrice(config: SetConfiguration, braType: 'bralette' | 'wired', withGarters: boolean): number {
  const key = `${braType}${withGarters ? 'With' : 'Without'}Garters` as keyof SetConfiguration['prices']
  return config.prices[key]
}

export function getDisplayPrice(config: SetConfiguration): number {
  // Získat všechny relevantní ceny podle konfigurace
  const allPrices = []
  
  if (config.braType === 'both' || config.braType === 'bralette') {
    if (config.hasGartersOption) {
      allPrices.push(config.prices.braletteWithGarters)
      allPrices.push(config.prices.braletteWithoutGarters)
    } else {
      // Když není možnost podvazků, použít obě varianty (admin může vyplnit kteroukoli)
      allPrices.push(config.prices.braletteWithGarters)
      allPrices.push(config.prices.braletteWithoutGarters)
    }
  }
  
  if (config.braType === 'both' || config.braType === 'wired') {
    if (config.hasGartersOption) {
      allPrices.push(config.prices.wiredWithGarters)
      allPrices.push(config.prices.wiredWithoutGarters)
    } else {
      // Když není možnost podvazků, použít obě varianty (admin může vyplnit kteroukoli)
      allPrices.push(config.prices.wiredWithGarters)
      allPrices.push(config.prices.wiredWithoutGarters)
    }
  }
  
  // Filtrovat pouze nenulové ceny a vzít minimum
  const validPrices = allPrices.filter(p => p && p > 0)
  
  if (validPrices.length === 0) {
    return 0
  }
  
  return Math.min(...validPrices)
}
