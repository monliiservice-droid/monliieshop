'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { Eye, EyeOff, Pencil, Plus, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { ImageField } from '@/components/admin/image-field'
import { SIZE_TYPES, SIZE_TYPE_LABELS } from '@/lib/product-types'
import { effectiveSizeType, flattenCategories, type CategoryOption } from '@/lib/category-options'

interface CategoryForm {
  id?: string
  name: string
  slug: string
  parentId: string
  sizeType: string
  description: string
  image: string
  sortOrder: number
  isVisible: boolean
}

const EMPTY_FORM: CategoryForm = {
  name: '',
  slug: '',
  parentId: '',
  sizeType: '',
  description: '',
  image: '',
  sortOrder: 0,
  isVisible: true,
}

const selectClass = 'flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm'

export default function CategoriesPage() {
  const [categories, setCategories] = useState<CategoryOption[]>([])
  const [loading, setLoading] = useState(true)
  const [form, setForm] = useState<CategoryForm | null>(null)
  const [saving, setSaving] = useState(false)

  const load = useCallback(async () => {
    const res = await fetch('/api/admin/categories')
    if (res.ok) setCategories(await res.json())
    setLoading(false)
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const rows = useMemo(() => flattenCategories(categories), [categories])

  // Kategorie, pod které lze editovanou kategorii zařadit (ne pod sebe ani pod svého potomka)
  const parentOptions = useMemo(() => {
    if (!form?.id) return rows
    const blocked = new Set<string>([form.id])
    let changed = true
    while (changed) {
      changed = false
      for (const c of categories) {
        if (c.parentId && blocked.has(c.parentId) && !blocked.has(c.id)) {
          blocked.add(c.id)
          changed = true
        }
      }
    }
    return rows.filter((r) => !blocked.has(r.id))
  }, [form?.id, rows, categories])

  const openNew = (parentId = '') => {
    const siblings = categories.filter((c) => (c.parentId || '') === parentId)
    setForm({ ...EMPTY_FORM, parentId, sortOrder: siblings.length + 1 })
  }

  const openEdit = (c: CategoryOption) =>
    setForm({
      id: c.id,
      name: c.name,
      slug: c.slug,
      parentId: c.parentId || '',
      sizeType: c.sizeType || '',
      description: c.description || '',
      image: c.image || '',
      sortOrder: c.sortOrder,
      isVisible: c.isVisible,
    })

  const save = async (data: CategoryForm) => {
    setSaving(true)
    try {
      const res = await fetch(data.id ? `/api/admin/categories/${data.id}` : '/api/admin/categories', {
        method: data.id ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...data, parentId: data.parentId || null, sizeType: data.sizeType || null }),
      })
      const result = await res.json().catch(() => ({}))
      if (!res.ok) {
        toast.error(result.message || 'Kategorii se nepodařilo uložit')
        return false
      }
      toast.success('Kategorie uložena')
      await load()
      return true
    } finally {
      setSaving(false)
    }
  }

  const toggleVisible = (c: CategoryOption) =>
    save({
      id: c.id,
      name: c.name,
      slug: c.slug,
      parentId: c.parentId || '',
      sizeType: c.sizeType || '',
      description: c.description || '',
      image: c.image || '',
      sortOrder: c.sortOrder,
      isVisible: !c.isVisible,
    })

  const remove = async (c: CategoryOption) => {
    if (!confirm(`Smazat kategorii „${c.name}“? Podkategorie a produkty se přesunou o úroveň výš.`)) return
    const res = await fetch(`/api/admin/categories/${c.id}`, { method: 'DELETE' })
    if (res.ok) {
      toast.success('Kategorie smazána')
      load()
    } else {
      toast.error('Kategorii se nepodařilo smazat')
    }
  }

  return (
    <div>
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="mb-2 text-3xl font-bold">Kategorie</h1>
          <p className="max-w-2xl text-gray-600">
            Strom kategorií v menu a v obchodě. Nejvyšší úroveň (např. Ženy, Muži, Děti) se zobrazí v hlavním menu,
            podkategorie v jejich nabídce. Typ velikostí určuje, co zákazník u produktu vybírá.
          </p>
        </div>
        <Button onClick={() => openNew()}>
          <Plus className="mr-2 h-4 w-4" /> Nová kategorie
        </Button>
      </div>

      <Card>
        <CardContent className="p-0">
          {loading ? (
            <p className="p-6 text-gray-500">Načítám…</p>
          ) : rows.length === 0 ? (
            <p className="p-6 text-gray-500">Zatím žádné kategorie.</p>
          ) : (
            <ul className="divide-y">
              {rows.map((c) => (
                <li key={c.id} className={`flex flex-wrap items-center gap-3 px-4 py-3 ${c.isVisible ? '' : 'bg-gray-50 text-gray-400'}`}>
                  <div className="min-w-0 flex-1" style={{ paddingLeft: c.depth * 24 }}>
                    <div className="flex items-center gap-2">
                      {c.depth > 0 && <span className="text-gray-300">└</span>}
                      <span className={c.depth === 0 ? 'font-semibold' : 'font-medium'}>{c.name}</span>
                      <span className="text-xs text-gray-400">/{c.slug}</span>
                    </div>
                    <div className="mt-0.5 text-xs text-gray-500" style={{ paddingLeft: c.depth > 0 ? 18 : 0 }}>
                      {c.sizeType
                        ? SIZE_TYPE_LABELS[effectiveSizeType(categories, c.id)]
                        : `Velikosti: zděděno (${SIZE_TYPE_LABELS[effectiveSizeType(categories, c.id)]})`}
                      {' · '}
                      {c._count?.products ?? 0} produktů
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button variant="ghost" size="sm" onClick={() => openNew(c.id)} title="Přidat podkategorii">
                      <Plus className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => toggleVisible(c)} title={c.isVisible ? 'Skrýt' : 'Zobrazit'}>
                      {c.isVisible ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => openEdit(c)} title="Upravit">
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => remove(c)} title="Smazat">
                      <Trash2 className="h-4 w-4 text-red-600" />
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      <Dialog open={form !== null} onOpenChange={(open) => !open && setForm(null)}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-xl">
          <DialogTitle>{form?.id ? 'Upravit kategorii' : 'Nová kategorie'}</DialogTitle>
          {form && (
            <form
              className="space-y-4"
              onSubmit={async (e) => {
                e.preventDefault()
                if (await save(form)) setForm(null)
              }}
            >
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="cat-name">Název *</Label>
                  <Input id="cat-name" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cat-slug">URL (slug)</Label>
                  <Input id="cat-slug" value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} placeholder="vytvoří se z názvu" />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="cat-parent">Nadřazená kategorie</Label>
                <select id="cat-parent" className={selectClass} value={form.parentId} onChange={(e) => setForm({ ...form, parentId: e.target.value })}>
                  <option value="">— Hlavní kategorie (v menu) —</option>
                  {parentOptions.map((c) => (
                    <option key={c.id} value={c.id}>{c.path}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="cat-size">Typ velikostí</Label>
                <select id="cat-size" className={selectClass} value={form.sizeType} onChange={(e) => setForm({ ...form, sizeType: e.target.value })}>
                  <option value="">Zdědit od nadřazené kategorie</option>
                  {SIZE_TYPES.map((t) => (
                    <option key={t} value={t}>{SIZE_TYPE_LABELS[t]}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="cat-desc">Popis (zobrazí se nad produkty)</Label>
                <Textarea id="cat-desc" rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
              </div>
              <ImageField label="Obrázek kategorie" value={form.image} onChange={(image) => setForm({ ...form, image })} hint="Použije se v hlavičce kategorie." />
              <div className="flex flex-wrap items-center gap-6">
                <div className="w-28 space-y-2">
                  <Label htmlFor="cat-order">Pořadí</Label>
                  <Input id="cat-order" type="number" value={form.sortOrder} onChange={(e) => setForm({ ...form, sortOrder: parseInt(e.target.value, 10) || 0 })} />
                </div>
                <label className="mt-6 flex items-center gap-2 text-sm">
                  <input type="checkbox" checked={form.isVisible} onChange={(e) => setForm({ ...form, isVisible: e.target.checked })} />
                  Zobrazit v obchodě
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
