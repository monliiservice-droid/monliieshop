'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { ChevronDown, ChevronUp, Copy, ExternalLink, Eye, EyeOff, Pencil, Plus, RotateCcw, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { FieldsEditor, type EditorContext } from '@/components/admin/field-editor'
import { ImageField } from '@/components/admin/image-field'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { DEFAULT_SECTION_DATA, SECTION_TYPES, SECTION_TYPE_LABELS, type SectionType } from '@/lib/sections'
import { SECTION_FIELDS, sectionSummary } from '@/lib/section-fields'
import { PAGE_HEADER_LABELS, type PageHeaderKey, type PageHeaders } from '@/lib/site-settings'
import { flattenCategories, type CategoryOption } from '@/lib/category-options'
import { toastNetworkError, toastResponseError } from '@/lib/admin-client'

interface EditableSection {
  key: string // lokální klíč pro React (sekce se ukládají celé najednou)
  type: SectionType
  isVisible: boolean
  data: Record<string, any>
}

let keyCounter = 0
const nextKey = () => `s${Date.now()}-${keyCounter++}`

function toEditable(sections: any[]): EditableSection[] {
  return sections.map((s) => ({ key: nextKey(), type: s.type, isVisible: s.isVisible !== false, data: s.data }))
}

export default function ContentBuilderPage() {
  const [sections, setSections] = useState<EditableSection[]>([])
  const [openKey, setOpenKey] = useState<string | null>(null)
  const [dirty, setDirty] = useState(false)
  const [saving, setSaving] = useState(false)
  const [showAdd, setShowAdd] = useState(false)
  const [context, setContext] = useState<EditorContext>({ categories: [], sales: [] })
  const [headers, setHeaders] = useState<PageHeaders | null>(null)
  const [headersDirty, setHeadersDirty] = useState(false)

  const load = useCallback(async () => {
    const [sectionsRes, categoriesRes, salesRes, settingsRes] = await Promise.all([
      fetch('/api/admin/sections?page=home'),
      fetch('/api/admin/categories'),
      fetch('/api/admin/sales'),
      fetch('/api/admin/site-settings'),
    ])
    if (sectionsRes.ok) setSections(toEditable(await sectionsRes.json()))
    const categories: CategoryOption[] = categoriesRes.ok ? await categoriesRes.json() : []
    const sales: { id: string; name: string }[] = salesRes.ok ? await salesRes.json() : []
    setContext({ categories: flattenCategories(categories), sales })
    if (settingsRes.ok) setHeaders((await settingsRes.json()).pageHeaders)
  }, [])

  useEffect(() => {
    load()
  }, [load])

  // Upozornění při odchodu s neuloženými změnami
  useEffect(() => {
    if (!dirty && !headersDirty) return
    const handler = (e: BeforeUnloadEvent) => e.preventDefault()
    window.addEventListener('beforeunload', handler)
    return () => window.removeEventListener('beforeunload', handler)
  }, [dirty, headersDirty])

  const change = (updater: (prev: EditableSection[]) => EditableSection[]) => {
    setSections(updater)
    setDirty(true)
  }

  const move = (index: number, dir: -1 | 1) =>
    change((prev) => {
      const target = index + dir
      if (target < 0 || target >= prev.length) return prev
      const next = [...prev]
      ;[next[index], next[target]] = [next[target], next[index]]
      return next
    })

  const addSection = (type: SectionType) => {
    const key = nextKey()
    change((prev) => [...prev, { key, type, isVisible: true, data: structuredClone(DEFAULT_SECTION_DATA[type]) }])
    setOpenKey(key)
    setShowAdd(false)
  }

  const save = async () => {
    setSaving(true)
    try {
      const res = await fetch('/api/admin/sections', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ page: 'home', sections: sections.map(({ type, isVisible, data }) => ({ type, isVisible, data })) }),
      })
      if (!res.ok) {
        await toastResponseError(res, 'Homepage se nepodařilo uložit')
        return
      }
      setDirty(false)
      toast.success('Homepage uložena – změny jsou na webu')
    } catch {
      toastNetworkError('Homepage se nepodařilo uložit')
    } finally {
      setSaving(false)
    }
  }

  const resetToDefault = async () => {
    if (!confirm('Nahradit současné rozložení výchozím? Změny se projeví až po uložení.')) return
    const res = await fetch('/api/admin/sections?page=home&defaults=1')
    if (res.ok) {
      const defaults = await res.json()
      change(() => toEditable(defaults))
    }
  }

  const saveHeaders = async () => {
    if (!headers) return
    try {
      const res = await fetch('/api/admin/site-settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pageHeaders: headers }),
      })
      if (res.ok) {
        setHeadersDirty(false)
        toast.success('Hlavičky stránek uloženy')
      } else {
        await toastResponseError(res, 'Hlavičky se nepodařilo uložit')
      }
    } catch {
      toastNetworkError('Hlavičky se nepodařilo uložit')
    }
  }

  const setHeader = (key: PageHeaderKey, field: string, value: string) => {
    if (!headers) return
    setHeaders({ ...headers, [key]: { ...headers[key], [field]: value } })
    setHeadersDirty(true)
  }

  const hiddenCount = useMemo(() => sections.filter((s) => !s.isVisible).length, [sections])

  return (
    <div className="pb-24">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="mb-2 text-3xl font-bold">Obsah webu</h1>
          <p className="max-w-2xl text-gray-600">
            Sestavte si homepage ze sekcí – měňte texty, fotky, pořadí a viditelnost. V druhé záložce upravíte hlavičky
            ostatních stránek.
          </p>
        </div>
        <Link href="/" target="_blank">
          <Button variant="outline">
            <ExternalLink className="mr-2 h-4 w-4" /> Zobrazit web
          </Button>
        </Link>
      </div>

      <Tabs defaultValue="home">
        <TabsList>
          <TabsTrigger value="home">Homepage</TabsTrigger>
          <TabsTrigger value="headers">Hlavičky stránek</TabsTrigger>
        </TabsList>

        <TabsContent value="home" className="mt-6 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2 text-sm text-gray-500">
            <span>
              {sections.length} sekcí{hiddenCount > 0 && `, ${hiddenCount} skrytých`}
            </span>
            <Button variant="ghost" size="sm" onClick={resetToDefault}>
              <RotateCcw className="mr-1 h-4 w-4" /> Výchozí rozložení
            </Button>
          </div>

          {sections.map((section, index) => {
            const isOpen = openKey === section.key
            const meta = SECTION_TYPE_LABELS[section.type]
            return (
              <Card key={section.key} className={section.isVisible ? '' : 'opacity-60'}>
                <div className="flex flex-wrap items-center gap-3 p-4">
                  <div className="flex flex-col">
                    <button type="button" onClick={() => move(index, -1)} disabled={index === 0} className="rounded p-0.5 hover:bg-gray-100 disabled:opacity-30" aria-label="Posunout nahoru">
                      <ChevronUp className="h-4 w-4" />
                    </button>
                    <button type="button" onClick={() => move(index, 1)} disabled={index === sections.length - 1} className="rounded p-0.5 hover:bg-gray-100 disabled:opacity-30" aria-label="Posunout dolů">
                      <ChevronDown className="h-4 w-4" />
                    </button>
                  </div>
                  <button type="button" className="min-w-0 flex-1 text-left" onClick={() => setOpenKey(isOpen ? null : section.key)}>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-semibold">{meta.label}</span>
                      {!section.isVisible && <Badge variant="outline">Skryto</Badge>}
                    </div>
                    <p className="truncate text-sm text-gray-500">{sectionSummary(section.data) || meta.description}</p>
                  </button>
                  <div className="flex items-center gap-1">
                    <Button variant="ghost" size="sm" title={section.isVisible ? 'Skrýt' : 'Zobrazit'} onClick={() => change((prev) => prev.map((s) => (s.key === section.key ? { ...s, isVisible: !s.isVisible } : s)))}>
                      {section.isVisible ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                    </Button>
                    <Button variant="ghost" size="sm" title="Duplikovat" onClick={() => change((prev) => [...prev.slice(0, index + 1), { ...structuredClone(section), key: nextKey() }, ...prev.slice(index + 1)])}>
                      <Copy className="h-4 w-4" />
                    </Button>
                    <Button variant={isOpen ? 'secondary' : 'ghost'} size="sm" title="Upravit" onClick={() => setOpenKey(isOpen ? null : section.key)}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" title="Smazat" onClick={() => confirm(`Smazat sekci „${meta.label}“?`) && change((prev) => prev.filter((s) => s.key !== section.key))}>
                      <Trash2 className="h-4 w-4 text-red-600" />
                    </Button>
                  </div>
                </div>
                {isOpen && (
                  <CardContent className="border-t pt-5">
                    <FieldsEditor
                      fields={SECTION_FIELDS[section.type]}
                      value={section.data}
                      onChange={(data) => change((prev) => prev.map((s) => (s.key === section.key ? { ...s, data } : s)))}
                      context={context}
                      idPrefix={section.key}
                    />
                  </CardContent>
                )}
              </Card>
            )
          })}

          {showAdd ? (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Přidat sekci</CardTitle>
              </CardHeader>
              <CardContent className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                {SECTION_TYPES.map((type) => (
                  <button key={type} type="button" onClick={() => addSection(type)} className="rounded-lg border p-4 text-left hover:border-gray-400 hover:bg-gray-50">
                    <span className="block font-medium">{SECTION_TYPE_LABELS[type].label}</span>
                    <span className="text-sm text-gray-500">{SECTION_TYPE_LABELS[type].description}</span>
                  </button>
                ))}
              </CardContent>
            </Card>
          ) : (
            <Button variant="outline" className="w-full border-dashed" onClick={() => setShowAdd(true)}>
              <Plus className="mr-2 h-4 w-4" /> Přidat sekci
            </Button>
          )}

          {/* Lišta s uložením */}
          <div className="fixed inset-x-0 bottom-0 z-40 border-t bg-white/95 px-4 py-3 backdrop-blur md:left-64">
            <div className="flex items-center justify-end gap-3">
              {dirty && <span className="text-sm text-amber-700">Neuložené změny</span>}
              <Button onClick={save} disabled={!dirty || saving}>{saving ? 'Ukládám…' : 'Uložit homepage'}</Button>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="headers" className="mt-6 space-y-4">
          {headers &&
            (Object.keys(PAGE_HEADER_LABELS) as PageHeaderKey[]).map((key) => (
              <Card key={key}>
                <CardHeader>
                  <CardTitle className="text-base">{PAGE_HEADER_LABELS[key]}</CardTitle>
                </CardHeader>
                <CardContent className="grid gap-4 lg:grid-cols-2">
                  <div className="space-y-3">
                    <div className="space-y-1.5">
                      <Label htmlFor={`${key}-eyebrow`}>Nadtitulek</Label>
                      <Input id={`${key}-eyebrow`} value={headers[key].eyebrow} onChange={(e) => setHeader(key, 'eyebrow', e.target.value)} />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor={`${key}-title`}>Nadpis</Label>
                      <Input id={`${key}-title`} value={headers[key].title} onChange={(e) => setHeader(key, 'title', e.target.value)} />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor={`${key}-subtitle`}>Podnadpis</Label>
                      <Textarea id={`${key}-subtitle`} rows={2} value={headers[key].subtitle} onChange={(e) => setHeader(key, 'subtitle', e.target.value)} />
                    </div>
                  </div>
                  <ImageField label="Fotka" value={headers[key].image} onChange={(url) => setHeader(key, 'image', url)} />
                </CardContent>
              </Card>
            ))}
          <div className="flex justify-end">
            <Button onClick={saveHeaders} disabled={!headersDirty}>Uložit hlavičky</Button>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
