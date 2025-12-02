import { NextRequest, NextResponse } from 'next/server'
import { put } from '@vercel/blob'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const files = formData.getAll('files') as File[]
    
    if (!files || files.length === 0) {
      return NextResponse.json(
        { error: 'Žádné soubory nebyly nahrány' },
        { status: 400 }
      )
    }

    const uploadedUrls: string[] = []

    for (const file of files) {
      // Vytvoř unikátní jméno souboru
      const timestamp = Date.now()
      const originalName = file.name.replace(/\s/g, '_')
      const filename = `products/${timestamp}_${originalName}`

      // Upload do Vercel Blob Storage
      const blob = await put(filename, file, {
        access: 'public',
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
