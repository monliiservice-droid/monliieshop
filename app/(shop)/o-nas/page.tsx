import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { getPageHeaders } from '@/lib/site-settings-server'
import { PageHero } from '@/components/site/page-hero'
import { SmartImage } from '@/components/site/smart-image'

export const revalidate = 300

export const metadata: Metadata = {
  title: 'O nás | Monlii',
  description:
    'Monlii je rodinná dílna tří žen. Ručně šijeme prádlo a oblečení pro ženy, muže i děti – s láskou k tělu i přírodě.',
  alternates: { canonical: '/o-nas' },
}

const VALUES = [
  { title: 'Ruční výroba', text: 'Každý kousek ušijeme ručně s péčí o detail. Žádná masová výroba, jen poctivé řemeslo.' },
  { title: 'Česká dílna', text: 'Navazujeme na českou švadlenskou tradici. Všechno vzniká u nás, v malých sériích.' },
  { title: 'Pro skutečná těla', text: 'Šijeme pro reálné postavy – a když je potřeba, rády ušijeme i na míru.' },
]

export default async function AboutPage() {
  const header = (await getPageHeaders())['o-nas']

  return (
    <>
      <PageHero eyebrow={header.eyebrow} title={header.title} subtitle={header.subtitle} image={header.image} />

      <article className="site-container grid gap-12 py-16 md:grid-cols-12 md:py-24">
        <div className="md:col-span-4">
          <p className="eyebrow md:sticky md:top-28">Náš příběh</p>
        </div>
        <div className="space-y-6 text-lg leading-relaxed text-ink-soft md:col-span-7">
          <p className="font-display text-[clamp(1.75rem,3vw,2.5rem)] leading-snug text-ink">
            Monlii není jen značka. Je to náš rodinný projekt, který začal dávno předtím, než vznikl samotný e-shop.
          </p>
          <p>
            Začal u mamky. U jejího snu, který si nosila v hlavě celé roky, ale nikdy si na něj nenašla prostor. Vždycky tu byl
            někdo, o koho se starala víc než o sebe — my dvě, práce, domácnost… život.
          </p>
          <p>
            A pak jednoho dne přišel moment, kdy jsme si jako tři holky sedly ke stolu a řekly si: „Proč vlastně ne? Proč nezkusit
            vytvořit něco vlastního, něco, co bude dávat smysl nám třem a bude nás bavit?“ A tak vzniklo Monlii. Název, který pro
            nás neznamená jen brand, ale připomínku toho, že když se spojíme, dokážeme vytvořit víc, než jsme si kdy myslely.
          </p>

          <h2 className="display pt-8 text-[clamp(2rem,3.5vw,3rem)] text-ink">Proč vlastně prádlo?</h2>
          <p>
            Věříme, že každý si zaslouží cítit se ve svém těle dobře. Bez ohledu na věk, postavu, náladu nebo to, co čeká venku.
            Ne dokonale… ale skutečně dobře.
          </p>
          <p>
            Proto vybíráme materiály, které nejsou jen hezké, ale i pohodlné. Proto si hrajeme s krajkou, detaily a střihem. Proto
            zkoušíme, ladíme, fotíme, předěláváme… protože každý kus musí mít duši.
          </p>

          <h2 className="display pt-8 text-[clamp(2rem,3.5vw,3rem)] text-ink">Rodinný projekt</h2>
          <p>
            Pracujeme spolu. Dohadujeme se, smějeme se, zkoušíme prototypy a přemýšlíme, jak udělat Monlii nejen produktem, ale
            i pocitem. Jsme tři různé ženy – každá jiná, každá se svým pohledem. A právě díky tomu tvoříme věci, které nejsou jen
            pro „ideální postavy“, ale pro skutečné lidi.
          </p>

          <h2 className="display pt-8 text-[clamp(2rem,3.5vw,3rem)] text-ink">Nově pro celou rodinu</h2>
          <p>
            Začínaly jsme dámským prádlem. Teď šijeme i pro muže a děti – se stejnou péčí, ze stejně příjemných materiálů a se
            stejným přístupem: pomalu, poctivě a s láskou k tělu i přírodě.
          </p>
        </div>
      </article>

      <section className="bg-sand">
        <div className="site-container grid gap-10 py-16 md:grid-cols-12 md:py-24">
          <div className="relative aspect-[4/5] overflow-hidden md:col-span-5">
            <SmartImage src="/about_us.jpg" alt="Tým Monlii" fill sizes="(min-width: 768px) 40vw, 100vw" className="object-cover" />
          </div>
          <div className="md:col-span-6 md:col-start-7 md:self-center">
            <p className="eyebrow mb-5">Co je pro nás důležité</p>
            <ol className="space-y-8">
              {VALUES.map((value, index) => (
                <li key={value.title} className="border-t border-ink/20 pt-5">
                  <span className="font-display text-4xl italic text-wine">{String(index + 1).padStart(2, '0')}</span>
                  <h3 className="mt-2 text-lg font-semibold">{value.title}</h3>
                  <p className="mt-1 text-ink-soft">{value.text}</p>
                </li>
              ))}
            </ol>
            <p className="mt-10 font-display text-3xl">Tři holky, jedna rodina a jeden společný sen.</p>
            <Link href="/obchod" className="btn btn-ink mt-8">
              Prohlédnout kolekci <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>
    </>
  )
}
