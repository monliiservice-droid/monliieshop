import { SmartImage } from './smart-image'

interface PageHeroProps {
  eyebrow?: string
  title: string
  subtitle?: string | null
  image?: string | null
  children?: React.ReactNode
}

/** Hlavička podstránky: s fotkou rozdělená na text a obrázek, bez fotky jen typografie */
export function PageHero({ eyebrow, title, subtitle, image, children }: PageHeroProps) {
  if (!image) {
    return (
      <section className="site-container pb-10 pt-12 md:pb-14 md:pt-20">
        {eyebrow && <p className="eyebrow mb-5">{eyebrow}</p>}
        <h1 className="display max-w-4xl text-[clamp(2.75rem,6vw,5.5rem)]">{title}</h1>
        {subtitle && <p className="mt-6 max-w-2xl text-lg leading-relaxed text-ink-soft">{subtitle}</p>}
        {children}
      </section>
    )
  }

  return (
    <section className="border-b border-line">
      <div className="site-container grid items-stretch gap-8 py-10 md:grid-cols-12 md:gap-6 md:py-0">
        <div className="flex flex-col justify-center md:col-span-6 md:py-16 lg:col-span-5">
          {eyebrow && <p className="eyebrow mb-5">{eyebrow}</p>}
          <h1 className="display text-[clamp(2.75rem,5.5vw,5rem)]">{title}</h1>
          {subtitle && <p className="mt-6 max-w-xl text-lg leading-relaxed text-ink-soft">{subtitle}</p>}
          {children}
        </div>
        <div className="relative aspect-[16/10] overflow-hidden bg-sand md:col-span-6 md:col-start-7 md:aspect-auto md:min-h-[420px] lg:col-start-7">
          <SmartImage src={image} alt="" fill priority sizes="(min-width: 768px) 50vw, 100vw" className="object-cover" />
        </div>
      </div>
    </section>
  )
}
