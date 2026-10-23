import Link from 'next/link'
import { ArrowRight, ArrowUpRight, Instagram } from 'lucide-react'
import type {
  CategoryTilesData,
  HeroData,
  ImageTextData,
  InstagramData,
  ProductCarouselData,
  ReviewsData,
  SaleBannerData,
  StoriesData,
  TextData,
  ValuesData,
} from '@/lib/sections'
import { getProductCards } from '@/lib/catalog'
import { getCategoryTree, getDescendantIds } from '@/lib/categories'
import { getActiveSales } from '@/lib/sales'
import { getShopSettings } from '@/lib/site-settings-server'
import { SmartImage } from '@/components/site/smart-image'
import { ProductCard } from '@/components/site/product-card'
import { ScrollRow } from '@/components/site/scroll-row'
import { SectionHeading } from './section-heading'

const SECTION_Y = 'py-16 md:py-24'

function paragraphs(text: string) {
  return text
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean)
}

/* ------------------------------------------------------------------ Hero */
export function HeroSection({ data, priority }: { data: HeroData; priority?: boolean }) {
  const centered = data.align === 'center'
  return (
    <section className={`relative isolate flex overflow-hidden bg-ink text-linen ${data.height === 'tall' ? 'min-h-[calc(100svh-6rem)] lg:min-h-[calc(100svh-7.25rem)]' : 'min-h-[58vh]'}`}>
      {data.image && (
        <SmartImage
          src={data.image}
          alt=""
          fill
          priority={priority}
          sizes="100vw"
          className={`-z-10 object-cover ${data.mobileImage ? 'hidden sm:block' : ''}`}
        />
      )}
      {data.mobileImage && (
        <SmartImage src={data.mobileImage} alt="" fill priority={priority} sizes="100vw" className="-z-10 object-cover sm:hidden" />
      )}
      <div className={`absolute inset-0 -z-10 ${centered ? 'bg-ink/45' : 'bg-gradient-to-r from-ink/75 via-ink/35 to-ink/5'}`} />
      <div className={`site-container flex w-full flex-col justify-end pb-14 pt-24 md:pb-20 ${centered ? 'items-center text-center' : ''}`}>
        <div className={`max-w-3xl ${centered ? 'mx-auto' : ''}`}>
          {data.eyebrow && <p className="mb-6 text-[11px] font-semibold uppercase tracking-[0.24em] text-linen/80">{data.eyebrow}</p>}
          <h1 className="display text-[clamp(3rem,8vw,7.5rem)]">{data.title}</h1>
          {data.subtitle && <p className={`mt-6 max-w-xl text-base leading-relaxed text-linen/85 md:text-lg ${centered ? 'mx-auto' : ''}`}>{data.subtitle}</p>}
          <div className={`mt-10 flex flex-wrap gap-3 ${centered ? 'justify-center' : ''}`}>
            {data.primary.text && data.primary.link && (
              <Link href={data.primary.link} className="btn btn-light">
                {data.primary.text}
                <ArrowRight className="h-4 w-4" />
              </Link>
            )}
            {data.secondary.text && data.secondary.link && (
              <Link href={data.secondary.link} className="btn btn-outline-light">
                {data.secondary.text}
              </Link>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}

/* --------------------------------------------------------- Category tiles */
export function CategoryTilesSection({ data }: { data: CategoryTilesData }) {
  if (data.items.length === 0) return null
  const cols = data.items.length >= 4 ? 'lg:grid-cols-4' : data.items.length === 2 ? 'sm:grid-cols-2' : 'sm:grid-cols-3'
  return (
    <section className={`site-container ${SECTION_Y}`}>
      <SectionHeading eyebrow={data.eyebrow} title={data.title} />
      <div className={`grid gap-4 sm:gap-6 ${cols} ${data.items.length >= 4 ? 'sm:grid-cols-2' : ''}`}>
        {data.items.map((item, index) => {
          const hasImage = Boolean(item.image)
          return (
            <Link
              key={`${item.link}-${index}`}
              href={item.link || '/obchod'}
              className={`reveal group relative block aspect-[4/5] overflow-hidden sm:aspect-[3/4] ${hasImage ? 'bg-sand' : index % 2 ? 'bg-ink' : 'bg-wine'}`}
            >
              {hasImage ? (
                <>
                  <SmartImage src={item.image} alt={item.label} fill sizes="(min-width: 640px) 33vw, 100vw" className="object-cover transition-transform duration-[1200ms] ease-[var(--ease-out-soft)] group-hover:scale-[1.04]" />
                  <div className="absolute inset-0 bg-gradient-to-t from-ink/70 via-ink/10 to-transparent" />
                </>
              ) : (
                // Typografická karta, když dlaždice nemá fotku
                <span aria-hidden="true" className="display pointer-events-none absolute -right-4 top-6 select-none text-[clamp(8rem,18vw,14rem)] leading-none text-linen/10 transition-transform duration-700 group-hover:-translate-x-3">
                  {item.label}
                </span>
              )}
              <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-4 p-6 text-linen md:p-8">
                <div>
                  <span className="font-mono text-[11px] text-linen/60">0{index + 1}</span>
                  <h3 className="display mt-1 text-[clamp(2.25rem,4vw,3.5rem)]">{item.label}</h3>
                  {item.caption && <p className="mt-2 text-sm text-linen/80">{item.caption}</p>}
                </div>
                <span className="flex h-12 w-12 shrink-0 items-center justify-center border border-linen/50 transition-colors group-hover:bg-linen group-hover:text-ink">
                  <ArrowUpRight className="h-5 w-5" />
                </span>
              </div>
            </Link>
          )
        })}
      </div>
    </section>
  )
}

/* -------------------------------------------------------- Product carousel */
export async function ProductCarouselSection({ data }: { data: ProductCarouselData }) {
  const [settings, tree] = await Promise.all([getShopSettings(), getCategoryTree()])
  const category = data.source === 'category' && data.categoryId ? tree.byId.get(data.categoryId) : undefined

  const products = await getProductCards({
    limit: data.limit,
    sort: data.source === 'newest' ? 'newest' : 'default',
    featured: data.source === 'featured',
    onlySale: data.source === 'sale',
    ...(category && { categoryIds: getDescendantIds(category) }),
  })
  if (products.length === 0) return null

  if (data.layout === 'grid') {
    return (
      <section className={`site-container ${SECTION_Y}`}>
        <SectionHeading eyebrow={data.eyebrow} title={data.title} link={data.link} />
        <div className="grid grid-cols-2 gap-x-4 gap-y-10 sm:gap-x-6 md:grid-cols-3 xl:grid-cols-4">
          {products.map((p) => (
            <ProductCard key={p.id} product={p} variant={settings.productCardStyle} />
          ))}
        </div>
      </section>
    )
  }

  return (
    <section className={`site-container overflow-hidden ${SECTION_Y}`}>
      <SectionHeading eyebrow={data.eyebrow} title={data.title} link={data.link} withArrows />
      <ScrollRow label={data.title}>
        {products.map((p) => (
          <div key={p.id} className="w-[68vw] shrink-0 snap-start sm:w-[40vw] md:w-[30vw] xl:w-[22vw]">
            <ProductCard product={p} variant={settings.productCardStyle} sizes="(min-width: 1280px) 22vw, (min-width: 768px) 30vw, 68vw" />
          </div>
        ))}
      </ScrollRow>
    </section>
  )
}

/* -------------------------------------------------------------- Image+text */
export function ImageTextSection({ data }: { data: ImageTextData }) {
  const imageRight = data.imagePosition === 'right'
  return (
    <section className={`site-container ${SECTION_Y}`}>
      <div className="grid items-center gap-10 md:grid-cols-12 md:gap-6">
        {data.image && (
          <div className={`reveal relative aspect-[4/5] overflow-hidden bg-sand md:col-span-6 ${imageRight ? 'md:order-2 md:col-start-7' : ''}`}>
            <SmartImage src={data.image} alt={data.title} fill sizes="(min-width: 768px) 50vw, 100vw" className="object-cover" />
          </div>
        )}
        <div className={`md:col-span-5 ${imageRight ? 'md:order-1 md:col-start-1' : 'md:col-start-8'}`}>
          {data.eyebrow && <p className="eyebrow mb-5">{data.eyebrow}</p>}
          <h2 className="display text-[clamp(2.25rem,4.5vw,3.75rem)]">{data.title}</h2>
          <div className="mt-6 space-y-4 text-base leading-relaxed text-ink-soft md:text-lg">
            {paragraphs(data.text).map((p, i) => (
              <p key={i}>{p}</p>
            ))}
          </div>
          {data.button.text && data.button.link && (
            <Link href={data.button.link} className="btn btn-outline mt-8">
              {data.button.text}
              <ArrowRight className="h-4 w-4" />
            </Link>
          )}
        </div>
      </div>
    </section>
  )
}

/* ------------------------------------------------------------------ Values */
export function ValuesSection({ data }: { data: ValuesData }) {
  return (
    <section className="bg-sand">
      <div className={`site-container ${SECTION_Y}`}>
        <SectionHeading eyebrow={data.eyebrow} title={data.title} />
        <ol className="grid gap-10 sm:grid-cols-2 lg:grid-cols-3">
          {data.items.map((item, index) => (
            <li key={index} className="reveal border-t border-ink/20 pt-6">
              <span className="font-display text-5xl italic text-wine">{String(index + 1).padStart(2, '0')}</span>
              <h3 className="mt-4 text-lg font-semibold">{item.title}</h3>
              <p className="mt-2 leading-relaxed text-ink-soft">{item.text}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  )
}

/* ------------------------------------------------------------ Sale banner */
export async function SaleBannerSection({ data }: { data: SaleBannerData }) {
  const sales = await getActiveSales()
  const sale = (data.saleId && sales.find((s) => s.id === data.saleId)) || (!data.saleId ? sales[0] : undefined)
  if (!sale) return null

  const image = data.image || sale.bannerImage
  const endsAt = sale.endsAt?.toLocaleDateString('cs-CZ', { day: 'numeric', month: 'long' })
  return (
    <section className="site-container py-8 md:py-12">
      <Link href={`/vyprodej/${sale.slug}`} className="group grid overflow-hidden bg-wine text-white md:grid-cols-2">
        <div className="flex flex-col justify-between gap-10 p-8 md:p-14">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-white/75">{data.eyebrow || 'Výprodej'}</p>
            <p className="display mt-6 text-[clamp(4.5rem,11vw,9rem)] leading-[0.85]">−{sale.discountPercent}%</p>
            <h2 className="display mt-6 text-[clamp(1.75rem,3vw,2.5rem)]">{data.title || sale.name}</h2>
            {(data.text || sale.description) && <p className="mt-4 max-w-md text-white/85">{data.text || sale.description}</p>}
          </div>
          <div className="flex flex-wrap items-center gap-6">
            <span className="btn btn-light">
              {data.buttonText || 'Nakoupit'}
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </span>
            {endsAt && <span className="text-sm text-white/75">Akce končí {endsAt}</span>}
          </div>
        </div>
        {image && (
          <div className="relative min-h-[280px] md:min-h-[480px]">
            <SmartImage src={image} alt={sale.name} fill sizes="(min-width: 768px) 50vw, 100vw" className="object-cover transition-transform duration-[1200ms] group-hover:scale-[1.03]" />
          </div>
        )}
      </Link>
    </section>
  )
}

/* ---------------------------------------------------------------- Stories */
export function StoriesSection({ data }: { data: StoriesData }) {
  if (data.items.length === 0) return null
  return (
    <section className={`site-container overflow-hidden ${SECTION_Y}`}>
      <SectionHeading eyebrow={data.eyebrow} title={data.title} withArrows />
      <ScrollRow label={data.title}>
        {data.items.map((story, index) => (
          <article key={index} className="w-[78vw] shrink-0 snap-start sm:w-[46vw] lg:w-[31vw]">
            {story.image && (
              <div className="relative aspect-[4/5] overflow-hidden bg-sand">
                <SmartImage src={story.image} alt={story.name} fill sizes="(min-width: 1024px) 31vw, 78vw" className="object-cover" />
              </div>
            )}
            <div className="mt-5">
              <p className="font-display text-2xl">{story.name}</p>
              {story.role && <p className="text-[11px] uppercase tracking-[0.16em] text-stone">{story.role}</p>}
              <p className="mt-3 leading-relaxed text-ink-soft">„{story.text}“</p>
            </div>
          </article>
        ))}
      </ScrollRow>
    </section>
  )
}

/* ---------------------------------------------------------------- Reviews */
export function ReviewsSection({ data }: { data: ReviewsData }) {
  if (data.items.length === 0) return null
  return (
    <section className="bg-wine-soft">
      <div className={`site-container ${SECTION_Y}`}>
        <SectionHeading eyebrow={data.eyebrow} title={data.title} />
        <div className="grid gap-x-10 gap-y-12 md:grid-cols-2 xl:grid-cols-3">
          {data.items.map((review, index) => (
            <figure key={index} className="reveal">
              <blockquote className="font-display text-[1.6rem] leading-snug">„{review.text}“</blockquote>
              <figcaption className="mt-5 flex items-center gap-3 text-sm">
                <span className="h-px w-8 bg-ink/40" />
                <span className="font-semibold">{review.name}</span>
                {review.product && <span className="text-stone">· {review.product}</span>}
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  )
}

/* -------------------------------------------------------------- Instagram */
export function InstagramSection({ data }: { data: InstagramData }) {
  const items = data.items.filter((i) => i.image)
  if (items.length === 0) return null
  return (
    <section className={`site-container ${SECTION_Y}`}>
      <SectionHeading eyebrow={data.eyebrow} title={data.title} link={data.link ? { text: data.handle || 'Instagram', link: data.link } : undefined} />
      <div className="grid grid-cols-2 gap-2 sm:gap-4 md:grid-cols-4">
        {items.map((item, index) => (
          <a key={index} href={item.url || data.link} target="_blank" rel="noopener noreferrer" className="group relative aspect-square overflow-hidden bg-sand" aria-label={`Příspěvek na Instagramu ${index + 1}`}>
            <SmartImage src={item.image} alt="" fill sizes="(min-width: 768px) 25vw, 50vw" className="object-cover transition-transform duration-700 group-hover:scale-105" />
            <span className="absolute inset-0 flex items-center justify-center bg-ink/0 text-linen opacity-0 transition-all group-hover:bg-ink/35 group-hover:opacity-100">
              <Instagram className="h-7 w-7" />
            </span>
          </a>
        ))}
      </div>
    </section>
  )
}

/* ------------------------------------------------------------------- Text */
export function TextSection({ data }: { data: TextData }) {
  const centered = data.align === 'center'
  return (
    <section className={`site-container ${SECTION_Y}`}>
      <div className={`max-w-3xl ${centered ? 'mx-auto text-center' : ''}`}>
        {data.eyebrow && <p className="eyebrow mb-5">{data.eyebrow}</p>}
        {data.title && <h2 className="display text-[clamp(2rem,4vw,3.25rem)]">{data.title}</h2>}
        <div className="mt-6 space-y-4 text-lg leading-relaxed text-ink-soft">
          {paragraphs(data.text).map((p, i) => (
            <p key={i}>{p}</p>
          ))}
        </div>
      </div>
    </section>
  )
}
