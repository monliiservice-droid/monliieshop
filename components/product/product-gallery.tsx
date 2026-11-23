'use client'

import { useRef, useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { SmartImage } from '@/components/site/smart-image'

/**
 * Galerie produktu – posuvná po jedné fotce (carousel). Na mobilu přes celou šířku s tečkami,
 * na počítači se šipkami a náhledy pod hlavní fotkou.
 */
export function ProductGallery({ images, name }: { images: string[]; name: string }) {
  const [index, setIndex] = useState(0)
  const scroller = useRef<HTMLDivElement>(null)

  if (images.length === 0) {
    return <div className="flex aspect-[4/5] items-center justify-center bg-sand font-display text-4xl text-clay">Monlii</div>
  }

  const show = (i: number) => {
    const el = scroller.current
    if (!el) return
    const target = (i + images.length) % images.length
    el.scrollTo({ left: target * el.clientWidth, behavior: 'smooth' })
  }
  const alt = (i: number) => (i === 0 ? name : `${name} – fotka ${i + 1}`)
  const multiple = images.length > 1

  return (
    <div
      className="md:max-w-[480px] lg:max-w-[520px]"
      onKeyDown={(e) => {
        if (e.key === 'ArrowLeft') show(index - 1)
        if (e.key === 'ArrowRight') show(index + 1)
      }}
    >
      <div className="group relative -mx-[clamp(1rem,4vw,3rem)] md:mx-0">
        <div
          ref={scroller}
          className="no-scrollbar flex snap-x snap-mandatory overflow-x-auto"
          onScroll={(e) => {
            const el = e.currentTarget
            setIndex(Math.round(el.scrollLeft / el.clientWidth))
          }}
          tabIndex={0}
          aria-label="Fotky produktu"
          aria-roledescription="carousel"
        >
          {images.map((src, i) => (
            <div key={src + i} className="relative aspect-[4/5] w-full shrink-0 snap-center bg-sand">
              <SmartImage src={src} alt={alt(i)} fill priority={i === 0} sizes="(min-width: 1024px) 520px, (min-width: 768px) 480px, 100vw" quality={85} className="object-cover" />
            </div>
          ))}
        </div>

        {multiple && (
          <>
            {/* Šipky – jen na počítači, objeví se po najetí */}
            <button
              type="button"
              onClick={() => show(index - 1)}
              className="absolute left-3 top-1/2 hidden h-10 w-10 -translate-y-1/2 items-center justify-center bg-linen/90 opacity-0 transition-opacity hover:bg-linen focus-visible:opacity-100 group-hover:opacity-100 md:flex"
              aria-label="Předchozí fotka"
            >
              <ChevronLeft className="h-5 w-5" strokeWidth={1.5} />
            </button>
            <button
              type="button"
              onClick={() => show(index + 1)}
              className="absolute right-3 top-1/2 hidden h-10 w-10 -translate-y-1/2 items-center justify-center bg-linen/90 opacity-0 transition-opacity hover:bg-linen focus-visible:opacity-100 group-hover:opacity-100 md:flex"
              aria-label="Další fotka"
            >
              <ChevronRight className="h-5 w-5" strokeWidth={1.5} />
            </button>

            {/* Tečky – mobil */}
            <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 gap-1.5 md:hidden">
              {images.map((_, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => show(i)}
                  className={`h-1.5 rounded-full transition-all ${i === index ? 'w-6 bg-linen' : 'w-1.5 bg-linen/60'}`}
                  aria-label={`Fotka ${i + 1}`}
                />
              ))}
            </div>
            <span className="absolute bottom-3 right-3 hidden bg-linen/90 px-2 py-0.5 text-xs tabular-nums md:block">
              {index + 1} / {images.length}
            </span>
          </>
        )}
      </div>

      {/* Náhledy – počítač */}
      {multiple && (
        <div className="mt-3 hidden gap-2 md:flex md:flex-wrap">
          {images.map((src, i) => (
            <button
              key={src + i}
              type="button"
              onClick={() => show(i)}
              aria-label={`Zobrazit fotku ${i + 1}`}
              aria-current={i === index}
              className={`relative aspect-[4/5] w-16 overflow-hidden bg-sand transition-opacity ${i === index ? 'outline outline-1 outline-offset-2 outline-ink' : 'opacity-60 hover:opacity-100'}`}
            >
              <SmartImage src={src} alt="" fill sizes="64px" className="object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
