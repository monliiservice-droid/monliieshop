'use client'

import { useRef, useState } from 'react'
import { SmartImage } from '@/components/site/smart-image'

/** Galerie: na mobilu posuvná po jedné fotce, na počítači fotky pod sebou ve dvou sloupcích */
export function ProductGallery({ images, name }: { images: string[]; name: string }) {
  const [index, setIndex] = useState(0)
  const scroller = useRef<HTMLDivElement>(null)

  if (images.length === 0) {
    return <div className="flex aspect-[3/4] items-center justify-center bg-sand font-display text-4xl text-clay">Monlii</div>
  }

  return (
    <>
      {/* Mobil */}
      <div className="relative -mx-[clamp(1rem,4vw,3rem)] md:hidden">
        <div
          ref={scroller}
          className="no-scrollbar flex snap-x snap-mandatory overflow-x-auto"
          onScroll={(e) => {
            const el = e.currentTarget
            setIndex(Math.round(el.scrollLeft / el.clientWidth))
          }}
        >
          {images.map((src, i) => (
            <div key={src + i} className="relative aspect-[3/4] w-full shrink-0 snap-center bg-sand">
              <SmartImage src={src} alt={i === 0 ? name : `${name} – fotka ${i + 1}`} fill priority={i === 0} sizes="100vw" className="object-cover" />
            </div>
          ))}
        </div>
        {images.length > 1 && (
          <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 gap-1.5">
            {images.map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => scroller.current?.scrollTo({ left: i * scroller.current.clientWidth, behavior: 'smooth' })}
                className={`h-1.5 rounded-full transition-all ${i === index ? 'w-6 bg-linen' : 'w-1.5 bg-linen/60'}`}
                aria-label={`Fotka ${i + 1}`}
              />
            ))}
          </div>
        )}
      </div>

      {/* Počítač */}
      <div className="hidden gap-3 md:grid md:grid-cols-2">
        {images.map((src, i) => (
          <div key={src + i} className={`relative overflow-hidden bg-sand ${i === 0 ? 'col-span-2 aspect-[4/5]' : 'aspect-[3/4]'}`}>
            <SmartImage src={src} alt={i === 0 ? name : `${name} – fotka ${i + 1}`} fill priority={i === 0} sizes={i === 0 ? '55vw' : '28vw'} className="object-cover" />
          </div>
        ))}
      </div>
    </>
  )
}
