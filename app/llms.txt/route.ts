import { getCategoryTree, isCategoryPathVisible } from '@/lib/categories'
import { getActiveSales } from '@/lib/sales'
import { getSeoSettings } from '@/lib/site-settings-server'
import { keywordList } from '@/lib/seo-settings'
import { PICKUP_LOCATIONS } from '@/lib/pickup-locations'
import { ZASILKOVNA_CONFIG } from '@/lib/zasilkovna-zbox'

export const revalidate = 3600

// llms.txt – stručný přehled webu pro AI asistenty (ChatGPT, Claude, Perplexity…), viz llmstxt.org
export async function GET() {
  const baseUrl = process.env.NEXT_PUBLIC_URL || 'https://monlii.cz'
  const [seo, tree, sales] = await Promise.all([getSeoSettings(), getCategoryTree(), getActiveSales().catch(() => [])])

  const categories = tree.roots
    .filter((root) => isCategoryPathVisible(tree, root.id))
    .map((root) => {
      const children = root.children.filter((c) => c.isVisible).map((c) => `[${c.name}](${baseUrl}/obchod/${c.slug})`)
      return `- [${root.name}](${baseUrl}/obchod/${root.slug})${root.description ? `: ${root.description}` : ''}${children.length ? ` (${children.join(', ')})` : ''}`
    })

  const locations = Object.values(PICKUP_LOCATIONS).map(
    (l) => `- ${l.name} – ${l.place}, ${l.address}, ${l.zip} ${l.city} (${l.hours.map((h) => `${h.days} ${h.time}`).join('; ')})`
  )

  const text = `# Monlii

> ${seo.description}

${seo.about}

Témata: ${keywordList(seo).join(', ')}.

## Obchod

- [Celý obchod](${baseUrl}/obchod)
${categories.join('\n')}
${sales.length ? sales.map((s) => `- [${s.name}](${baseUrl}/vyprodej/${s.slug}) – sleva ${s.discountPercent} %`).join('\n') : ''}

## Informace

- [O nás](${baseUrl}/o-nas): příběh rodinné značky a co je pro nás důležité
- [Doprava a platba](${baseUrl}/doprava): Z-BOX Zásilkovny ${ZASILKOVNA_CONFIG.zboxDeliveryPrice} Kč, zdarma od ${ZASILKOVNA_CONFIG.freeShippingThreshold} Kč; osobní odběr zdarma; platba QR kódem, dobírkou nebo na prodejně
- [Obchodní podmínky](${baseUrl}/obchodni-podminky)
- [Reklamace](${baseUrl}/reklamace)
- [Kontakty](${baseUrl}/kontakty)

## Kde nás najdete

${locations.join('\n')}

## Kontakt

${[seo.email && `- E-mail: ${seo.email}`, seo.phone && `- Telefon: ${seo.phone}`, seo.instagram && `- Instagram: ${seo.instagram}`, seo.facebook && `- Facebook: ${seo.facebook}`].filter(Boolean).join('\n')}
`.replace(/\n{3,}/g, '\n\n')

  return new Response(text, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } })
}
