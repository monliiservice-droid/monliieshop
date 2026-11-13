'use client'

import { useEffect, useRef } from 'react'

// Šev přes celou stránku: při otevření vletí jehla a při scrollování šije nit dolů,
// ze strany na stranu kolem sekcí. Nit je jedna SVG cesta odkrývaná ořezem, jehla jeden prvek
// posouvaný přes transform – nic se nepřepočítává v rozložení stránky a klikání nepřekáží.

const TIP_AT = 0.62 // špička švu se drží v 62 % výšky okna
const EASE = 0.11 // dotahování jehly za scrollem (0–1, menší = plynulejší)

type Point = [number, number]

/** Body švu: v každé sekci běží po jedné straně (s jemným vlněním), mezi sekcemi přeběhne na druhou */
function buildPoints(width: number, gutter: number, sections: { top: number; bottom: number }[]): Point[] {
  const margin = Math.max(9, Math.min(gutter / 2, 46))
  const wobble = Math.max(3, Math.min(gutter / 3, 16))
  // polovina výšky přechodu mezi sekcemi (šev tu přebíhá na druhou stranu) – musí se vejít do mezer sekcí
  const CROSS = width < 768 ? 44 : 70
  const points: Point[] = [[-70, 24]]
  let y = 24
  sections.forEach((section, i) => {
    const x = i % 2 === 0 ? width - margin : margin
    const dir = i % 2 === 0 ? -1 : 1
    // první sekce: jehla přiletí šikmo přes horní část úvodního banneru
    const start = Math.max(i === 0 ? section.top + Math.min(260, (section.bottom - section.top) * 0.4) : section.top + CROSS, y + 40)
    const end = Math.max(section.bottom - CROSS, start)
    points.push([x, start])
    const steps = Math.floor((end - start) / 240)
    for (let s = 1; s < steps; s++) {
      points.push([x + (s % 2 ? dir * wobble * 2 : 0), start + ((end - start) * s) / steps])
    }
    if (end > start) points.push([x, end])
    y = end
  })
  return points
}

/** Hladká cesta se svislými tečnami – y podél ní jen roste, takže ji lze odkrývat ořezem shora */
function toPath(points: Point[]): string {
  let d = `M${points[0][0]} ${points[0][1]}`
  for (let i = 1; i < points.length; i++) {
    const [x0, y0] = points[i - 1]
    const [x1, y1] = points[i]
    const mid = (y0 + y1) / 2
    d += ` C${x0} ${mid} ${x1} ${mid} ${x1} ${y1}`
  }
  return d
}

