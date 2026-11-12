'use client'

import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { ImageField } from '@/components/admin/image-field'
import { DEFAULT_SEO_SETTINGS, type SeoSettings } from '@/lib/seo-settings'
import { toastNetworkError, toastResponseError } from '@/lib/admin-client'

function Counter({ value, ideal }: { value: string; ideal: [number, number] }) {
  const n = value.length
  const ok = n >= ideal[0] && n <= ideal[1]
  return (
    <span className={`text-xs ${ok ? 'text-green-700' : 'text-amber-700'}`}>
      {n} znaků (ideálně {ideal[0]}–{ideal[1]})
    </span>
  )
}

/** Texty pro vyhledávače, klíčová slova, údaje o firmě a ověření ve vyhledávačích */
export function SeoSettingsForm() {
  const [seo, setSeo] = useState<SeoSettings | null>(null)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetch('/api/admin/seo-settings')
      .then((res) => (res.ok ? res.json() : Promise.reject()))
      .then(setSeo)
      .catch(() => toast.error('SEO nastavení se nepodařilo načíst'))
  }, [])

  if (!seo) return <p className="text-gray-500">Načítám…</p>

  const set = (key: keyof SeoSettings, value: string) => setSeo({ ...seo, [key]: value })
  const field = (key: keyof SeoSettings, label: string, placeholder?: string) => (
    <div className="space-y-1.5">
      <Label htmlFor={`seo-${key}`}>{label}</Label>
      <Input id={`seo-${key}`} value={seo[key]} placeholder={placeholder} onChange={(e) => set(key, e.target.value)} />
    </div>
  )

  const save = async () => {
    setSaving(true)
    try {
      const res = await fetch('/api/admin/seo-settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(seo),
      })
      if (!res.ok) {
        await toastResponseError(res, 'SEO nastavení se nepodařilo uložit')
        return
      }
      setSeo(await res.json())
      toast.success('SEO nastavení uloženo – projeví se na webu')
    } catch {
      toastNetworkError('SEO nastavení se nepodařilo uložit')
    } finally {
      setSaving(false)
    }
  }

  const host = (process.env.NEXT_PUBLIC_URL || 'https://monlii.cz').replace(/^https?:\/\//, '')

  return (
    <div className="max-w-3xl space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Výsledky vyhledávání</CardTitle>
          <CardDescription>Jak se homepage zobrazí v Googlu a Seznamu. Ostatní stránky a produkty mají vlastní texty.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-lg border bg-white p-4">
            <p className="text-xs text-gray-600">{host}</p>
            <p className="truncate text-lg text-[#1a0dab]">{seo.title || 'Titulek'}</p>
            <p className="line-clamp-2 text-sm text-gray-700">{seo.description || 'Popis'}</p>
          </div>
          <div className="space-y-1.5">
            <div className="flex items-baseline justify-between">
              <Label htmlFor="seo-title">Titulek</Label>
              <Counter value={seo.title} ideal={[30, 60]} />
            </div>
            <Input id="seo-title" value={seo.title} onChange={(e) => set('title', e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <div className="flex items-baseline justify-between">
              <Label htmlFor="seo-description">Popis</Label>
              <Counter value={seo.description} ideal={[120, 160]} />
            </div>
            <Textarea id="seo-description" rows={3} value={seo.description} onChange={(e) => set('description', e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="seo-keywords">Klíčová slova</Label>
            <Textarea id="seo-keywords" rows={3} value={seo.keywords} onChange={(e) => set('keywords', e.target.value)} />
            <p className="text-xs text-gray-500">
              Oddělujte čárkou. Google samotné meta klíčové slova nečte – rozhoduje, jestli tato slova opravdu zazní v nadpisech a textech
              stránek, kategorií a produktů. Použijí se i v podkladech pro AI asistenty.
            </p>
          </div>
          <ImageField label="Obrázek pro sdílení (Facebook, WhatsApp…)" value={seo.shareImage} onChange={(url) => set('shareImage', url)} hint="Ideálně 1200 × 630 px." />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Firma pro Google a AI</CardTitle>
          <CardDescription>
            Z těchto údajů se skládají strukturovaná data a souhrn webu pro AI asistenty (monlii.cz/llms.txt). Měly by se shodovat s firemním
            profilem na Googlu.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="seo-about">Popis firmy</Label>
            <Textarea id="seo-about" rows={5} value={seo.about} onChange={(e) => set('about', e.target.value)} />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {field('email', 'E-mail')}
            {field('phone', 'Telefon')}
            {field('instagram', 'Instagram')}
            {field('facebook', 'Facebook')}
          </div>
          {field('googleBusinessUrl', 'Odkaz na firemní profil Google', 'https://maps.app.goo.gl/…')}
          <p className="text-xs text-gray-500">V profilu na Googlu klikněte na Sdílet a zkopírujte odkaz.</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Ověření ve vyhledávačích</CardTitle>
          <CardDescription>
            Vložte kód z webmasterských nástrojů (celou meta značku nebo jen hodnotu content). Google Search Console doporučujeme ověřit přes
            DNS – pak sem nic vyplňovat nemusíte.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {field('googleVerification', 'Google Search Console (google-site-verification)')}
          {field('seznamVerification', 'Seznam Webmaster (seznam-wmt)')}
          {field('bingVerification', 'Bing Webmaster (msvalidate.01) – i pro ChatGPT a Copilot')}
        </CardContent>
      </Card>

      <div className="flex gap-2">
        <Button onClick={save} disabled={saving}>{saving ? 'Ukládám…' : 'Uložit SEO'}</Button>
        <Button variant="outline" onClick={() => confirm('Vrátit doporučené texty? Uloží se až tlačítkem Uložit.') && setSeo({ ...DEFAULT_SEO_SETTINGS, googleVerification: seo.googleVerification, seznamVerification: seo.seznamVerification, bingVerification: seo.bingVerification, googleBusinessUrl: seo.googleBusinessUrl })}>
          Doporučené texty
        </Button>
      </div>
    </div>
  )
}
