'use client'

import { useEffect, useState } from 'react'
import { SmartImage } from '@/components/site/smart-image'

export interface HeroSlide {
  image: string
  mobileImage: string
}

/**
 * Pozadí úvodního banneru: fotky se plynule prolínají. Automaticky se střídají (při vypnutých animacích
 * jen ručně tečkami) a v nepřepnuté záložce prohlížeče stojí.
 */
export function HeroSlides({ slides, interval, priority }: { slides: HeroSlide[]; interval: number; priority?: boolean }) {
  const [active, setActive] = useState(0)
  const [paused, setPaused] = useState(false)

  useEffect(() => {
    if (slides.length < 2 || paused || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const timer = setInterval(() => {
      if (!document.hidden) setActive((i) => (i + 1) % slides.length)
    }, Math.max(3, interval) * 1000)
    return () => clearInterval(timer)
  }, [slides.length, interval, paused])

  return (
    <>
      {slides.map((slide, i) => (
        <div
          key={slide.image + i}
          className={`absolute inset-0 -z-20 transition-opacity duration-1000 ease-in-out motion-reduce:transition-none ${i === active ? 'opacity-100' : 'opacity-0'}`}
          aria-hidden={i !== active}
        >
          <SmartImage
            src={slide.image}
            alt=""
            fill
            priority={priority && i === 0}
            sizes="100vw"
            quality={85}
            className={`object-cover ${slide.mobileImage ? 'hidden sm:block' : ''}`}
          />
          {slide.mobileImage && (
            <SmartImage src={slide.mobileImage} alt="" fill priority={priority && i === 0} sizes="100vw" quality={85} className="object-cover sm:hidden" />
          )}
        </div>
      ))}
      {slides.length > 1 && (
        <div className="absolute bottom-5 right-[clamp(1rem,4vw,3rem)] z-10 flex items-center gap-2" role="group" aria-label="Fotky v banneru">
          {slides.map((_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => {
                setActive(i)
                setPaused(true)
              }}
              aria-label={`Fotka ${i + 1}`}
              aria-current={i === active}
              className={`h-1.5 rounded-full transition-all ${i === active ? 'w-7 bg-linen' : 'w-1.5 bg-linen/55 hover:bg-linen/80'}`}
            />
          ))}
        </div>
      )}
    </>
  )
}
