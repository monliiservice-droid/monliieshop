'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tag, Plus, Trash2, Edit, TrendingUp } from 'lucide-react'

interface DiscountCode {
  id: string
  code: string
  type: string
  value: number
  minAmount: number | null
  maxUses: number | null
  usedCount: number
  totalRevenue: number
  isActive: boolean
  validFrom: string
  validUntil: string | null
  createdAt: string
}

export default function DiscountCodesPage() {
  const [codes, setCodes] = useState<DiscountCode[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [formData, setFormData] = useState({
    code: '',
    type: 'percentage',
    value: '',
    minAmount: '',
    maxUses: '',
    validUntil: ''
  })

  useEffect(() => {
    fetchCodes()
  }, [])

  const fetchCodes = async () => {
    try {
      const response = await fetch('/api/admin/discount-codes')
      if (response.ok) {
        const data = await response.json()
        setCodes(data)
      }
    } catch (error) {
      console.error('Error fetching discount codes:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validace - value musí být vyplněno
    if (!formData.value || formData.value === '') {
      alert('Prosím vyplňte hodnotu slevy')
      return
    }

    const payload = {
      code: formData.code.toUpperCase(),
      type: formData.type,
      value: parseFloat(formData.value),
      minAmount: formData.minAmount && formData.minAmount !== '' ? parseFloat(formData.minAmount) : null,
      maxUses: formData.maxUses && formData.maxUses !== '' ? parseInt(formData.maxUses) : null,
      validUntil: formData.validUntil && formData.validUntil !== '' ? formData.validUntil : null
    }

    try {
      const response = await fetch('/api/admin/discount-codes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })

      if (response.ok) {
        await fetchCodes()
        setShowCreateForm(false)
        setFormData({
          code: '',
          type: 'percentage',
          value: '',
          minAmount: '',
          maxUses: '',
          validUntil: ''
        })
      } else {
        const error = await response.json()
        alert(error.message || 'Chyba při vytváření kódu')
      }
    } catch (error) {
      alert('Chyba při vytváření kódu')
    }
  }

  const toggleActive = async (id: string, isActive: boolean) => {
    try {
      const response = await fetch(`/api/admin/discount-codes/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !isActive })
      })

      if (response.ok) {
        await fetchCodes()
        alert(isActive ? 'Kód byl deaktivován' : 'Kód byl aktivován')
      } else {
        const error = await response.json()
        alert(error.message || 'Chyba při aktualizaci kódu')
      }
    } catch (error) {
      console.error('Error toggling code:', error)
      alert('Chyba při aktualizaci kódu')
    }
  }

  const deleteCode = async (id: string) => {
    if (!confirm('Opravdu chcete smazat tento slevový kód?')) return

    try {
      const response = await fetch(`/api/admin/discount-codes/${id}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        await fetchCodes()
        alert('Slevový kód byl úspěšně smazán')
      } else {
        const error = await response.json()
        alert(error.message || 'Chyba při mazání kódu')
      }
    } catch (error) {
      console.error('Error deleting code:', error)
      alert('Chyba při mazání kódu')
    }
  }

  if (isLoading) {
    return (
      <div className="p-8">
        <p>Načítání...</p>
      </div>
    )
  }

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-4xl font-bold mb-2">Slevové kódy</h1>
          <p className="text-gray-600">Správa slevových kódů a sledování použití</p>
        </div>
        <Button
          onClick={() => setShowCreateForm(!showCreateForm)}
          className="bg-gradient-to-r from-[#931e31] to-[#b8263d] hover:from-[#6b1623] hover:to-[#931e31] text-white"
        >
          <Plus className="mr-2 h-4 w-4" />
          Nový slevový kód
        </Button>
      </div>

      {/* Create Form */}
      {showCreateForm && (
        <Card className="mb-8 border-2 border-[#931e31]">
          <CardHeader>
            <CardTitle>Vytvořit nový slevový kód</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="code">Kód *</Label>
                  <Input
                    id="code"
                    required
                    value={formData.code}
                    onChange={(e) => setFormData({...formData, code: e.target.value.toUpperCase()})}
                    placeholder="LETO2024"
                    className="mt-2"
                  />
                </div>

                <div>
                  <Label htmlFor="type">Typ slevy *</Label>
                  <select
                    id="type"
                    required
                    value={formData.type}
                    onChange={(e) => setFormData({...formData, type: e.target.value})}
                    className="w-full mt-2 p-2 border rounded-md"
                  >
                    <option value="percentage">Procentuální</option>
                    <option value="fixed">Pevná částka (Kč)</option>
                  </select>
                </div>

                <div>
                  <Label htmlFor="value">Hodnota slevy *</Label>
                  <Input
                    id="value"
                    type="number"
                    required
                    min="0"
                    step="0.01"
                    value={formData.value || ''}
                    onChange={(e) => setFormData({...formData, value: e.target.value})}
                    placeholder={formData.type === 'percentage' ? '10' : '100'}
                    className="mt-2"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    {formData.type === 'percentage' ? 'Procenta (např. 10 = 10%)' : 'Částka v Kč'}
                  </p>
                </div>

                <div>
                  <Label htmlFor="minAmount">Minimální částka objednávky</Label>
                  <Input
                    id="minAmount"
                    type="number"
                    min="0"
                    value={formData.minAmount || ''}
                    onChange={(e) => setFormData({...formData, minAmount: e.target.value})}
                    placeholder="500"
                    className="mt-2"
                  />
                </div>

                <div>
                  <Label htmlFor="maxUses">Max. počet použití</Label>
                  <Input
                    id="maxUses"
                    type="number"
                    min="1"
                    value={formData.maxUses || ''}
                    onChange={(e) => setFormData({...formData, maxUses: e.target.value})}
                    placeholder="100"
                    className="mt-2"
                  />
                  <p className="text-xs text-gray-500 mt-1">Prázdné = neomezené použití</p>
                </div>

                <div>
                  <Label htmlFor="validUntil">Platnost do</Label>
                  <Input
                    id="validUntil"
                    type="datetime-local"
                    value={formData.validUntil || ''}
                    onChange={(e) => setFormData({...formData, validUntil: e.target.value})}
                    className="mt-2"
                  />
                </div>
              </div>

              <div className="flex gap-2">
                <Button type="submit" className="bg-green-600 hover:bg-green-700">
                  Vytvořit kód
                </Button>
                <Button type="button" variant="outline" onClick={() => setShowCreateForm(false)}>
                  Zrušit
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Celkem kódů</p>
                <p className="text-3xl font-bold text-[#931e31]">{codes.length}</p>
              </div>
              <Tag className="h-8 w-8 text-[#931e31]" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Aktivní kódy</p>
                <p className="text-3xl font-bold text-green-600">
                  {codes.filter(c => c.isActive).length}
                </p>
              </div>
              <div className="h-8 w-8 bg-green-100 rounded-full flex items-center justify-center">
                <span className="text-green-600 font-bold">✓</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Celková tržba se slevami</p>
                <p className="text-3xl font-bold text-blue-600">
                  {codes.reduce((sum, c) => sum + (c.totalRevenue || 0), 0).toFixed(0)} Kč
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Codes List */}
      <Card>
        <CardHeader>
          <CardTitle>Všechny slevové kódy</CardTitle>
        </CardHeader>
        <CardContent>
          {codes.length === 0 ? (
            <p className="text-center text-gray-500 py-8">Zatím nebyly vytvořeny žádné slevové kódy</p>
          ) : (
            <div className="space-y-4">
              {codes.map((code) => (
                <div
                  key={code.id}
                  className={`p-4 border-2 rounded-xl ${
                    code.isActive ? 'border-green-200 bg-green-50/50' : 'border-gray-200 bg-gray-50'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-2xl font-bold text-[#931e31]">{code.code}</h3>
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          code.isActive 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {code.isActive ? 'Aktivní' : 'Neaktivní'}
                        </span>
                        <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-semibold">
                          {code.type === 'percentage' ? `${code.value || 0}%` : `${code.value || 0} Kč`}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <p className="text-gray-600">Použito</p>
                          <p className="font-bold">{code.usedCount || 0}{code.maxUses ? ` / ${code.maxUses}` : ''}</p>
                        </div>
                        <div>
                          <p className="text-gray-600">Tržba s kódem</p>
                          <p className="font-bold">{(code.totalRevenue || 0).toFixed(0)} Kč</p>
                        </div>
                        {code.minAmount && (
                          <div>
                            <p className="text-gray-600">Min. částka</p>
                            <p className="font-bold">{code.minAmount || 0} Kč</p>
                          </div>
                        )}
                        {code.validUntil && (
                          <div>
                            <p className="text-gray-600">Platnost do</p>
                            <p className="font-bold">
                              {new Date(code.validUntil).toLocaleDateString('cs-CZ')}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex gap-2 ml-4">
                      <Button
                        onClick={() => toggleActive(code.id, code.isActive)}
                        variant="outline"
                        size="sm"
                        className={code.isActive ? 'border-orange-500 text-orange-500' : 'border-green-500 text-green-500'}
                      >
                        {code.isActive ? 'Deaktivovat' : 'Aktivovat'}
                      </Button>
                      <Button
                        onClick={() => deleteCode(code.id)}
                        variant="outline"
                        size="sm"
                        className="border-red-500 text-red-500 hover:bg-red-500 hover:text-white"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
