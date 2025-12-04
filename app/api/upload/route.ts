import { NextRequest, NextResponse } from 'next/server'
import { put } from '@vercel/blob'

// Zvýšit limit pro upload obrázků
export const config = {
  api: {
    bodyParser: {
      sizeLimit: '10mb',
    },
  },
}

export const maxDuration = 60 // 60 seconds timeout

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
      // Vytvoř unikátní jméno souboru s správnou příponou
      const timestamp = Date.now()
      
      // Zjisti příponu podle MIME typu
      let extension = '.jpg' // default
      if (file.type === 'image/webp') extension = '.webp'
      else if (file.type === 'image/png') extension = '.png'
      else if (file.type === 'image/jpeg' || file.type === 'image/jpg') extension = '.jpg'
      else if (file.type === 'image/gif') extension = '.gif'
      
      // Pokud má původní soubor příponu, zachovej ji
      const originalName = file.name.replace(/\s/g, '_')
      const hasExtension = /\.(jpg|jpeg|png|webp|gif)$/i.test(originalName)
      
      const filename = hasExtension 
        ? `products/${timestamp}_${originalName}`
        : `products/${timestamp}_${originalName}${extension}`

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
