'use client'

import { useRef, useState } from 'react'
import Image from 'next/image'
import { ImagePlus, Loader2, X } from 'lucide-react'
import { toast } from 'sonner'
import { Input } from '@/components/ui/input'
import { uploadImages } from '@/lib/admin-upload'

interface ImageFieldProps {
  label: string
  value: string
  onChange: (url: string) => void
  hint?: string
  aspect?: 'wide' | 'portrait' | 'square'
}

const ASPECT_CLASS = {
  wide: 'aspect-[16/7]',
  portrait: 'aspect-[3/4]',
  square: 'aspect-square',
}

/** Výběr jednoho obrázku: náhled, nahrání z počítače nebo vložení URL */
export function ImageField({ label, value, onChange, hint, aspect = 'wide' }: ImageFieldProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)

  const handleFile = async (file: File | undefined) => {
    if (!file) return
    setUploading(true)
    try {
      const [url] = await uploadImages([file])
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
            <Image src={value} alt="" fill sizes="448px" unoptimized className="object-cover" />
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
      {hint && <p className="text-xs text-gray-500">{hint}</p>}
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => handleFile(e.target.files?.[0])}
      />
    </div>
  )
}
