'use client'

import imageCompression from 'browser-image-compression'

// Safari (iPhone, Mac) neumí obrázek uložit jako WebP – prohlížeč pak vrátí PNG, které se kvůli limitu
// velikosti muselo zmenšit na zlomek rozlišení. Kde WebP nejde, ukládáme proto JPEG.
let webpSupport: boolean | null = null
function canEncodeWebp(): boolean {
  if (webpSupport === null) {
    try {
      const canvas = document.createElement('canvas')
      canvas.width = canvas.height = 1
      webpSupport = canvas.toDataURL('image/webp').startsWith('data:image/webp')
    } catch {
      webpSupport = false
    }
  }
  return webpSupport
}

const EXTENSIONS: Record<string, string> = { 'image/webp': '.webp', 'image/jpeg': '.jpg', 'image/png': '.png' }

/** Zmenší fotku v prohlížeči (max 2400 px, WebP nebo JPEG v dobré kvalitě) – nahrávání je rychlejší a web lehčí */
export async function compressImage(file: File): Promise<File> {
  try {
    const blob = await imageCompression(file, {
      maxSizeMB: 2.5,
      maxWidthOrHeight: 2400,
      initialQuality: 0.85,
      useWebWorker: true,
      fileType: canEncodeWebp() ? 'image/webp' : 'image/jpeg',
    })
    // Typ a příponu bereme z toho, co prohlížeč opravdu vytvořil
    const type = EXTENSIONS[blob.type] ? blob.type : 'image/jpeg'
    const name = file.name.replace(/\.[^.]+$/, '') + EXTENSIONS[type]
    return new File([blob], name, { type })
  } catch (error) {
    console.error('Image compression failed, uploading original:', error)
    return file
  }
}

const GRAPHIC_ORIGINAL_MAX_BYTES = 2 * 1024 * 1024

/**
 * Připraví soubor k nahrání. SVG se nikdy nepřevádí (zůstane ostré a malé).
 * Vlastní grafika (text, loga z Canvy) se nahraje v originále, pokud není příliš velká –
 * převod do WebP by rozmazal drobné písmo.
 */
async function prepareFile(file: File, graphic: boolean): Promise<File> {
  if (file.type === 'image/svg+xml') return file
  if (graphic && file.size <= GRAPHIC_ORIGINAL_MAX_BYTES) return file
  return compressImage(file)
}

/** Nahraje obrázky do úložiště a vrátí jejich URL. Po jednom – Vercel přijme v jednom požadavku nejvýš 4,5 MB. */
export async function uploadImages(files: File[], options: { graphic?: boolean } = {}): Promise<string[]> {
  const urls: string[] = []
  for (const file of files) {
    const formData = new FormData()
    formData.append('files', await prepareFile(file, options.graphic === true))
    const response = await fetch('/api/upload', { method: 'POST', body: formData })
    const result = await response.json().catch(() => ({}))
    if (!response.ok) {
      throw new Error(result.error || (response.status === 413 ? `Fotka ${file.name} je příliš velká` : 'Nahrání obrázků se nezdařilo'))
    }
    urls.push(...(result.urls as string[]))
  }
  return urls
}
