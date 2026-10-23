'use client'

import { ChevronDown, ChevronUp, Plus, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { ImageField } from '@/components/admin/image-field'
import type { Field } from '@/lib/section-fields'

export interface EditorContext {
  categories: { id: string; path: string }[]
  sales: { id: string; name: string }[]
}

const selectClass = 'flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm'

type Data = Record<string, any>

interface FieldsEditorProps {
  fields: Field[]
  value: Data
  onChange: (value: Data) => void
  context: EditorContext
  idPrefix: string
}

/** Vykreslí formulář podle popisu polí (sekce shop builderu) */
export function FieldsEditor({ fields, value, onChange, context, idPrefix }: FieldsEditorProps) {
  return (
    <div className="space-y-4">
      {fields.map((field) => (
        <FieldEditor
          key={field.key}
          field={field}
          value={value[field.key]}
          onChange={(fieldValue) => onChange({ ...value, [field.key]: fieldValue })}
          context={context}
          id={`${idPrefix}-${field.key}`}
        />
      ))}
    </div>
  )
}

function FieldEditor({
  field,
  value,
  onChange,
  context,
  id,
}: {
  field: Field
  value: any
  onChange: (value: any) => void
  context: EditorContext
  id: string
}) {
  switch (field.kind) {
    case 'text':
      return (
        <div className="space-y-1.5">
          <Label htmlFor={id}>{field.label}</Label>
          <Input id={id} value={value ?? ''} placeholder={field.placeholder} onChange={(e) => onChange(e.target.value)} />
        </div>
      )
    case 'textarea':
      return (
        <div className="space-y-1.5">
          <Label htmlFor={id}>{field.label}</Label>
          <Textarea id={id} rows={field.rows ?? 3} value={value ?? ''} onChange={(e) => onChange(e.target.value)} />
        </div>
      )
    case 'number':
      return (
        <div className="w-40 space-y-1.5">
          <Label htmlFor={id}>{field.label}</Label>
          <Input
            id={id}
            type="number"
            min={field.min}
            max={field.max}
            value={value ?? 0}
            onChange={(e) => {
              const n = parseInt(e.target.value, 10) || 0
              onChange(Math.min(Math.max(n, field.min ?? n), field.max ?? n))
            }}
          />
        </div>
      )
    case 'select':
      return (
        <div className="space-y-1.5">
          <Label htmlFor={id}>{field.label}</Label>
          <select id={id} className={selectClass} value={value ?? ''} onChange={(e) => onChange(e.target.value)}>
            {field.options.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </div>
      )
    case 'category':
      return (
        <div className="space-y-1.5">
          <Label htmlFor={id}>{field.label}</Label>
          <select id={id} className={selectClass} value={value ?? ''} onChange={(e) => onChange(e.target.value)}>
            <option value="">— Nevybráno —</option>
            {context.categories.map((c) => (
              <option key={c.id} value={c.id}>{c.path}</option>
            ))}
          </select>
        </div>
      )
    case 'sale':
      return (
        <div className="space-y-1.5">
          <Label htmlFor={id}>{field.label}</Label>
          <select id={id} className={selectClass} value={value ?? ''} onChange={(e) => onChange(e.target.value)}>
            <option value="">Automaticky – první probíhající akce</option>
            {context.sales.map((s) => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </select>
          <p className="text-xs text-gray-500">Když žádná akce neprobíhá, sekce se na webu nezobrazí.</p>
        </div>
      )
    case 'image':
      return <ImageField label={field.label} value={value ?? ''} onChange={onChange} aspect={field.aspect} hint={field.hint} graphic={field.graphic} />
    case 'note':
      return (
        <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
          <p className="font-medium">{field.title}</p>
          <ul className="mt-2 list-disc space-y-1 pl-5">
            {field.lines.map((line) => (
              <li key={line}>{line}</li>
            ))}
          </ul>
        </div>
      )
    case 'button': {
      const button = value ?? { text: '', link: '' }
      return (
        <fieldset className="space-y-1.5">
          <legend className="text-sm font-medium">{field.label}</legend>
          <div className="grid gap-2 sm:grid-cols-2">
            <Input aria-label={`${field.label} – text`} placeholder="Text tlačítka (prázdné = skryté)" value={button.text ?? ''} onChange={(e) => onChange({ ...button, text: e.target.value })} />
            <Input aria-label={`${field.label} – odkaz`} placeholder="/obchod" value={button.link ?? ''} onChange={(e) => onChange({ ...button, link: e.target.value })} />
          </div>
        </fieldset>
      )
    }
    case 'list': {
      const items: Data[] = Array.isArray(value) ? value : []
      const setItem = (index: number, item: Data) => onChange(items.map((it, i) => (i === index ? item : it)))
      const move = (index: number, dir: -1 | 1) => {
        const target = index + dir
        if (target < 0 || target >= items.length) return
        const next = [...items]
        ;[next[index], next[target]] = [next[target], next[index]]
        onChange(next)
      }
      return (
        <div className="space-y-3">
          <span className="text-sm font-medium">{field.label}</span>
          {items.map((item, index) => (
            <div key={index} className="rounded-lg border bg-gray-50/60 p-4">
              <div className="mb-3 flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                  {field.itemLabel} {index + 1}
                </span>
                <div className="flex gap-1">
                  <Button type="button" variant="ghost" size="sm" onClick={() => move(index, -1)} disabled={index === 0} aria-label="Posunout nahoru">
                    <ChevronUp className="h-4 w-4" />
                  </Button>
                  <Button type="button" variant="ghost" size="sm" onClick={() => move(index, 1)} disabled={index === items.length - 1} aria-label="Posunout dolů">
                    <ChevronDown className="h-4 w-4" />
                  </Button>
                  <Button type="button" variant="ghost" size="sm" onClick={() => onChange(items.filter((_, i) => i !== index))} aria-label="Odebrat">
                    <Trash2 className="h-4 w-4 text-red-600" />
                  </Button>
                </div>
              </div>
              <FieldsEditor fields={field.fields} value={item} onChange={(next) => setItem(index, next)} context={context} idPrefix={`${id}-${index}`} />
            </div>
          ))}
          {(!field.max || items.length < field.max) && (
            <Button type="button" variant="outline" size="sm" onClick={() => onChange([...items, { ...field.newItem }])}>
              <Plus className="mr-1 h-4 w-4" /> Přidat: {field.itemLabel.toLowerCase()}
            </Button>
          )}
        </div>
      )
    }
  }
}
