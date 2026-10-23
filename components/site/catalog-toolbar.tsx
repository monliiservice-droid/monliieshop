'use client'

import Link from 'next/link'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import type { CatalogSort } from '@/lib/catalog'

const SORT_OPTIONS: { value: CatalogSort; label: string }[] = [
  { value: 'default', label: 'Doporučené' },
  { value: 'newest', label: 'Nejnovější' },
  { value: 'price_asc', label: 'Nejlevnější' },
  { value: 'price_desc', label: 'Nejdražší' },
]

interface CatalogToolbarProps {
  count: number
  sort: CatalogSort
  filters?: { label: string; href: string; active: boolean }[]
}

/** Lišta nad produkty: podkategorie (odkazy) a řazení (mění parametr v URL) */
export function CatalogToolbar({ count, sort, filters = [] }: CatalogToolbarProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const changeSort = (value: string) => {
    const params = new URLSearchParams(searchParams.toString())
    if (value === 'default') params.delete('razeni')
    else params.set('razeni', value)
    const query = params.toString()
    router.push(query ? `${pathname}?${query}` : pathname, { scroll: false })
  }

  return (
    <div className="mb-10 flex flex-col gap-5 border-y border-line py-4 md:flex-row md:items-center md:justify-between">
      {filters.length > 0 ? (
        <div className="no-scrollbar -mx-1 flex gap-2 overflow-x-auto px-1">
          {filters.map((f) => (
            <Link
              key={f.href}
              href={f.href}
              scroll={false}
              className={`shrink-0 border px-4 py-2 text-[13px] transition-colors ${f.active ? 'border-ink bg-ink text-linen' : 'border-line hover:border-ink'}`}
            >
              {f.label}
            </Link>
          ))}
        </div>
      ) : (
        <span />
      )}
      <div className="flex items-center justify-between gap-6 text-[13px] md:justify-end">
        <span className="text-stone">{count} {count === 1 ? 'produkt' : count >= 2 && count <= 4 ? 'produkty' : 'produktů'}</span>
        <label className="flex items-center gap-2">
          <span className="text-stone">Řadit:</span>
          <select value={sort} onChange={(e) => changeSort(e.target.value)} className="cursor-pointer bg-transparent font-semibold focus:outline-none">
            {SORT_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </label>
      </div>
    </div>
  )
}
