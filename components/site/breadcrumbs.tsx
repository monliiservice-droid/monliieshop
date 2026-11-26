import Link from 'next/link'
import { JsonLd } from './structured-data'

export function Breadcrumbs({ items }: { items: { label: string; href?: string }[] }) {
  const baseUrl = process.env.NEXT_PUBLIC_URL || 'https://monlii.cz'
  // Drobečky i pro Google (zobrazí cestu ve výsledcích místo dlouhé adresy)
  const breadcrumbList = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.label,
      ...(item.href && { item: `${baseUrl}${item.href}` }),
    })),
  }
  return (
    <>
    <JsonLd data={breadcrumbList} />
    <nav aria-label="Drobečková navigace" className="text-[13px] font-medium uppercase tracking-[0.12em] text-ink-soft md:text-sm">
      <ol className="flex flex-wrap items-center gap-x-2.5 gap-y-1.5">
        {items.map((item, index) => (
          <li key={index} className="flex items-center gap-2.5">
            {index > 0 && <span aria-hidden="true" className="text-clay">›</span>}
            {item.href ? (
              <Link href={item.href} className="link-line transition-colors hover:text-wine">{item.label}</Link>
            ) : (
              <span aria-current="page" className="font-semibold text-ink">{item.label}</span>
            )}
          </li>
        ))}
      </ol>
    </nav>
    </>
  )
}
