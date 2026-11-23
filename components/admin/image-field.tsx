'use client'

import { useRef, useState } from 'react'
import Image from 'next/image'
import { Crosshair, ImagePlus, Loader2, X } from 'lucide-react'
import { toast } from 'sonner'
import { Input } from '@/components/ui/input'
import { uploadImages } from '@/lib/admin-upload'
import { splitImage } from '@/lib/image-focus'
import { FocusPicker } from '@/components/admin/focus-picker'

interface ImageFieldProps {
  label: string
  value: string
  onChange: (url: string) => void
  hint?: string
  aspect?: 'wide' | 'portrait' | 'square'
  /** Vlastní grafika: přijímá i SVG, nezmenšuje se tolik a náhled ukazuje celý obrázek */
  graphic?: boolean
}

const ASPECT_CLASS = {
  wide: 'aspect-[16/7]',
  portrait: 'aspect-[3/4]',
  square: 'aspect-square',
}

/** Výběr jednoho obrázku: náhled, nahrání z počítače nebo vložení URL */
export function ImageField({ label, value, onChange, hint, aspect = 'wide', graphic = false }: ImageFieldProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)
  const [picking, setPicking] = useState(false)
  const preview = splitImage(value)

  const handleFile = async (file: File | undefined) => {
    if (!file) return
    setUploading(true)
    try {
      const [url] = await uploadImages([file], { graphic })
      onChange(url)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Nahrání se nezdařilo')
    } finally {
      setUploading(false)
      if (inputRef.current) inputRef.current.value = ''
    }
  }

  return (
    <div className="space-y-2">
      <span className="text-sm font-medium">{label}</span>
      <div className={`relative w-full max-w-md overflow-hidden rounded-lg border border-dashed bg-gray-50 ${ASPECT_CLASS[aspect]}`}>
        {value ? (
          <>
            <Image src={preview.src} alt="" fill sizes="448px" unoptimized className={graphic ? 'object-contain' : 'object-cover'} style={graphic ? undefined : { objectPosition: `${preview.x}% ${preview.y}%` }} />
            <button
              type="button"
              onClick={() => onChange('')}
              className="absolute right-2 top-2 rounded-full bg-black/60 p-1 text-white hover:bg-black/80"
              aria-label="Odebrat obrázek"
            >
              <X className="h-4 w-4" />
            </button>
          </>
        ) : (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="flex h-full w-full flex-col items-center justify-center gap-2 text-sm text-gray-500 hover:text-gray-800"
          >
            {uploading ? <Loader2 className="h-6 w-6 animate-spin" /> : <ImagePlus className="h-6 w-6" />}
            {uploading ? 'Nahrávám…' : 'Nahrát obrázek'}
          </button>
        )}
      </div>
      <div className="flex max-w-md gap-2">
        <Input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="nebo vložte URL / cestu, např. /story_1.jpg"
          className="text-xs"
        />
        {value && (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="shrink-0 rounded-md border px-3 text-xs hover:bg-gray-50"
            disabled={uploading}
          >
            {uploading ? '…' : 'Změnit'}
          </button>
        )}
      </div>
      {value && !graphic && (
        <button type="button" onClick={() => setPicking(!picking)} className="flex items-center gap-1.5 text-xs font-medium text-gray-700 hover:text-gray-900">
          <Crosshair className="h-3.5 w-3.5" />
          {picking ? 'Hotovo' : preview.x !== 50 || preview.y !== 50 ? 'Upravit výřez' : 'Vybrat výřez (co má zůstat vidět)'}
        </button>
      )}
      {picking && value && <FocusPicker value={value} onChange={onChange} />}
      {hint && <p className="text-xs text-gray-500">{hint}</p>}
      <input
        ref={inputRef}
        type="file"
        accept={graphic ? 'image/svg+xml,image/png,image/jpeg,image/webp' : 'image/*,.heic,.heif'}
        className="hidden"
        onChange={(e) => handleFile(e.target.files?.[0])}
      />
    </div>
  )
}
