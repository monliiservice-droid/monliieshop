'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { ArrowLeft, Upload, X } from 'lucide-react'
import Link from 'next/link'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { CATEGORY_GROUPS } from '@/lib/product-types'
import imageCompression from 'browser-image-compression'

export default function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter()
  const [productId, setProductId] = useState<string>('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    stock: '',
    category: ''
  })
  const [imageFiles, setImageFiles] = useState<File[]>([])
  const [imagePreviews, setImagePreviews] = useState<string[]>([])
  const [existingImages, setExistingImages] = useState<string[]>([])

  useEffect(() => {
    const loadProduct = async () => {
      const { id } = await params
      setProductId(id)
      
      try {
        const response = await fetch(`/api/admin/products/${id}`)
        if (response.ok) {
          const product = await response.json()
          setFormData({
            name: product.name,
            description: product.description || '',
            price: product.price.toString(),
            stock: product.stock.toString(),
            category: product.category || ''
          })
          const images = JSON.parse(product.images)
          setExistingImages(images)
        } else {
          alert('Produkt nenalezen')
          router.push('/admin/produkty')
        }
      } catch (error) {
        console.error('Error loading product:', error)
        alert('Chyba při načítání produktu')
      } finally {
        setLoading(false)
      }
    }
    
    loadProduct()
  }, [params, router])

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    
    // Komprese obrázků před nahráním
    const compressionOptions = {
      maxSizeMB: 1, // Max 1MB per image
      maxWidthOrHeight: 1920, // Max dimension
      useWebWorker: true,
      fileType: 'image/webp' // Convert to WebP for better compression
    }
    
    const compressedFiles: File[] = []
    
    for (const file of files) {
      try {
        const compressedBlob = await imageCompression(file, compressionOptions)
        
        // Vytvoř nový File objekt se správným názvem a příponou
        const originalName = file.name.replace(/\.(jpg|jpeg|png|gif)$/i, '')
        const newFileName = `${originalName}.webp`
        const compressedFile = new File([compressedBlob], newFileName, { 
          type: 'image/webp' 
        })
        
        compressedFiles.push(compressedFile)
        
        // Vytvoř náhled
        const reader = new FileReader()
        reader.onloadend = () => {
          setImagePreviews(prev => [...prev, reader.result as string])
        }
        reader.readAsDataURL(compressedFile)
      } catch (error) {
        console.error('Error compressing image:', error)
        // Fallback na original pokud komprese selže
        compressedFiles.push(file)
        const reader = new FileReader()
        reader.onloadend = () => {
          setImagePreviews(prev => [...prev, reader.result as string])
        }
        reader.readAsDataURL(file)
      }
    }
    
    setImageFiles(prev => [...prev, ...compressedFiles])
  }

  const removeNewImage = (index: number) => {
    setImageFiles(prev => prev.filter((_, i) => i !== index))
    setImagePreviews(prev => prev.filter((_, i) => i !== index))
  }

  const removeExistingImage = (index: number) => {
    setExistingImages(prev => prev.filter((_, i) => i !== index))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    try {
      let imageUrls = [...existingImages]
      
      // Upload nových obrázků
      if (imageFiles.length > 0) {
        const uploadFormData = new FormData()
        imageFiles.forEach(file => {
          uploadFormData.append('files', file)
        })
        
        const uploadResponse = await fetch('/api/upload', {
          method: 'POST',
          body: uploadFormData,
        })
        
        if (uploadResponse.ok) {
          const { urls } = await uploadResponse.json()
          imageUrls = [...imageUrls, ...urls]
        } else {
          throw new Error('Chyba při nahrávání obrázků')
        }
      }
      
      const response = await fetch(`/api/admin/products/${productId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          price: parseFloat(formData.price),
          stock: parseInt(formData.stock),
          images: JSON.stringify(imageUrls)
        }),
      })

      if (response.ok) {
        router.push('/admin/produkty')
        router.refresh()
      } else {
        alert('Chyba při ukládání produktu')
      }
    } catch (error) {
      console.error('Error saving product:', error)
      alert('Chyba při ukládání produktu')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>Načítání produktu...</p>
      </div>
    )
  }

  return (
    <div>
      <div className="mb-8">
        <Link href="/admin/produkty">
          <Button variant="ghost" size="sm" className="mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Zpět na produkty
          </Button>
        </Link>
        <h1 className="text-3xl font-bold mb-2">Upravit produkt</h1>
        <p className="text-gray-600">Upravte informace o produktu</p>
      </div>

      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle>Informace o produktu</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="name">Název produktu *</Label>
              <Input
                id="name"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="např. Set Velvet Rose"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Popis</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Podrobný popis produktu..."
                rows={4}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="price">Cena (Kč) *</Label>
                <Input
                  id="price"
                  type="number"
                  step="0.01"
                  required
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  placeholder="1180.00"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="stock">Počet kusů na skladě *</Label>
                <Input
                  id="stock"
                  type="number"
                  required
                  value={formData.stock}
                  onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                  placeholder="10"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Kategorie *</Label>
              <select
                id="category"
                required
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <option value="">Vyberte kategorii</option>
                {CATEGORY_GROUPS.map((group) => (
                  <optgroup key={group.label} label={group.label}>
                    {group.categories.map((cat) => (
                      <option key={cat.key} value={cat.value}>
                        {cat.value}
                      </option>
                    ))}
                  </optgroup>
                ))}
              </select>
              <p className="text-xs text-gray-500 mt-1">
                Kategorie určuje, jaké velikosti budou zákazníkům nabídnuty při výběru produktu.
              </p>
            </div>

            <div className="space-y-2">
              <Label>Obrázky produktu</Label>
              
              {/* Existující obrázky */}
              {existingImages.length > 0 && (
                <div className="mb-4">
                  <p className="text-sm text-gray-600 mb-2">Současné obrázky:</p>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {existingImages.map((img, index) => (
                      <div key={index} className="relative group">
                        <Image
                          src={img}
                          alt={`Existing ${index + 1}`}
                          width={200}
                          height={200}
                          className="w-full h-32 object-cover rounded-lg border-2 border-gray-200"
                        />
                        <button
                          type="button"
                          onClick={() => removeExistingImage(index)}
                          className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Upload nových obrázků */}
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
                <input
                  id="images"
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />
                <label htmlFor="images" className="cursor-pointer">
                  <Upload className="h-12 w-12 mx-auto text-gray-400 mb-3" />
                  <p className="text-sm font-medium text-gray-700 mb-1">
                    Klikněte pro přidání dalších obrázků
                  </p>
                  <p className="text-xs text-gray-500">
                    PNG, JPG, WEBP až 10MB
                  </p>
                </label>
              </div>
              
              {imagePreviews.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                  {imagePreviews.map((preview, index) => (
                    <div key={index} className="relative group">
                      <Image
                        src={preview}
                        alt={`New preview ${index + 1}`}
                        width={200}
                        height={200}
                        className="w-full h-32 object-cover rounded-lg border-2 border-green-200"
                      />
                      <button
                        type="button"
                        onClick={() => removeNewImage(index)}
                        className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="h-4 w-4" />
                      </button>
                      <span className="absolute top-2 left-2 bg-green-500 text-white text-xs px-2 py-1 rounded">
                        Nový
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex space-x-4">
              <Button type="submit" disabled={saving}>
                {saving ? 'Ukládání...' : 'Uložit změny'}
              </Button>
              <Link href="/admin/produkty">
                <Button type="button" variant="outline">
                  Zrušit
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  )
}
