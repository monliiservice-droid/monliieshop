'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Separator } from '@/components/ui/separator'
import { CreditCard, Store, FileText } from 'lucide-react'
import { useState, useEffect } from 'react'

export default function SettingsPage() {
  const [stripeKey, setStripeKey] = useState('')
  const [saving, setSaving] = useState(false)
  const [companySettings, setCompanySettings] = useState({
    companyName: '',
    ico: '',
    dic: '',
    street: '',
    city: '',
    zip: '',
    country: 'Česká republika',
    email: '',
    phone: '',
    bankAccount: '',
    iban: '',
    swift: '',
    invoicePrefix: '',
    defaultVatRate: 21,
    invoiceDueDays: 14,
    vatPayer: true
  })

  useEffect(() => {
    fetchCompanySettings()
  }, [])

  const fetchCompanySettings = async () => {
    try {
      const res = await fetch('/api/admin/company-settings')
      if (res.ok) {
        const data = await res.json()
        if (data) {
          setCompanySettings(data)
        }
      }
    } catch (error) {
      console.error('Error fetching company settings:', error)
    }
  }

  const saveCompanySettings = async () => {
    try {
      setSaving(true)
      const res = await fetch('/api/admin/company-settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(companySettings)
      })
      
      if (res.ok) {
        alert('Fakturační údaje uloženy')
        await fetchCompanySettings()
      } else {
        alert('Chyba při ukládání')
      }
    } catch (error) {
      console.error('Error saving company settings:', error)
      alert('Chyba při ukládání')
    } finally {
      setSaving(false)
    }
  }

  const handleSave = async () => {
    setSaving(true)
    // TODO: Implement save functionality
    setTimeout(() => {
      setSaving(false)
      alert('Nastavení uloženo')
    }, 1000)
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Nastavení</h1>
        <p className="text-gray-600">Spravujte nastavení vašeho e-shopu</p>
      </div>

      <Tabs defaultValue="payment" className="space-y-6">
        <TabsList>
          <TabsTrigger value="payment">
            <CreditCard className="h-4 w-4 mr-2" />
            Platby
          </TabsTrigger>
          <TabsTrigger value="store">
            <Store className="h-4 w-4 mr-2" />
            Obchod
          </TabsTrigger>
          <TabsTrigger value="invoicing">
            <FileText className="h-4 w-4 mr-2" />
            Fakturace
          </TabsTrigger>
        </TabsList>

        <TabsContent value="payment" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Stripe platby</CardTitle>
              <CardDescription>
                Nastavte Stripe pro příjem plateb kartou
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="stripe-public">Stripe Public Key</Label>
                <Input
                  id="stripe-public"
                  placeholder="pk_live_..."
                  value={stripeKey}
                  onChange={(e) => setStripeKey(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="stripe-secret">Stripe Secret Key</Label>
                <Input
                  id="stripe-secret"
                  type="password"
                  placeholder="sk_live_..."
                />
                <p className="text-sm text-gray-500">
                  Tento klíč bude uložen bezpečně na serveru
                </p>
              </div>
              <Separator />
              <div className="space-y-2">
                <h4 className="font-medium">Dostupné platební metody</h4>
                <div className="space-y-2">
                  <label className="flex items-center space-x-2">
                    <input type="checkbox" defaultChecked />
                    <span>Platba kartou (Stripe)</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <input type="checkbox" defaultChecked />
                    <span>Platba na dobírku</span>
                  </label>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="store" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Základní informace</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Název obchodu</Label>
                <Input defaultValue="Monlii" />
              </div>
              <div className="space-y-2">
                <Label>E-mail</Label>
                <Input type="email" placeholder="kontakt@monlii.cz" />
              </div>
              <div className="space-y-2">
                <Label>Telefon</Label>
                <Input type="tel" placeholder="+420 XXX XXX XXX" />
              </div>
              <div className="space-y-2">
                <Label>Adresa</Label>
                <Input placeholder="Ulice 123, 100 00 Praha" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Sociální sítě</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Facebook URL</Label>
                <Input defaultValue="https://www.facebook.com/monlii.cz" />
              </div>
              <div className="space-y-2">
                <Label>Instagram URL</Label>
                <Input defaultValue="https://www.instagram.com/monlii_i/" />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="invoicing" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Fakturační údaje</CardTitle>
              <CardDescription>
                Údaje vaší firmy pro generování faktur
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Název firmy *</Label>
                  <Input 
                    value={companySettings.companyName}
                    onChange={(e) => setCompanySettings({...companySettings, companyName: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label>IČO *</Label>
                  <Input 
                    value={companySettings.ico}
                    onChange={(e) => setCompanySettings({...companySettings, ico: e.target.value})}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>DIČ</Label>
                  <Input 
                    value={companySettings.dic || ''}
                    onChange={(e) => setCompanySettings({...companySettings, dic: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <input 
                      type="checkbox"
                      checked={companySettings.vatPayer}
                      onChange={(e) => setCompanySettings({...companySettings, vatPayer: e.target.checked})}
                    />
                    Plátce DPH
                  </Label>
                </div>
              </div>

              <Separator />

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Ulice a číslo *</Label>
                  <Input 
                    value={companySettings.street}
                    onChange={(e) => setCompanySettings({...companySettings, street: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Město *</Label>
                  <Input 
                    value={companySettings.city}
                    onChange={(e) => setCompanySettings({...companySettings, city: e.target.value})}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>PSČ *</Label>
                  <Input 
                    value={companySettings.zip}
                    onChange={(e) => setCompanySettings({...companySettings, zip: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Země</Label>
                  <Input 
                    value={companySettings.country}
                    onChange={(e) => setCompanySettings({...companySettings, country: e.target.value})}
                  />
                </div>
              </div>

              <Separator />

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Email *</Label>
                  <Input 
                    type="email"
                    value={companySettings.email}
                    onChange={(e) => setCompanySettings({...companySettings, email: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Telefon *</Label>
                  <Input 
                    type="tel"
                    value={companySettings.phone}
                    onChange={(e) => setCompanySettings({...companySettings, phone: e.target.value})}
                  />
                </div>
              </div>

              <Separator />

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Číslo účtu</Label>
                  <Input 
                    value={companySettings.bankAccount || ''}
                    onChange={(e) => setCompanySettings({...companySettings, bankAccount: e.target.value})}
                    placeholder="123456789/0100"
                  />
                </div>
                <div className="space-y-2">
                  <Label>IBAN</Label>
                  <Input 
                    value={companySettings.iban || ''}
                    onChange={(e) => setCompanySettings({...companySettings, iban: e.target.value})}
                    placeholder="CZ65 0800 0000 1920 0014 5399"
                  />
                </div>
                <div className="space-y-2">
                  <Label>SWIFT/BIC</Label>
                  <Input 
                    value={companySettings.swift || ''}
                    onChange={(e) => setCompanySettings({...companySettings, swift: e.target.value})}
                    placeholder="GIBACZPX"
                  />
                </div>
              </div>

              <Separator />

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Prefix faktur</Label>
                  <Input 
                    value={companySettings.invoicePrefix || ''}
                    onChange={(e) => setCompanySettings({...companySettings, invoicePrefix: e.target.value})}
                    placeholder="2024"
                  />
                  <p className="text-xs text-gray-500">Např. 2024 → faktury 2024000001</p>
                </div>
                <div className="space-y-2">
                  <Label>Výchozí DPH (%)</Label>
                  <Input 
                    type="number"
                    value={companySettings.defaultVatRate}
                    onChange={(e) => setCompanySettings({...companySettings, defaultVatRate: parseFloat(e.target.value)})}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Splatnost (dny)</Label>
                  <Input 
                    type="number"
                    value={companySettings.invoiceDueDays}
                    onChange={(e) => setCompanySettings({...companySettings, invoiceDueDays: parseInt(e.target.value)})}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end">
            <Button onClick={saveCompanySettings} disabled={saving}>
              {saving ? 'Ukládání...' : 'Uložit fakturační údaje'}
            </Button>
          </div>
        </TabsContent>
      </Tabs>

      <div className="flex justify-end mt-6">
        <Button onClick={handleSave} disabled={saving}>
          {saving ? 'Ukládání...' : 'Uložit nastavení'}
        </Button>
      </div>
    </div>
  )
}
