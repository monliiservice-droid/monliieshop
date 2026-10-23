// Načtení všech nabízených písem přes next/font. Výchozí písma se přednačítají,
// ostatní ne – prohlížeč je stáhne, jen pokud jsou na webu opravdu použitá.
import {
  Bodoni_Moda,
  Cormorant_Garamond,
  DM_Sans,
  DM_Serif_Display,
  Fraunces,
  Inter,
  Lora,
  Manrope,
  Nunito_Sans,
  Playfair_Display,
  Work_Sans,
} from 'next/font/google'

// next/font vyžaduje volby jako literály (žádné sdílené proměnné)
const manrope = Manrope({ subsets: ['latin', 'latin-ext'], variable: '--font-manrope', display: 'swap' })
const cormorant = Cormorant_Garamond({
  subsets: ['latin', 'latin-ext'],
  variable: '--font-cormorant',
  weight: ['400', '500', '600'],
  style: ['normal', 'italic'],
  display: 'swap',
})
const playfair = Playfair_Display({ subsets: ['latin', 'latin-ext'], variable: '--font-playfair', display: 'swap', preload: false })
const fraunces = Fraunces({ subsets: ['latin', 'latin-ext'], variable: '--font-fraunces', display: 'swap', preload: false })
const dmserif = DM_Serif_Display({ subsets: ['latin', 'latin-ext'], variable: '--font-dmserif', weight: '400', style: ['normal', 'italic'], display: 'swap', preload: false })
const bodoni = Bodoni_Moda({ subsets: ['latin', 'latin-ext'], variable: '--font-bodoni', display: 'swap', preload: false })
const lora = Lora({ subsets: ['latin', 'latin-ext'], variable: '--font-lora', display: 'swap', preload: false })
const inter = Inter({ subsets: ['latin', 'latin-ext'], variable: '--font-inter', display: 'swap', preload: false })
const dmsans = DM_Sans({ subsets: ['latin', 'latin-ext'], variable: '--font-dmsans', display: 'swap', preload: false })
const worksans = Work_Sans({ subsets: ['latin', 'latin-ext'], variable: '--font-worksans', display: 'swap', preload: false })
const nunitosans = Nunito_Sans({ subsets: ['latin', 'latin-ext'], variable: '--font-nunitosans', display: 'swap', preload: false })

/** Třídy s CSS proměnnými všech písem – patří na <html> */
export const fontVariables = [manrope, cormorant, playfair, fraunces, dmserif, bodoni, lora, inter, dmsans, worksans, nunitosans]
  .map((font) => font.variable)
  .join(' ')
