import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getPageHeaders, getShopSettings } from '@/lib/site-settings-server'
import { PageHero } from '@/components/site/page-hero'
import { SubscriptionConfigurator } from '@/components/site/subscription-configurator'

export const revalidate = 300

export const metadata: Metadata = {
  title: 'Předplatné | Monlii',
  description: 'Každý měsíc nový ručně šitý set prádla. Předplatné na 3, 6 nebo 12 měsíců.',
  alternates: { canonical: '/predplatne' },
}

export default async function SubscriptionPage() {
  const [settings, headers] = await Promise.all([getShopSettings(), getPageHeaders()])
  // Předplatné lze v administraci skrýt – stránka pak neexistuje
  if (!settings.subscriptionEnabled) notFound()

  const header = headers.predplatne
  return (
    <>
      <PageHero eyebrow={header.eyebrow} title={header.title} subtitle={header.subtitle} image={header.image} />
      <SubscriptionConfigurator />
    </>
  )
}
