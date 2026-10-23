// Nabídka písem pro web (výběr v Nastavení → Obchod). Vlastní načtení písem je v lib/fonts.ts.

export type FontKey =
  | 'cormorant'
  | 'playfair'
  | 'fraunces'
  | 'dmserif'
  | 'bodoni'
  | 'lora'
  | 'manrope'
  | 'inter'
  | 'dmsans'
  | 'worksans'
  | 'nunitosans'

export interface FontOption {
  key: FontKey
  label: string
  style: string
  /** CSS proměnná, kterou nastavuje next/font */
  cssVar: string
}

export const FONT_OPTIONS: Record<FontKey, FontOption> = {
  cormorant: { key: 'cormorant', label: 'Cormorant Garamond', style: 'Elegantní patkové (jako logo)', cssVar: '--font-cormorant' },
  playfair: { key: 'playfair', label: 'Playfair Display', style: 'Kontrastní patkové, módní', cssVar: '--font-playfair' },
  fraunces: { key: 'fraunces', label: 'Fraunces', style: 'Měkké patkové s charakterem', cssVar: '--font-fraunces' },
  dmserif: { key: 'dmserif', label: 'DM Serif Display', style: 'Výrazné patkové', cssVar: '--font-dmserif' },
  bodoni: { key: 'bodoni', label: 'Bodoni Moda', style: 'Klasické módní (časopisové)', cssVar: '--font-bodoni' },
  lora: { key: 'lora', label: 'Lora', style: 'Čitelné patkové', cssVar: '--font-lora' },
  manrope: { key: 'manrope', label: 'Manrope', style: 'Moderní bezpatkové', cssVar: '--font-manrope' },
  inter: { key: 'inter', label: 'Inter', style: 'Neutrální bezpatkové', cssVar: '--font-inter' },
  dmsans: { key: 'dmsans', label: 'DM Sans', style: 'Geometrické bezpatkové', cssVar: '--font-dmsans' },
  worksans: { key: 'worksans', label: 'Work Sans', style: 'Přátelské bezpatkové', cssVar: '--font-worksans' },
  nunitosans: { key: 'nunitosans', label: 'Nunito Sans', style: 'Zaoblené bezpatkové', cssVar: '--font-nunitosans' },
}

export const HEADING_FONTS: FontKey[] = ['cormorant', 'playfair', 'fraunces', 'dmserif', 'bodoni', 'lora', 'manrope']
export const BODY_FONTS: FontKey[] = ['manrope', 'inter', 'dmsans', 'worksans', 'nunitosans', 'lora']

export const DEFAULT_HEADING_FONT: FontKey = 'cormorant'
export const DEFAULT_BODY_FONT: FontKey = 'manrope'

export function isFontKey(value: unknown): value is FontKey {
  return typeof value === 'string' && value in FONT_OPTIONS
}

/** Inline styl pro obal stránky – přepne písmo nadpisů a textu */
export function fontStyle(headingFont: FontKey, bodyFont: FontKey): Record<string, string> {
  return {
    '--font-heading': `var(${FONT_OPTIONS[headingFont].cssVar})`,
    '--font-body': `var(${FONT_OPTIONS[bodyFont].cssVar})`,
  }
}
