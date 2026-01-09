'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { ArrowLeft, Upload, X } from 'lucide-react'
import Link from 'next/link'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { CATEGORY_GROUPS } from '@/lib/product-types'
import imageCompression from 'browser-image-compression'
import { DEFAULT_SET_CONFIG, SetConfiguration } from '@/lib/set-config-types'

export default function NewProductPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    stock: '',
    category: ''
  })
  const [imageFiles, setImageFiles] = useState<File[]>([])
  const [imagePreviews, setImagePreviews] = useState<string[]>([])
  const [uploadedImageUrls, setUploadedImageUrls] = useState<string[]>([])
  const [setConfig, setSetConfig] = useState<SetConfiguration>(DEFAULT_SET_CONFIG)
  const [colors, setColors] = useState<Array<{name: string, hex: string}>>([])
  const [newColorName, setNewColorName] = useState('')
  const [newColorHex, setNewColorHex] = useState('#000000')

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

  const removeImage = (index: number) => {
    setImageFiles(prev => prev.filter((_, i) => i !== index))
    setImagePreviews(prev => prev.filter((_, i) => i !== index))
    if (uploadedImageUrls[index]) {
      setUploadedImageUrls(prev => prev.filter((_, i) => i !== index))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      let imageUrls = [...uploadedImageUrls]
      
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
      
      // Pro sety ignorovat základní cenu a použít pouze cenu z variant
      let finalPrice = 0
      if (formData.category === 'Set') {
        // Debug: Vypsat všechny ceny
        console.log('🔍 SetConfig před uložením:', JSON.stringify(setConfig, null, 2))
        
        // U setů se bere pouze cena z konfigurace variant
        // Filtrovat pouze nenulové ceny
        const validPrices = [
          setConfig.prices.braletteWithGarters,
          setConfig.prices.braletteWithoutGarters,
          setConfig.prices.wiredWithGarters,
          setConfig.prices.wiredWithoutGarters
        ].filter(price => price && price > 0)
        
        console.log('✅ Validní ceny:', validPrices)
        
        if (validPrices.length > 0) {
          finalPrice = Math.min(...validPrices)
          console.log('💰 Vypočítaná finalPrice:', finalPrice)
        } else {
          alert('Musíte nastavit alespoň jednu cenu pro varianty setu!')
          throw new Error('Žádné ceny nastavené pro set')
        }
      } else {
        // U běžných produktů se bere cena z formuláře
        finalPrice = parseFloat(formData.price) || 0
      }
      
      const response = await fetch('/api/admin/products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          price: finalPrice,
          stock: parseInt(formData.stock),
          images: JSON.stringify(imageUrls),
          isSet: formData.category === 'Set',
          setOptions: formData.category === 'Set' ? JSON.stringify(setConfig) : '{}',
          colors: JSON.stringify(colors)
        }),
      })

      if (response.ok) {
        router.push('/admin/produkty')
        router.refresh()
      } else {
        alert('Chyba při vytváření produktu')
      }
    } catch (error) {
      console.error('Error creating product:', error)
      alert('Chyba při vytváření produktu')
    } finally {
      setLoading(false)
    }
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
        <h1 className="text-3xl font-bold mb-2">Nový produkt</h1>
        <p className="text-gray-600">Vytvořte nový produkt pro váš obchod</p>
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
              {/* Pole cena se skryje pro sety - bude automaticky vypočítána */}
              {formData.category !== 'Set' && (
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
              )}

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

            {/* Konfigurace setu - zobrazí se pouze pro kategorii Set */}
            {formData.category === 'Set' && (
              <Card className="border-2 border-blue-200 bg-blue-50">
                <CardHeader>
                  <CardTitle className="text-lg">Konfigurace setu</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Možnost výběru podvazků */}
                  <div className="flex items-start space-x-3">
                    <input
                      type="checkbox"
                      id="hasGartersOption"
                      checked={setConfig.hasGartersOption}
                      onChange={(e) => setSetConfig({...setConfig, hasGartersOption: e.target.checked})}
                      className="mt-1 h-4 w-4 rounded border-gray-300"
                    />
                    <div>
                      <Label htmlFor="hasGartersOption" className="font-medium cursor-pointer">
                        Zákazník si může vybrat, zda chce podvazky
                      </Label>
                      <p className="text-xs text-gray-600 mt-1">
                        Pokud je zaškrtnuto, zákazník si bude moci vybrat mezi variantou s podvazky a bez podvazků.
                      </p>
                    </div>
                  </div>

                  {/* Výběr typu podprsenky */}
                  <div className="space-y-2">
                    <Label htmlFor="braType" className="font-medium">Typ podprsenky v setu</Label>
                    <select
                      id="braType"
                      value={setConfig.braType}
                      onChange={(e) => setSetConfig({...setConfig, braType: e.target.value as 'bralette' | 'wired' | 'both'})}
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    >
                      <option value="bralette">Pouze braletka</option>
                      <option value="wired">Pouze s kosticí</option>
                      <option value="both">Obojí - zákazník si vybere</option>
                    </select>
                    <p className="text-xs text-gray-600">
                      Pokud vyberete "Obojí", zákazník si bude moci vybrat mezi braletkou a podprsenkou s kosticí.
                    </p>
                  </div>

                  {/* Cenová matice */}
                  <div className="space-y-4">
                    <Label className="text-base font-semibold">Ceny jednotlivých variant (Kč) *</Label>
                    
                    {setConfig.braType === 'both' ? (
                      // Pokud může zákazník vybrat typ podprsenky
                      <div className="space-y-6">
                        <div>
                          <div className="font-medium mb-3 text-sm">🌸 Braletka:</div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 ml-4">
                            {setConfig.hasGartersOption ? (
                              <>
                                <div className="space-y-2">
                                  <Label htmlFor="braletteWithGarters">S podvazky</Label>
                                  <Input
                                    id="braletteWithGarters"
                                    type="number"
                                    step="0.01"
                                    required
                                    value={setConfig.prices.braletteWithGarters || ''}
                                    onChange={(e) => setSetConfig({...setConfig, prices: {...setConfig.prices, braletteWithGarters: parseFloat(e.target.value) || 0}})}
                                    placeholder="1890"
                                  />
                                </div>
                                <div className="space-y-2">
                                  <Label htmlFor="braletteWithoutGarters">Bez podvazků</Label>
                                  <Input
                                    id="braletteWithoutGarters"
                                    type="number"
                                    step="0.01"
                                    required
                                    value={setConfig.prices.braletteWithoutGarters || ''}
                                    onChange={(e) => setSetConfig({...setConfig, prices: {...setConfig.prices, braletteWithoutGarters: parseFloat(e.target.value) || 0}})}
                                    placeholder="1590"
                                  />
                                </div>
                              </>
                            ) : (
                              <div className="space-y-2">
                                <Label htmlFor="braletteSingle">Cena</Label>
                                <Input
                                  id="braletteSingle"
                                  type="number"
                                  step="0.01"
                                  required
                                  value={setConfig.prices.braletteWithGarters || ''}
                                  onChange={(e) => setSetConfig({...setConfig, prices: {...setConfig.prices, braletteWithGarters: parseFloat(e.target.value) || 0}})}
                                  placeholder="1790"
                                />
                              </div>
                            )}
                          </div>
                        </div>
                        
                        <div>
                          <div className="font-medium mb-3 text-sm">💎 S kosticí:</div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 ml-4">
                            {setConfig.hasGartersOption ? (
                              <>
                                <div className="space-y-2">
                                  <Label htmlFor="wiredWithGarters">S podvazky</Label>
                                  <Input
                                    id="wiredWithGarters"
                                    type="number"
                                    step="0.01"
                                    required
                                    value={setConfig.prices.wiredWithGarters || ''}
                                    onChange={(e) => setSetConfig({...setConfig, prices: {...setConfig.prices, wiredWithGarters: parseFloat(e.target.value) || 0}})}
                                    placeholder="1990"
                                  />
                                </div>
                                <div className="space-y-2">
                                  <Label htmlFor="wiredWithoutGarters">Bez podvazků</Label>
                                  <Input
                                    id="wiredWithoutGarters"
                                    type="number"
                                    step="0.01"
                                    required
                                    value={setConfig.prices.wiredWithoutGarters || ''}
                                    onChange={(e) => setSetConfig({...setConfig, prices: {...setConfig.prices, wiredWithoutGarters: parseFloat(e.target.value) || 0}})}
                                    placeholder="1690"
                                  />
                                </div>
                              </>
                            ) : (
                              <div className="space-y-2">
                                <Label htmlFor="wiredSingle">Cena</Label>
                                <Input
                                  id="wiredSingle"
                                  type="number"
                                  step="0.01"
                                  required
                                  value={setConfig.prices.wiredWithGarters || ''}
                                  onChange={(e) => setSetConfig({...setConfig, prices: {...setConfig.prices, wiredWithGarters: parseFloat(e.target.value) || 0}})}
                                  placeholder="1890"
                                />
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ) : (
                      // Pokud je pouze jeden typ podprsenky
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {setConfig.hasGartersOption ? (
                          <>
                            <div className="space-y-2">
                              <Label htmlFor="singleWithGarters">S podvazky</Label>
                              <Input
                                id="singleWithGarters"
                                type="number"
                                step="0.01"
                                required
                                value={setConfig.prices[`${setConfig.braType}WithGarters` as keyof typeof setConfig.prices] || ''}
                                onChange={(e) => setSetConfig({...setConfig, prices: {...setConfig.prices, [`${setConfig.braType}WithGarters`]: parseFloat(e.target.value) || 0}})}
                                placeholder="1890"
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="singleWithoutGarters">Bez podvazků</Label>
                              <Input
                                id="singleWithoutGarters"
                                type="number"
                                step="0.01"
                                required
                                value={setConfig.prices[`${setConfig.braType}WithoutGarters` as keyof typeof setConfig.prices] || ''}
                                onChange={(e) => setSetConfig({...setConfig, prices: {...setConfig.prices, [`${setConfig.braType}WithoutGarters`]: parseFloat(e.target.value) || 0}})}
                                placeholder="1590"
                              />
                            </div>
                          </>
                        ) : (
                          <div className="space-y-2">
                            <Label htmlFor="singlePrice">Cena</Label>
                            <Input
                              id="singlePrice"
                              type="number"
                              step="0.01"
                              required
                              value={setConfig.prices[`${setConfig.braType}WithGarters` as keyof typeof setConfig.prices] || ''}
                              onChange={(e) => setSetConfig({...setConfig, prices: {...setConfig.prices, [`${setConfig.braType}WithGarters`]: parseFloat(e.target.value) || 0}})}
                              placeholder="1790"
                            />
                          </div>
                        )}
                      </div>
                    )}
                    <p className="text-xs text-gray-600 mt-2">
                      Nastavte ceny pro všechny dostupné kombinace. Tyto ceny se zobrazí zákazníkům při výběru.
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Barvy produktu */}
            <Card className="border-2 border-purple-200 bg-purple-50">
              <CardHeader>
                <CardTitle className="text-lg">Barvy produktu</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="colorName">Název barvy</Label>
                    <Input
                      id="colorName"
                      value={newColorName}
                      onChange={(e) => setNewColorName(e.target.value)}
                      placeholder="Černá"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="colorHex">Barva (hex)</Label>
                    <div className="flex gap-2">
                      <Input
                        id="colorHex"
                        type="color"
                        value={newColorHex}
                        onChange={(e) => setNewColorHex(e.target.value)}
                        className="w-20 h-10"
                      />
                      <Input
                        value={newColorHex}
                        onChange={(e) => setNewColorHex(e.target.value)}
                        placeholder="#000000"
                        className="flex-1"
                      />
                    </div>
                  </div>
                  <div className="flex items-end">
                    <Button
                      type="button"
                      onClick={() => {
                        if (newColorName.trim()) {
                          setColors([...colors, { name: newColorName, hex: newColorHex }])
                          setNewColorName('')
                          setNewColorHex('#000000')
                        }
                      }}
                      className="w-full"
                    >
                      Přidat barvu
                    </Button>
                  </div>
                </div>

                {colors.length > 0 && (
                  <div className="space-y-2">
                    <Label>Přidané barvy</Label>
                    <div className="flex flex-wrap gap-2">
                      {colors.map((color, index) => (
                        <div
                          key={index}
                          className="flex items-center gap-2 bg-white px-3 py-2 rounded-lg border"
                        >
                          <div
                            className="w-6 h-6 rounded border border-gray-300"
                            style={{ backgroundColor: color.hex }}
                          />
                          <span className="text-sm">{color.name}</span>
                          <button
                            type="button"
                            onClick={() => setColors(colors.filter((_, i) => i !== index))}
                            className="text-red-500 hover:text-red-700"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                <p className="text-xs text-gray-600">
                  Pokud produkt nemá více barev, nechte tuto sekci prázdnou. Pokud má více barev, přidejte je zde.
                </p>
              </CardContent>
            </Card>

            <div className="space-y-2">
              <Label htmlFor="images">Obrázky produktu</Label>
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
                    Klikněte pro nahrání obrázků
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
                        alt={`Preview ${index + 1}`}
                        width={200}
                        height={200}
                        className="w-full h-32 object-cover rounded-lg border-2 border-gray-200"
                      />
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex space-x-4">
              <Button type="submit" disabled={loading}>
                {loading ? 'Vytváření...' : 'Vytvořit produkt'}
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
