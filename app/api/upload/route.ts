import { NextRequest, NextResponse } from 'next/server'
import { put } from '@vercel/blob'
import { requireAdminAuth } from '@/lib/auth'

// App Router route segment config
export const maxDuration = 60 // 60 seconds timeout
export const dynamic = 'force-dynamic'

const ALLOWED_TYPES: Record<string, string> = {
  'image/jpeg': '.jpg',
  'image/jpg': '.jpg',
  'image/png': '.png',
  'image/webp': '.webp',
  'image/gif': '.gif',
  'image/svg+xml': '.svg',
}

// SVG je text a mohl by obsahovat skripty – takové soubory odmítneme. Na webu se SVG vkládá přes <img>,
// kde se skripty stejně nespouštějí, a soubor leží na jiné doméně (Vercel Blob).
async function isUnsafeSvg(file: File): Promise<boolean> {
  const text = (await file.text()).toLowerCase()
  return /<script|<foreignobject|\son[a-z]+\s*=|javascript:|<iframe|<embed|<object/.test(text)
}
const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10 MB
const MAX_FILES = 20

export async function POST(request: NextRequest) {
  const isAuthed = await requireAdminAuth()
  if (!isAuthed) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const formData = await request.formData()
    const files = formData.getAll('files') as File[]
    
    if (!files || files.length === 0) {
      return NextResponse.json(
        { error: 'Žádné soubory nebyly nahrány' },
        { status: 400 }
      )
    }

    if (files.length > MAX_FILES) {
      return NextResponse.json(
        { error: `Najednou lze nahrát maximálně ${MAX_FILES} souborů` },
        { status: 400 }
      )
    }

    for (const file of files) {
      if (!(file instanceof File) || !ALLOWED_TYPES[file.type]) {
        return NextResponse.json(
          { error: 'Povolené jsou pouze obrázky JPG, PNG, WEBP, GIF a SVG' },
          { status: 400 }
        )
      }
      if (file.size > MAX_FILE_SIZE) {
        return NextResponse.json(
          { error: `Soubor ${file.name} je větší než 10 MB` },
          { status: 400 }
        )
      }
      if (file.type === 'image/svg+xml' && await isUnsafeSvg(file)) {
        return NextResponse.json(
          { error: `SVG ${file.name} obsahuje skripty nebo vložený obsah. Vyexportujte ho prosím znovu (např. z Canvy) jako čisté SVG.` },
          { status: 400 }
        )
      }
    }

    const uploadedUrls: string[] = []

    for (const file of files) {
      // Vytvoř unikátní a bezpečné jméno souboru; přípona vždy podle MIME typu
      const timestamp = Date.now()
      const extension = ALLOWED_TYPES[file.type]
      const baseName = file.name
        .replace(/\.[^.]*$/, '')
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-zA-Z0-9_-]/g, '_')
        .slice(0, 80) || 'image'

      const filename = `products/${timestamp}_${baseName}${extension}`

      // Upload do Vercel Blob Storage
      const blob = await put(filename, file, {
        access: 'public',
        contentType: file.type,
      })

      uploadedUrls.push(blob.url)
    }

    return NextResponse.json({ urls: uploadedUrls })
  } catch (error) {
    console.error('Error uploading files:', error)
    return NextResponse.json(
      { error: 'Chyba při nahrávání souborů' },
      { status: 500 }
    )
  }
}
