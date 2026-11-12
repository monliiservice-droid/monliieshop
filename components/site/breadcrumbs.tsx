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
    <nav aria-label="Drobečková navigace" className="text-[12px] text-stone">
      <ol className="flex flex-wrap items-center gap-x-2 gap-y-1">
        {items.map((item, index) => (
          <li key={index} className="flex items-center gap-2">
            {index > 0 && <span aria-hidden="true">/</span>}
            {item.href ? (
              <Link href={item.href} className="link-line hover:text-ink">{item.label}</Link>
            ) : (
              <span aria-current="page" className="text-ink">{item.label}</span>
            )}
          </li>
        ))}
      </ol>
    </nav>
    </>
  )
}
