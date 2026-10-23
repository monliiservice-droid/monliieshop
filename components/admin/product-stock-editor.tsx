'use client'

import { useState } from 'react'
import Link from 'next/link'
import { EyeOff, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { SIZE_LABELS, SIZE_TYPES, SIZE_TYPE_LABELS, getSizeFields, type SizeType } from '@/lib/product-types'
import { stockCellKey, type ProductFormValues } from '@/lib/product-form-values'

const selectClass =
  'flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring'

type Update = <K extends keyof ProductFormValues>(key: K, value: ProductFormValues[K]) => void

interface ProductStockEditorProps {
  values: ProductFormValues
  update: Update
  categorySizeType: SizeType
  sizeType: SizeType
}

/** Hodnota buňky tabulky skladu – u nově přidaných velikostí/barev je výchozí 0 ks, u kombinací, které produkt neměl, „nenabízí se“. */
export function cellValue(values: ProductFormValues, size: string, color: string): string {
  const stored = values.variantStock[stockCellKey(size, color)]
  if (stored !== undefined) return stored
  return values.loadedSizes.includes(size) && values.loadedColors.includes(color) ? 'off' : '0'
}

/** Vybrané hodnoty pole velikostí (bez uloženého výběru = všechny) */
export function selectedOptions(values: ProductFormValues, field: { name: string; options: readonly string[] }): string[] {
  const stored = values.sizeOptions[field.name]
  const list = stored && stored.length > 0 ? field.options.filter((o) => stored.includes(o)) : [...field.options]
  return list.length > 0 ? list : [...field.options]
}

/** Řádky (hlavní velikosti) a sloupce (barvy) tabulky skladu */
export function stockGrid(values: ProductFormValues, sizeType: SizeType) {
  const fields = getSizeFields(sizeType, values.setConfig.braType)
  const sizes = fields[0] ? selectedOptions(values, fields[0]) : ['']
  const colors = values.colors.length > 0 ? values.colors.map((c) => c.name) : ['']
  return { fields, sizes, colors }
}

export function ProductStockEditor({ values, update, categorySizeType, sizeType }: ProductStockEditorProps) {
  const [fillValue, setFillValue] = useState('')
  const { fields, sizes, colors } = stockGrid(values, sizeType)
  const hasColors = values.colors.length > 0

  const toggleOption = (field: { name: string; options: readonly string[] }, option: string) => {
    const current = selectedOptions(values, field)
    const next = current.includes(option) ? current.filter((o) => o !== option) : [...current, option]
    if (next.length === 0) return // aspoň jedna velikost musí zůstat
    update('sizeOptions', { ...values.sizeOptions, [field.name]: field.options.filter((o) => next.includes(o)) })
  }

  const setCell = (size: string, color: string, value: string) =>
    update('variantStock', { ...values.variantStock, [stockCellKey(size, color)]: value })

  const fillAll = () => {
    const amount = parseInt(fillValue, 10)
    if (!Number.isInteger(amount) || amount < 0) return
    const next = { ...values.variantStock }
    for (const size of sizes) {
      for (const color of colors) {
        if (cellValue(values, size, color) !== 'off') next[stockCellKey(size, color)] = String(amount)
      }
    }
    update('variantStock', next)
  }

  const total = sizes.reduce(
    (sum, size) => sum + colors.reduce((s, color) => s + (parseInt(cellValue(values, size, color), 10) || 0), 0),
    0
  )

  return (
    <Card>
      <CardHeader>
        <CardTitle>Velikosti a sklad</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="sizeType">Typ velikostí</Label>
          <select id="sizeType" value={values.sizeType} onChange={(e) => update('sizeType', e.target.value)} className={selectClass}>
            <option value="">Podle kategorie – {SIZE_TYPE_LABELS[categorySizeType]}</option>
            {SIZE_TYPES.map((t) => (
              <option key={t} value={t}>{SIZE_TYPE_LABELS[t]}</option>
            ))}
          </select>
          <p className="text-xs text-gray-500">
            Výchozí typ se dědí z kategorie (nastavuje se v sekci <Link href="/admin/kategorie" className="underline">Kategorie</Link>).
            Tady ho můžete pro tento produkt změnit.
          </p>
        </div>

        {fields.map((field) => {
          const selected = selectedOptions(values, field)
          return (
            <div key={field.name} className="space-y-2">
              <Label>{field.label} – dostupné velikosti</Label>
              <div className="flex flex-wrap gap-2">
                {field.options.map((option) => {
                  const active = selected.includes(option)
                  return (
                    <button
                      key={option}
                      type="button"
                      onClick={() => toggleOption(field, option)}
                      aria-pressed={active}
                      className={`min-w-11 rounded-md border px-3 py-1.5 text-sm transition-colors ${active ? 'border-gray-900 bg-gray-900 text-white' : 'border-gray-200 bg-white text-gray-400 line-through hover:border-gray-400'}`}
                    >
                      {SIZE_LABELS[option] || option}
                    </button>
                  )
                })}
              </div>
            </div>
          )
        })}

        <div className="space-y-3 border-t pt-5">
          <Label>Sklad</Label>
          <div className="inline-flex rounded-md border p-0.5">
            {([
              ['variants', fields.length > 0 || hasColors ? 'Po velikostech a barvách' : 'Po variantách'],
              ['single', 'Jedno číslo za produkt'],
            ] as const).map(([mode, label]) => (
              <button
                key={mode}
                type="button"
                onClick={() => update('stockMode', mode)}
                aria-pressed={values.stockMode === mode}
                className={`rounded px-3 py-1.5 text-sm ${values.stockMode === mode ? 'bg-gray-900 text-white' : 'text-gray-600 hover:text-gray-900'}`}
              >
                {label}
              </button>
            ))}
          </div>

          {values.stockMode === 'single' ? (
            <div className="max-w-40 space-y-2">
              <Label htmlFor="stock">Skladem celkem (ks)</Label>
              <Input id="stock" type="number" min="0" step="1" required value={values.stock} onChange={(e) => update('stock', e.target.value)} />
              <p className="text-xs text-gray-500">Zákazník si vybere libovolnou dostupnou velikost a barvu.</p>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="overflow-x-auto rounded-md border">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 text-left text-xs text-gray-500">
                    <tr>
                      <th className="px-3 py-2 font-medium">{fields[0] ? 'Velikost' : ''}</th>
                      {colors.map((color) => (
                        <th key={color} className="px-3 py-2 font-medium">
                          {color ? (
                            <span className="flex items-center gap-1.5">
                              <span className="h-3 w-3 rounded-full border" style={{ backgroundColor: values.colors.find((c) => c.name === color)?.hex }} />
                              {color}
                            </span>
                          ) : (
                            'Skladem (ks)'
                          )}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {sizes.map((size) => (
                      <tr key={size} className="border-t">
                        <td className="whitespace-nowrap px-3 py-2 font-medium">{size ? SIZE_LABELS[size] || size : 'Produkt'}</td>
                        {colors.map((color) => {
                          const value = cellValue(values, size, color)
                          const label = [size, color].filter(Boolean).join(' / ') || 'produkt'
                          return (
                            <td key={color} className="px-2 py-1.5">
                              {value === 'off' ? (
                                <button
                                  type="button"
                                  onClick={() => setCell(size, color, '0')}
                                  className="flex h-9 w-24 items-center justify-center gap-1 rounded-md border border-dashed text-xs text-gray-400 hover:border-gray-400 hover:text-gray-700"
                                  title="Kombinace se nenabízí – kliknutím ji přidáte"
                                >
                                  <Plus className="h-3.5 w-3.5" /> nenabízí se
                                </button>
                              ) : (
                                <div className="flex items-center gap-1">
                                  <Input
                                    type="number"
                                    min="0"
                                    step="1"
                                    required
                                    aria-label={`Skladem ${label}`}
                                    value={value}
                                    onChange={(e) => setCell(size, color, e.target.value)}
                                    className={`h-9 w-16 ${value === '0' ? 'text-gray-400' : ''}`}
                                  />
                                  {(sizes.length > 1 || colors.length > 1) && (
                                    <button
                                      type="button"
                                      onClick={() => setCell(size, color, 'off')}
                                      className="rounded p-1 text-gray-300 hover:text-gray-700"
                                      aria-label={`Nenabízet ${label}`}
                                      title="Tuto kombinaci nenabízet"
                                    >
                                      <EyeOff className="h-3.5 w-3.5" />
                                    </button>
                                  )}
                                </div>
                              )}
                            </td>
                          )
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <Input type="number" min="0" step="1" value={fillValue} onChange={(e) => setFillValue(e.target.value)} placeholder="ks" className="h-9 w-20" aria-label="Počet kusů pro všechny" />
                <Button type="button" variant="outline" size="sm" onClick={fillAll}>Vyplnit všem</Button>
                <span className="ml-auto text-sm text-gray-500">Celkem skladem: <strong className="text-gray-900">{total} ks</strong></span>
              </div>
              <p className="text-xs text-gray-500">
                Řádky jsou dostupné velikosti{fields.length > 1 ? ` (sklad se vede podle pole „${fields[0].label}“)` : ''}, sloupce barvy z karty Barvy.
                Kombinaci, která neexistuje, skryjete ikonou oka.
              </p>
            </div>
          )}
        </div>

        <div className="space-y-3 border-t pt-5">
          <Label>Když zboží dojde</Label>
          <label className="flex items-start gap-3">
            <input type="radio" name="backorder" className="mt-1 h-4 w-4" checked={!values.allowBackorder} onChange={() => update('allowBackorder', false)} />
            <span className="text-sm">
              <span className="font-medium">Prodávat jen to, co je skladem</span>
              <span className="block text-gray-500">Vyprodaná velikost nebo barva nejde objednat.</span>
            </span>
          </label>
          <label className="flex items-start gap-3">
            <input type="radio" name="backorder" className="mt-1 h-4 w-4" checked={values.allowBackorder} onChange={() => update('allowBackorder', true)} />
            <span className="text-sm">
              <span className="font-medium">Přijímat objednávky na zakázku</span>
              <span className="block text-gray-500">Co není skladem, jde objednat a ušije se. V objednávce bude označeno „na zakázku“.</span>
            </span>
          </label>
          {values.allowBackorder && (
            <div className="ml-7 max-w-xs space-y-2">
              <Label htmlFor="leadTime">Doba výroby (zobrazí se zákazníkovi)</Label>
              <Input id="leadTime" value={values.backorderLeadTime} onChange={(e) => update('backorderLeadTime', e.target.value)} placeholder="např. 2–3 týdny" />
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
