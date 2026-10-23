'use client'

import { useRef } from 'react'
import { ArrowLeft, ArrowRight } from 'lucide-react'

/** Vodorovně posuvný pás se šipkami (na dotykových zařízeních se posouvá prstem) */
export function ScrollRow({ children, label }: { children: React.ReactNode; label: string }) {
  const ref = useRef<HTMLDivElement>(null)
  const scroll = (dir: -1 | 1) => {
    const el = ref.current
    if (el) el.scrollBy({ left: dir * el.clientWidth * 0.8, behavior: 'smooth' })
  }
  return (
    <div className="relative">
      <div className="absolute -top-16 right-0 hidden gap-2 md:flex">
        <button type="button" onClick={() => scroll(-1)} className="flex h-11 w-11 items-center justify-center border border-ink/20 transition-colors hover:border-ink hover:bg-ink hover:text-linen" aria-label={`${label} – předchozí`}>
          <ArrowLeft className="h-4 w-4" />
        </button>
        <button type="button" onClick={() => scroll(1)} className="flex h-11 w-11 items-center justify-center border border-ink/20 transition-colors hover:border-ink hover:bg-ink hover:text-linen" aria-label={`${label} – další`}>
          <ArrowRight className="h-4 w-4" />
        </button>
      </div>
      <div ref={ref} className="no-scrollbar -mx-[clamp(1rem,4vw,3rem)] flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-px-[clamp(1rem,4vw,3rem)] px-[clamp(1rem,4vw,3rem)] sm:gap-6">
        {children}
      </div>
    </div>
  )
}
