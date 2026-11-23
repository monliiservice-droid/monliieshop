// Výřez fotky: bod, který má při ořezu zůstat vidět. Ukládá se přímo do adresy obrázku jako
// „…/fotka.jpg#focus=30,40“ (procenta zleva a shora) – část za # se na server nikdy neposílá
// a před zobrazením se odstraní, takže fotky bez výřezu i stará data fungují beze změny.

const FOCUS = /#focus=(\d{1,3}(?:\.\d+)?),(\d{1,3}(?:\.\d+)?)$/

export interface ImageWithFocus {
  src: string
  x: number
  y: number
}

const clamp = (n: number) => Math.min(100, Math.max(0, n))

export function splitImage(value: string): ImageWithFocus {
  const match = value.match(FOCUS)
  if (!match) return { src: value, x: 50, y: 50 }
  return { src: value.slice(0, match.index), x: clamp(parseFloat(match[1])), y: clamp(parseFloat(match[2])) }
}

/** Adresa obrázku s výřezem (střed = bez značky) */
export function withFocus(src: string, x: number, y: number): string {
  const rx = Math.round(clamp(x))
  const ry = Math.round(clamp(y))
  return rx === 50 && ry === 50 ? src : `${src}#focus=${rx},${ry}`
}

/** Adresa bez výřezu (pro odkazy, náhledy pro sdílení, strukturovaná data) */
export function imageSrc(value: string): string {
  return splitImage(value).src
}
