import type { Metadata } from 'next'
import { Facebook, Instagram } from 'lucide-react'
import { getPageHeaders } from '@/lib/site-settings-server'
import { PICKUP_LOCATIONS } from '@/lib/pickup-locations'
import { PageHero } from '@/components/site/page-hero'
import { ContactForm } from '@/components/site/contact-form'

export const revalidate = 300

export const metadata: Metadata = {
  title: 'Kontakty | Monlii',
  description: 'Napište nám nebo se zastavte – Monlii najdete v Havířově a ve Frenštátu pod Radhoštěm.',
  alternates: { canonical: '/kontakty' },
}

const EMAIL = 'monlli@seznam.cz'
const PHONE = '+420 702 559 369'

export default async function ContactPage() {
  const header = (await getPageHeaders()).kontakty

  return (
    <>
      <PageHero eyebrow={header.eyebrow} title={header.title} subtitle={header.subtitle} image={header.image} />

      <section className="site-container grid gap-16 py-16 md:grid-cols-12 md:py-24">
        <div className="space-y-12 md:col-span-5">
          <div>
            <p className="eyebrow mb-5">Napište nebo zavolejte</p>
            <a href={`mailto:${EMAIL}`} className="link-line display block text-[clamp(1.75rem,3vw,2.5rem)]">{EMAIL}</a>
            <a href={`tel:${PHONE.replace(/\s/g, '')}`} className="link-line display mt-2 block text-[clamp(1.75rem,3vw,2.5rem)]">{PHONE}</a>
            <p className="mt-4 text-ink-soft">Odpovídáme obvykle do 24 hodin.</p>
          </div>

          <div>
            <p className="eyebrow mb-5">Kde nás najdete</p>
            <div className="space-y-8">
              {Object.values(PICKUP_LOCATIONS).map((location) => (
                <div key={location.name} className="border-t border-line pt-5">
                  <h2 className="font-display text-2xl">{location.name}</h2>
                  <p className="mt-1 text-sm font-semibold">{location.place}</p>
                  <p className="mt-2 text-ink-soft">
                    {location.address}
                    {location.note && <span className="block text-sm italic">{location.note}</span>}
                    <span className="block">{location.zip} {location.city}</span>
                  </p>
                  <dl className="mt-3 space-y-1 text-sm">
                    {location.hours.map((h) => (
                      <div key={h.days} className="flex gap-4">
                        <dt className="w-28 shrink-0 text-stone">{h.days}</dt>
                        <dd>{h.time}</dd>
                      </div>
                    ))}
                  </dl>
                </div>
              ))}
            </div>
          </div>

          <div className="flex gap-3">
            <a href="https://www.instagram.com/monlii_i/" target="_blank" rel="noopener noreferrer" className="btn btn-outline h-11 px-5">
              <Instagram className="h-4 w-4" /> Instagram
            </a>
            <a href="https://www.facebook.com/monlii.cz" target="_blank" rel="noopener noreferrer" className="btn btn-outline h-11 px-5">
              <Facebook className="h-4 w-4" /> Facebook
            </a>
          </div>
        </div>

        <div id="kontaktni-formular" className="relative md:col-span-6 md:col-start-7">
          <p className="eyebrow mb-5">Kontaktní formulář</p>
          <h2 className="display mb-8 text-[clamp(2rem,3.5vw,3rem)]">Máte dotaz k velikosti, materiálu nebo šití na míru?</h2>
          <ContactForm />
        </div>
      </section>
    </>
  )
}
