import { NextRequest, NextResponse } from 'next/server'
import { writeFile } from 'fs/promises'
import path from 'path'


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
      const bytes = await file.arrayBuffer()
      const buffer = Buffer.from(bytes)

      // Vytvoř unikátní jméno souboru
      const timestamp = Date.now()
      const originalName = file.name.replace(/\s/g, '_')
      const filename = `${timestamp}_${originalName}`
      const filepath = path.join(process.cwd(), 'public/uploads', filename)

      await writeFile(filepath, buffer)
      uploadedUrls.push(`/uploads/${filename}`)
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
