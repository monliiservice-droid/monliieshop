'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { ExternalLink, Pencil, Plus, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { ImageField } from '@/components/admin/image-field'
import { flattenCategories, type CategoryOption } from '@/lib/category-options'

type Scope = 'all' | 'categories' | 'products'

interface Sale {
  id: string
  name: string
  slug: string
  description: string | null
  bannerImage: string | null
  discountPercent: number
  startsAt: string
  endsAt: string | null
  isActive: boolean
  showInMenu: boolean
  scope: Scope
  productIds: string[]
  categoryIds: string[]
}

interface SaleForm {
  id?: string
  name: string
  slug: string
  description: string
  bannerImage: string
  discountPercent: string
  startsAt: string
  endsAt: string
  isActive: boolean
  showInMenu: boolean
  scope: Scope
  productIds: string[]
  categoryIds: string[]
}

interface ProductOption {
  id: string
  name: string
  categoryRef: { name: string } | null
}

/** Datum do pole datetime-local (v místním čase) */
function toLocalInput(value: string | Date | null): string {
  if (!value) return ''
  const date = new Date(value)
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`
}

function saleStatus(sale: Sale): { label: string; className: string } {
  const now = Date.now()
  if (!sale.isActive) return { label: 'Vypnuto', className: 'bg-gray-100 text-gray-600' }
  if (new Date(sale.startsAt).getTime() > now) return { label: 'Naplánováno', className: 'bg-blue-100 text-blue-800' }
  if (sale.endsAt && new Date(sale.endsAt).getTime() <= now) return { label: 'Skončilo', className: 'bg-gray-100 text-gray-600' }
  return { label: 'Probíhá', className: 'bg-green-100 text-green-800' }
}

const SCOPE_LABELS: Record<Scope, string> = {
  all: 'Celý obchod',
  categories: 'Vybrané kategorie',
  products: 'Vybrané produkty',
}

function emptyForm(): SaleForm {
  return {
    name: '',
    slug: '',
    description: '',
    bannerImage: '',
    discountPercent: '20',
    startsAt: toLocalInput(new Date()),
    endsAt: '',
    isActive: true,
    showInMenu: true,
    scope: 'all',
    productIds: [],
    categoryIds: [],
  }
}

export default function SalesPage() {
  const [sales, setSales] = useState<Sale[]>([])
  const [categories, setCategories] = useState<CategoryOption[]>([])
  const [products, setProducts] = useState<ProductOption[]>([])
  const [form, setForm] = useState<SaleForm | null>(null)
  const [productSearch, setProductSearch] = useState('')
  const [saving, setSaving] = useState(false)

  const load = useCallback(async () => {
    const [salesRes, categoriesRes, productsRes] = await Promise.all([
      fetch('/api/admin/sales'),
      fetch('/api/admin/categories'),
      fetch('/api/admin/products'),
    ])
    if (salesRes.ok) setSales(await salesRes.json())
    if (categoriesRes.ok) setCategories(await categoriesRes.json())
    if (productsRes.ok) setProducts(await productsRes.json())
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const categoryRows = useMemo(() => flattenCategories(categories), [categories])
  const filteredProducts = useMemo(() => {
    const q = productSearch.trim().toLowerCase()
    return q ? products.filter((p) => p.name.toLowerCase().includes(q)) : products
  }, [products, productSearch])

  const toggleId = (key: 'productIds' | 'categoryIds', id: string) => {
    if (!form) return
    const list = form[key]
    setForm({ ...form, [key]: list.includes(id) ? list.filter((x) => x !== id) : [...list, id] })
  }

  const save = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form) return
    setSaving(true)
    try {
      const res = await fetch(form.id ? `/api/admin/sales/${form.id}` : '/api/admin/sales', {
        method: form.id ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          discountPercent: parseFloat(form.discountPercent),
          startsAt: form.startsAt ? new Date(form.startsAt).toISOString() : null,
          endsAt: form.endsAt ? new Date(form.endsAt).toISOString() : null,
        }),
      })
      const result = await res.json().catch(() => ({}))
      if (!res.ok) {
        toast.error(result.message || 'Výprodej se nepodařilo uložit')
        return
      }
      toast.success('Výprodej uložen')
      setForm(null)
      load()
    } finally {
      setSaving(false)
    }
  }

  const remove = async (sale: Sale) => {
    if (!confirm(`Smazat výprodej „${sale.name}“?`)) return
    const res = await fetch(`/api/admin/sales/${sale.id}`, { method: 'DELETE' })
    if (res.ok) {
      toast.success('Výprodej smazán')
      load()
    }
  }

  return (
    <div>
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="mb-2 text-3xl font-bold">Výprodeje a akce</h1>
          <p className="max-w-2xl text-gray-600">
            Časově omezené akce – sezónní výprodej, doprodej skladu, Black Friday… Sleva se během akce automaticky
            projeví v cenách, akce dostane vlastní stránku a odkaz v menu.
          </p>
        </div>
        <Button onClick={() => setForm(emptyForm())}>
          <Plus className="mr-2 h-4 w-4" /> Nový výprodej
        </Button>
      </div>

      <div className="grid gap-4">
        {sales.length === 0 && (
          <Card>
            <CardContent className="p-6 text-gray-500">Zatím žádné výprodeje.</CardContent>
          </Card>
        )}
        {sales.map((sale) => {
          const status = saleStatus(sale)
          return (
            <Card key={sale.id}>
              <CardContent className="flex flex-wrap items-center gap-4 p-5">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-[#931e31] text-lg font-semibold text-white">
                  −{sale.discountPercent}%
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-semibold">{sale.name}</h3>
                    <Badge className={`${status.className} hover:${status.className}`}>{status.label}</Badge>
                  </div>
                  <p className="mt-1 text-sm text-gray-500">
                    {SCOPE_LABELS[sale.scope]}
                    {sale.scope === 'products' && ` (${sale.productIds.length})`}
                    {sale.scope === 'categories' && ` (${sale.categoryIds.length})`}
                    {' · '}
                    {new Date(sale.startsAt).toLocaleString('cs-CZ', { dateStyle: 'medium', timeStyle: 'short' })}
                    {' – '}
                    {sale.endsAt ? new Date(sale.endsAt).toLocaleString('cs-CZ', { dateStyle: 'medium', timeStyle: 'short' }) : 'bez konce'}
                  </p>
                </div>
                <div className="flex items-center gap-1">
                  <Link href={`/vyprodej/${sale.slug}`} target="_blank">
                    <Button variant="ghost" size="sm" title="Zobrazit na webu"><ExternalLink className="h-4 w-4" /></Button>
                  </Link>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() =>
                      setForm({
                        id: sale.id,
                        name: sale.name,
                        slug: sale.slug,
                        description: sale.description || '',
                        bannerImage: sale.bannerImage || '',
                        discountPercent: String(sale.discountPercent),
                        startsAt: toLocalInput(sale.startsAt),
                        endsAt: toLocalInput(sale.endsAt),
                        isActive: sale.isActive,
                        showInMenu: sale.showInMenu,
                        scope: sale.scope,
                        productIds: sale.productIds,
                        categoryIds: sale.categoryIds,
                      })
                    }
                    title="Upravit"
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => remove(sale)} title="Smazat">
                    <Trash2 className="h-4 w-4 text-red-600" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <Dialog open={form !== null} onOpenChange={(open) => !open && setForm(null)}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
          <DialogTitle>{form?.id ? 'Upravit výprodej' : 'Nový výprodej'}</DialogTitle>
          {form && (
            <form className="space-y-5" onSubmit={save}>
              <div className="grid gap-4 sm:grid-cols-[1fr_140px]">
                <div className="space-y-2">
                  <Label htmlFor="sale-name">Název akce *</Label>
                  <Input id="sale-name" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Letní výprodej" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="sale-pct">Sleva (%) *</Label>
                  <Input id="sale-pct" type="number" min="1" max="99" required value={form.discountPercent} onChange={(e) => setForm({ ...form, discountPercent: e.target.value })} />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="sale-slug">URL stránky akce</Label>
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  /vyprodej/
                  <Input id="sale-slug" value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} placeholder="vytvoří se z názvu" />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="sale-desc">Popis</Label>
                <Textarea id="sale-desc" rows={2} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Doprodej letní kolekce – jen do konce měsíce." />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="sale-start">Začátek</Label>
                  <Input id="sale-start" type="datetime-local" value={form.startsAt} onChange={(e) => setForm({ ...form, startsAt: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="sale-end">Konec (nepovinné)</Label>
                  <Input id="sale-end" type="datetime-local" value={form.endsAt} onChange={(e) => setForm({ ...form, endsAt: e.target.value })} />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Na co se sleva vztahuje</Label>
                <div className="flex flex-wrap gap-2">
                  {(Object.keys(SCOPE_LABELS) as Scope[]).map((scope) => (
                    <button
                      key={scope}
                      type="button"
                      onClick={() => setForm({ ...form, scope })}
                      className={`rounded-full border px-4 py-1.5 text-sm ${form.scope === scope ? 'border-[#931e31] bg-[#931e31] text-white' : 'hover:bg-gray-50'}`}
                    >
                      {SCOPE_LABELS[scope]}
                    </button>
                  ))}
                </div>
              </div>

              {form.scope === 'categories' && (
                <div className="max-h-56 space-y-1 overflow-y-auto rounded-lg border p-3">
                  {categoryRows.map((c) => (
                    <label key={c.id} className="flex items-center gap-2 text-sm" style={{ paddingLeft: c.depth * 18 }}>
                      <input type="checkbox" checked={form.categoryIds.includes(c.id)} onChange={() => toggleId('categoryIds', c.id)} />
                      {c.name}
                    </label>
                  ))}
                  <p className="pt-2 text-xs text-gray-500">Sleva na kategorii platí i pro všechny její podkategorie.</p>
                </div>
              )}

              {form.scope === 'products' && (
                <div className="space-y-2 rounded-lg border p-3">
                  <Input placeholder="Hledat produkt…" value={productSearch} onChange={(e) => setProductSearch(e.target.value)} />
                  <div className="max-h-56 space-y-1 overflow-y-auto">
                    {filteredProducts.map((p) => (
                      <label key={p.id} className="flex items-center gap-2 text-sm">
                        <input type="checkbox" checked={form.productIds.includes(p.id)} onChange={() => toggleId('productIds', p.id)} />
                        {p.name}
                        {p.categoryRef && <span className="text-xs text-gray-400">· {p.categoryRef.name}</span>}
                      </label>
                    ))}
                  </div>
                  <p className="text-xs text-gray-500">Vybráno: {form.productIds.length}</p>
                </div>
              )}

              <ImageField label="Banner akce" value={form.bannerImage} onChange={(bannerImage) => setForm({ ...form, bannerImage })} hint="Zobrazí se na stránce akce a v sekci Výprodej na homepage." />

              <div className="flex flex-wrap gap-6 text-sm">
                <label className="flex items-center gap-2">
                  <input type="checkbox" checked={form.isActive} onChange={(e) => setForm({ ...form, isActive: e.target.checked })} />
                  Akce zapnutá
                </label>
                <label className="flex items-center gap-2">
                  <input type="checkbox" checked={form.showInMenu} onChange={(e) => setForm({ ...form, showInMenu: e.target.checked })} />
                  Zobrazit odkaz v menu
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button type="button" variant="outline" onClick={() => setForm(null)}>Zrušit</Button>
                <Button type="submit" disabled={saving}>{saving ? 'Ukládám…' : 'Uložit'}</Button>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
