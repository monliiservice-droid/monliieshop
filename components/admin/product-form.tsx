'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ArrowLeft, ChevronLeft, ChevronRight, ImagePlus, Loader2, X } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { type SetConfiguration } from '@/lib/set-config-types'
import { EMPTY_PRODUCT_VALUES, type Color, type ProductFormValues } from '@/lib/product-form-values'
import { SIZE_TYPE_LABELS } from '@/lib/product-types'
import { effectiveSizeType, flattenCategories, type CategoryOption } from '@/lib/category-options'
import { uploadImages } from '@/lib/admin-upload'

type PriceKey = keyof SetConfiguration['prices']

const selectClass =
  'flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring'

interface ProductFormProps {
  productId?: string
  initialValues?: ProductFormValues
}

export function ProductForm({ productId, initialValues }: ProductFormProps) {
  const router = useRouter()
  const [values, setValues] = useState<ProductFormValues>(initialValues ?? EMPTY_PRODUCT_VALUES)
  const [categories, setCategories] = useState<CategoryOption[]>([])
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [newColor, setNewColor] = useState<Color>({ name: '', hex: '#000000' })
  const fileInput = useRef<HTMLInputElement>(null)

  useEffect(() => {
    fetch('/api/admin/categories')
      .then((res) => (res.ok ? res.json() : []))
      .then(setCategories)
      .catch(() => toast.error('Nepodařilo se načíst kategorie'))
  }, [])

  const categoryOptions = useMemo(() => flattenCategories(categories), [categories])
  const sizeType = effectiveSizeType(categories, values.categoryId)
  const isSet = sizeType === 'set'

  const update = <K extends keyof ProductFormValues>(key: K, value: ProductFormValues[K]) =>
    setValues((prev) => ({ ...prev, [key]: value }))

  const setPrice = (key: PriceKey, value: string) =>
    update('setConfig', {
      ...values.setConfig,
      prices: { ...values.setConfig.prices, [key]: parseFloat(value) || 0 },
    })

  const handleFiles = async (files: FileList | null) => {
    if (!files?.length) return
    setUploading(true)
    try {
      const urls = await uploadImages(Array.from(files))
      setValues((prev) => ({ ...prev, images: [...prev.images, ...urls] }))
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Nahrání se nezdařilo')
    } finally {
      setUploading(false)
      if (fileInput.current) fileInput.current.value = ''
    }
  }

  const moveImage = (index: number, direction: -1 | 1) => {
    const target = index + direction
    if (target < 0 || target >= values.images.length) return
    const images = [...values.images]
    ;[images[index], images[target]] = [images[target], images[index]]
    update('images', images)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    let price = parseFloat(values.price)
    if (isSet) {
      // U setů je základní cena nejnižší cena z variant
      const prices = Object.values(values.setConfig.prices).filter((p) => p > 0)
      if (prices.length === 0) {
        toast.error('Nastavte alespoň jednu cenu varianty setu')
        return
      }
      price = Math.min(...prices)
    }

    setSaving(true)
    try {
      const response = await fetch(productId ? `/api/admin/products/${productId}` : '/api/admin/products', {
        method: productId ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: values.name,
          description: values.description,
          price,
          stock: parseInt(values.stock, 10),
          categoryId: values.categoryId || null,
          images: JSON.stringify(values.images),
          colors: JSON.stringify(values.colors),
          isSet,
          setOptions: isSet ? JSON.stringify(values.setConfig) : '{}',
          isVisible: values.isVisible,
          isFeatured: values.isFeatured,
          hideWhenSoldOut: values.hideWhenSoldOut,
        }),
      })
      const result = await response.json().catch(() => ({}))
      if (!response.ok) {
        toast.error(result.message || 'Produkt se nepodařilo uložit')
        return
      }
      toast.success(productId ? 'Produkt uložen' : 'Produkt vytvořen')
      router.push('/admin/produkty')
      router.refresh()
    } catch {
      toast.error('Produkt se nepodařilo uložit')
    } finally {
      setSaving(false)
    }
  }

  const { setConfig } = values
  const braTypes: ('bralette' | 'wired')[] = setConfig.braType === 'both' ? ['bralette', 'wired'] : [setConfig.braType]

  return (
    <div>
      <div className="mb-8">
        <Link href="/admin/produkty">
          <Button variant="ghost" size="sm" className="mb-4">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Zpět na produkty
          </Button>
        </Link>
        <h1 className="text-3xl font-bold">{productId ? 'Upravit produkt' : 'Nový produkt'}</h1>
      </div>

      <form onSubmit={handleSubmit} className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Základní informace</CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="name">Název produktu *</Label>
                <Input id="name" required value={values.name} onChange={(e) => update('name', e.target.value)} placeholder="např. Set Velvet Rose" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Popis</Label>
                <Textarea id="description" rows={5} value={values.description} onChange={(e) => update('description', e.target.value)} placeholder="Materiál, střih, péče…" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="category">Kategorie</Label>
                <select id="category" value={values.categoryId} onChange={(e) => update('categoryId', e.target.value)} className={selectClass}>
                  <option value="">Bez kategorie</option>
                  {categoryOptions.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.path}
                    </option>
                  ))}
                </select>
                <p className="text-xs text-gray-500">
                  Velikosti: <strong>{SIZE_TYPE_LABELS[sizeType]}</strong>. Typ velikostí se nastavuje u kategorie v sekci{' '}
                  <Link href="/admin/kategorie" className="underline">Kategorie</Link>.
                </p>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                {!isSet && (
                  <div className="space-y-2">
                    <Label htmlFor="price">Cena (Kč) *</Label>
                    <Input id="price" type="number" min="0" step="1" required value={values.price} onChange={(e) => update('price', e.target.value)} />
                  </div>
                )}
                <div className="space-y-2">
                  <Label htmlFor="stock">Skladem (ks) *</Label>
                  <Input id="stock" type="number" min="0" step="1" required value={values.stock} onChange={(e) => update('stock', e.target.value)} />
                </div>
              </div>
            </CardContent>
          </Card>

          {isSet && (
            <Card>
              <CardHeader>
                <CardTitle>Konfigurace setu</CardTitle>
              </CardHeader>
              <CardContent className="space-y-5">
                <label className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    className="mt-1 h-4 w-4"
                    checked={setConfig.hasGartersOption}
                    onChange={(e) => update('setConfig', { ...setConfig, hasGartersOption: e.target.checked })}
                  />
                  <span className="text-sm">
                    <span className="font-medium">Zákazník si vybírá podvazky</span>
                    <span className="block text-gray-500">Varianta s podvazky a bez podvazků s vlastní cenou.</span>
                  </span>
                </label>
                <div className="space-y-2">
                  <Label htmlFor="braType">Typ podprsenky</Label>
                  <select
                    id="braType"
                    value={setConfig.braType}
                    onChange={(e) => update('setConfig', { ...setConfig, braType: e.target.value as SetConfiguration['braType'] })}
                    className={selectClass}
                  >
                    <option value="bralette">Pouze braletka</option>
                    <option value="wired">Pouze s kosticí</option>
                    <option value="both">Obojí – zákazník si vybere</option>
                  </select>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  {braTypes.flatMap((bra) => {
                    const braLabel = bra === 'bralette' ? 'Braletka' : 'S kosticí'
                    const variants: [PriceKey, string][] = setConfig.hasGartersOption
                      ? [
                          [`${bra}WithGarters`, `${braLabel} – s podvazky`],
                          [`${bra}WithoutGarters`, `${braLabel} – bez podvazků`],
                        ]
                      : [[`${bra}WithGarters`, braLabel]]
                    return variants.map(([key, label]) => (
                      <div key={key} className="space-y-2">
                        <Label htmlFor={key}>{label} (Kč) *</Label>
                        <Input id={key} type="number" min="0" step="1" required value={setConfig.prices[key] || ''} onChange={(e) => setPrice(key, e.target.value)} />
                      </div>
                    ))
                  })}
                </div>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle>Fotky</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                {values.images.map((url, index) => (
                  <div key={url + index} className="group relative aspect-[3/4] overflow-hidden rounded-lg border bg-gray-50">
                    <Image src={url} alt="" fill sizes="200px" unoptimized className="object-cover" />
                    {index === 0 && (
                      <span className="absolute left-2 top-2 rounded bg-black/70 px-2 py-0.5 text-[11px] font-medium text-white">Hlavní</span>
                    )}
                    <div className="absolute inset-x-2 bottom-2 flex justify-between opacity-100 sm:opacity-0 sm:group-hover:opacity-100">
                      <button type="button" onClick={() => moveImage(index, -1)} disabled={index === 0} className="rounded bg-white/90 p-1 disabled:opacity-30" aria-label="Posunout vlevo">
                        <ChevronLeft className="h-4 w-4" />
                      </button>
                      <button type="button" onClick={() => update('images', values.images.filter((_, i) => i !== index))} className="rounded bg-white/90 p-1 text-red-600" aria-label="Odebrat">
                        <X className="h-4 w-4" />
                      </button>
                      <button type="button" onClick={() => moveImage(index, 1)} disabled={index === values.images.length - 1} className="rounded bg-white/90 p-1 disabled:opacity-30" aria-label="Posunout vpravo">
                        <ChevronRight className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => fileInput.current?.click()}
                  disabled={uploading}
                  className="flex aspect-[3/4] flex-col items-center justify-center gap-2 rounded-lg border border-dashed text-sm text-gray-500 hover:border-gray-400 hover:text-gray-800"
                >
                  {uploading ? <Loader2 className="h-6 w-6 animate-spin" /> : <ImagePlus className="h-6 w-6" />}
                  {uploading ? 'Nahrávám…' : 'Přidat fotky'}
                </button>
              </div>
              <p className="text-xs text-gray-500">První fotka je hlavní, druhá se ukáže po najetí myší. Fotky se automaticky zmenší.</p>
              <input ref={fileInput} type="file" accept="image/*" multiple className="hidden" onChange={(e) => handleFiles(e.target.files)} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Barvy</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-wrap items-end gap-3">
                <div className="space-y-2">
                  <Label htmlFor="colorName">Název</Label>
                  <Input id="colorName" value={newColor.name} onChange={(e) => setNewColor({ ...newColor, name: e.target.value })} placeholder="Černá" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="colorHex">Barva</Label>
                  <Input id="colorHex" type="color" value={newColor.hex} onChange={(e) => setNewColor({ ...newColor, hex: e.target.value })} className="h-10 w-16 p-1" />
                </div>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    if (!newColor.name.trim()) return
                    update('colors', [...values.colors, { name: newColor.name.trim(), hex: newColor.hex }])
                    setNewColor({ name: '', hex: '#000000' })
                  }}
                >
                  Přidat barvu
                </Button>
              </div>
              {values.colors.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {values.colors.map((color, index) => (
                    <span key={index} className="flex items-center gap-2 rounded-full border px-3 py-1 text-sm">
                      <span className="h-4 w-4 rounded-full border" style={{ backgroundColor: color.hex }} />
                      {color.name}
                      <button type="button" onClick={() => update('colors', values.colors.filter((_, i) => i !== index))} aria-label={`Odebrat ${color.name}`}>
                        <X className="h-3.5 w-3.5 text-gray-500 hover:text-red-600" />
                      </button>
                    </span>
                  ))}
                </div>
              )}
              <p className="text-xs text-gray-500">Pokud produkt existuje jen v jedné barvě, nechte prázdné.</p>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="lg:sticky lg:top-6">
            <CardHeader>
              <CardTitle>Zobrazení</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <label className="flex items-start gap-3">
                <input type="checkbox" className="mt-1 h-4 w-4" checked={values.isVisible} onChange={(e) => update('isVisible', e.target.checked)} />
                <span className="text-sm">
                  <span className="font-medium">Zobrazit v obchodě</span>
                  <span className="block text-gray-500">Skrytý produkt zákazníci neuvidí.</span>
                </span>
              </label>
              <label className="flex items-start gap-3">
                <input type="checkbox" className="mt-1 h-4 w-4" checked={values.isFeatured} onChange={(e) => update('isFeatured', e.target.checked)} />
                <span className="text-sm">
                  <span className="font-medium">Doporučený produkt</span>
                  <span className="block text-gray-500">Pro sekci „Doporučené“ na homepage.</span>
                </span>
              </label>
              <label className="flex items-start gap-3">
                <input type="checkbox" className="mt-1 h-4 w-4" checked={values.hideWhenSoldOut} onChange={(e) => update('hideWhenSoldOut', e.target.checked)} />
                <span className="text-sm">
                  <span className="font-medium">Skrýt, když je vyprodáno</span>
                  <span className="block text-gray-500">Při nulovém skladu produkt z e-shopu zmizí. Jinak zůstane vidět s označením „Vyprodáno“.</span>
                </span>
              </label>
              <div className="flex gap-2 pt-2">
                <Button type="submit" disabled={saving || uploading} className="flex-1">
                  {saving ? 'Ukládám…' : productId ? 'Uložit změny' : 'Vytvořit produkt'}
                </Button>
                <Link href="/admin/produkty">
                  <Button type="button" variant="outline">Zrušit</Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </form>
    </div>
  )
}
