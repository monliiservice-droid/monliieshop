'use client'

import imageCompression from 'browser-image-compression'

const COMPRESSION_OPTIONS = {
  maxSizeMB: 1,
  maxWidthOrHeight: 2000,
  useWebWorker: true,
  fileType: 'image/webp',
}

/** Zmenší obrázek v prohlížeči (WebP, max 2000 px) – nahrávání je rychlejší a web lehčí */
export async function compressImage(file: File): Promise<File> {
  try {
    const blob = await imageCompression(file, COMPRESSION_OPTIONS)
    const name = file.name.replace(/\.[^.]+$/, '') + '.webp'
    return new File([blob], name, { type: 'image/webp' })
  } catch (error) {
    console.error('Image compression failed, uploading original:', error)
    return file
  }
}

/** Nahraje obrázky do úložiště a vrátí jejich URL */
export async function uploadImages(files: File[]): Promise<string[]> {
  if (files.length === 0) return []
  const formData = new FormData()
  for (const file of files) {
    formData.append('files', await compressImage(file))
  }
  const response = await fetch('/api/upload', { method: 'POST', body: formData })
  const result = await response.json().catch(() => ({}))
  if (!response.ok) {
    throw new Error(result.error || 'Nahrání obrázků se nezdařilo')
  }
  return result.urls as string[]
}
