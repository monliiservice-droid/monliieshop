'use client'

import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import type { ProductCardStyle, ShopSettings } from '@/lib/site-settings'

const CARD_STYLES: { value: ProductCardStyle; label: string; description: string }[] = [
  { value: 'classic', label: 'Klasické', description: 'Fotka, pod ní název a cena' },
  { value: 'minimal', label: 'Minimalistické', description: 'Větší fotka, drobný text bez kategorie' },
  { value: 'overlay', label: 'Přes fotku', description: 'Název a cena na fotce' },
]

export function StoreSettings() {
  const [settings, setSettings] = useState<ShopSettings | null>(null)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetch('/api/admin/site-settings')
      .then((res) => res.json())
      .then((data) => setSettings(data.shop))
      .catch(() => toast.error('Nastavení se nepodařilo načíst'))
  }, [])

  if (!settings) return <p className="text-gray-500">Načítám…</p>

  const save = async () => {
    setSaving(true)
    try {
      const res = await fetch('/api/admin/site-settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ shop: settings }),
      })
      if (res.ok) toast.success('Nastavení obchodu uloženo')
      else toast.error('Uložení se nezdařilo')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Zobrazení produktů</CardTitle>
          <CardDescription>Vzhled produktových karet v obchodě, kategoriích a výprodejích.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-3 sm:grid-cols-3">
            {CARD_STYLES.map((style) => (
              <button
                key={style.value}
                type="button"
                onClick={() => setSettings({ ...settings, productCardStyle: style.value })}
                className={`rounded-lg border p-4 text-left ${settings.productCardStyle === style.value ? 'border-[#931e31] ring-1 ring-[#931e31]' : 'hover:bg-gray-50'}`}
              >
                <span className="block font-medium">{style.label}</span>
                <span className="text-sm text-gray-500">{style.description}</span>
              </button>
            ))}
          </div>
          <div className="space-y-2">
            <Label>Počet sloupců na počítači</Label>
            <div className="flex gap-2">
              {([2, 3, 4] as const).map((cols) => (
                <button
                  key={cols}
                  type="button"
                  onClick={() => setSettings({ ...settings, productGridColumns: cols })}
                  className={`h-10 w-12 rounded-md border text-sm ${settings.productGridColumns === cols ? 'border-[#931e31] bg-[#931e31] text-white' : 'hover:bg-gray-50'}`}
                >
                  {cols}
                </button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Informační lišta</CardTitle>
          <CardDescription>Úzký pruh nad menu, např. doprava zdarma nebo aktuální akce.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={settings.announcement.enabled}
              onChange={(e) => setSettings({ ...settings, announcement: { ...settings.announcement, enabled: e.target.checked } })}
            />
            Zobrazit lištu
          </label>
          <div className="grid gap-4 sm:grid-cols-[2fr_1fr]">
            <div className="space-y-2">
              <Label htmlFor="ann-text">Text</Label>
              <Input id="ann-text" value={settings.announcement.text} onChange={(e) => setSettings({ ...settings, announcement: { ...settings.announcement, text: e.target.value } })} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="ann-link">Odkaz (nepovinné)</Label>
              <Input id="ann-link" value={settings.announcement.link} onChange={(e) => setSettings({ ...settings, announcement: { ...settings.announcement, link: e.target.value } })} placeholder="/obchod" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Předplatné</CardTitle>
          <CardDescription>Skrytím zmizí stránka předplatného, odkazy v menu i možnost ho objednat.</CardDescription>
        </CardHeader>
        <CardContent>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={settings.subscriptionEnabled} onChange={(e) => setSettings({ ...settings, subscriptionEnabled: e.target.checked })} />
            Nabízet předplatné v e-shopu
          </label>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button onClick={save} disabled={saving}>{saving ? 'Ukládám…' : 'Uložit nastavení obchodu'}</Button>
      </div>
    </div>
  )
}