export function ThreadPath() {
  const root = useRef<HTMLDivElement>(null)
  const svg = useRef<SVGSVGElement>(null)
  const pathUnder = useRef<SVGPathElement>(null)
  const path = useRef<SVGPathElement>(null)
  const needle = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = root.current
    const container = el?.parentElement
    if (!el || !container || !svg.current || !path.current || !pathUnder.current || !needle.current) return
    const svgEl = svg.current
    const pathEl = path.current
    const underEl = pathUnder.current
    const needleEl = needle.current
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    let total = 0
    let height = 0
    let table: number[] = [] // délka cesty po krocích y (STEP px)
    const STEP = 12
    let current = 0
    let target = 0
    let frame = 0
    let first = true

    const lengthAtY = (y: number) => {
      const i = Math.max(0, Math.min(table.length - 1, y / STEP))
      const lo = Math.floor(i)
      const hi = Math.min(table.length - 1, lo + 1)
      return table[lo] + (table[hi] - table[lo]) * (i - lo)
    }

    const draw = () => {
      const tip = pathEl.getPointAtLength(current)
      const back = pathEl.getPointAtLength(Math.max(0, current - 6))
      const angle = (Math.atan2(tip.y - back.y, tip.x - back.x) * 180) / Math.PI
      svgEl.style.clipPath = `inset(0 0 ${Math.max(0, height - tip.y)}px 0)`
      needleEl.style.transform = `translate(${tip.x}px, ${tip.y}px) rotate(${angle}deg)`
    }

    const tick = () => {
      frame = 0
      const diff = target - current
      if (Math.abs(diff) < 0.6) {
        current = target
        first = false
        draw()
        return
      }
      // při otevření stránky jehla přiletí o něco pomaleji
      current += diff * (first ? 0.045 : EASE)
      draw()
      frame = requestAnimationFrame(tick)
    }

    const onScroll = () => {
      const top = container.getBoundingClientRect().top
      const y = Math.max(0, Math.min(height, window.innerHeight * TIP_AT - top))
      target = lengthAtY(y)
      if (!frame) frame = requestAnimationFrame(tick)
    }

    const layout = () => {
      const width = container.clientWidth
      height = container.scrollHeight
      const base = container.getBoundingClientRect().top
      const sections = Array.from(container.children)
        .filter((child) => child !== el && (child as HTMLElement).offsetHeight > 0)
        .map((child) => {
          const rect = child.getBoundingClientRect()
          return { top: rect.top - base, bottom: rect.bottom - base }
        })
      if (sections.length === 0 || width === 0) return
      const inner = container.querySelector('.site-container')
      const gutter = inner ? Math.max(0, inner.getBoundingClientRect().left + parseFloat(getComputedStyle(inner).paddingLeft)) : 20

      const d = toPath(buildPoints(width, gutter, sections))
      svgEl.setAttribute('width', String(width))
      svgEl.setAttribute('height', String(height))
      pathEl.setAttribute('d', d)
      underEl.setAttribute('d', d)
      total = pathEl.getTotalLength()

      // tabulka y → délka cesty (y podél cesty jen roste)
      table = []
      let length = 0
      for (let y = 0; y <= height + STEP; y += STEP) {
        while (length < total && pathEl.getPointAtLength(length).y < y) length += 6
        table.push(Math.min(length, total))
      }

      if (reduced) {
        svgEl.style.clipPath = 'none'
        needleEl.style.display = 'none'
        return
      }
      current = Math.min(current, total)
      onScroll()
    }

    layout()
    el.style.opacity = '1'

    let resizeTimer: ReturnType<typeof setTimeout>
    const observer = new ResizeObserver(() => {
      clearTimeout(resizeTimer)
      resizeTimer = setTimeout(layout, 150)
    })
    observer.observe(container)
    if (!reduced) window.addEventListener('scroll', onScroll, { passive: true })

    return () => {
      observer.disconnect()
      clearTimeout(resizeTimer)
      window.removeEventListener('scroll', onScroll)
      if (frame) cancelAnimationFrame(frame)
    }
  }, [])

  return (
    <div ref={root} aria-hidden="true" className="pointer-events-none absolute inset-0 z-10 overflow-clip opacity-0 transition-opacity duration-500 print:hidden">
      <svg ref={svg} className="absolute left-0 top-0 text-wine" fill="none" style={{ clipPath: 'inset(0 0 100% 0)' }}>
        {/* světlý podklad, aby byl steh čitelný i na fotkách a tmavých plochách */}
        <path ref={pathUnder} stroke="#fbf7f2" strokeOpacity="0.55" strokeWidth="4.5" strokeLinecap="round" className="md:[stroke-width:5.5]" />
        <path ref={path} stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeDasharray="11 8" className="md:[stroke-width:2.3]" />
      </svg>
      <div ref={needle} className="absolute left-0 top-0 will-change-transform" style={{ transform: 'translate(-200px, 0)' }}>
        {/* jehla: ouško v místě konce nitě, špička míří ve směru šití */}
        <svg width="58" height="12" viewBox="0 0 58 12" className="origin-[9px_50%] -translate-x-[9px] -translate-y-1/2 md:scale-[1.45] drop-shadow-[0_1px_1px_rgba(43,15,12,0.35)]" fill="none">
          <path d="M3 6c0-1.6 2-2.6 5-2.6h34L57 6 42 8.6H8C5 8.6 3 7.6 3 6Z" fill="#e9e4dc" stroke="#6b5a55" strokeWidth="0.8" />
          <ellipse cx="9.5" cy="6" rx="3.6" ry="1.1" fill="#2b0f0c" />
        </svg>
      </div>
    </div>
  )
}
