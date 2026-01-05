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
  if (config.braType === 'both') {
    const prices = [
      config.prices.braletteWithGarters,
      config.prices.braletteWithoutGarters,
      config.prices.wiredWithGarters,
      config.prices.wiredWithoutGarters
    ].filter(p => p > 0)
    return Math.min(...prices)
  } else if (config.braType === 'bralette') {
    if (config.hasGartersOption) {
      return Math.min(config.prices.braletteWithGarters, config.prices.braletteWithoutGarters)
    }
    return config.prices.braletteWithGarters || config.prices.braletteWithoutGarters
  } else {
    if (config.hasGartersOption) {
      return Math.min(config.prices.wiredWithGarters, config.prices.wiredWithoutGarters)
    }
    return config.prices.wiredWithGarters || config.prices.wiredWithoutGarters
  }
}
