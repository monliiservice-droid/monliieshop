'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export default function AdminLoginPage() {
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  })
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (response.ok) {
        // Hard redirect to ensure middleware picks up the session
        window.location.href = '/admin'
      } else {
        setError(data.error || 'Nepodařilo se přihlásit')
      }
    } catch {
      setError('Chyba připojení k serveru')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#fbf7f2] p-4 font-sans">
      <Card className="w-full max-w-md border-[#e6dbd0] shadow-sm">
        <CardHeader className="space-y-4 text-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo.svg" alt="Monlii" className="mx-auto h-12 w-auto" />
          <div>
            <CardTitle className="text-xl font-semibold">Administrace</CardTitle>
            <CardDescription>Přihlaste se ke správě e-shopu</CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg">
                {error}
              </div>
            )}
            
            <div className="space-y-2">
              <Label htmlFor="username">Uživatelské jméno</Label>
              <Input
                id="username"
                type="text"
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                placeholder="admin"
                required
                disabled={isLoading}
                className="focus:border-[#931e31] focus:ring-[#931e31]"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Heslo</Label>
              <Input
                id="password"
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                placeholder="••••••••"
                required
                disabled={isLoading}
                className="focus:border-[#931e31] focus:ring-[#931e31]"
              />
            </div>

            <Button
              type="submit"
              className="w-full bg-[#931e31] text-white hover:bg-[#6f1424]"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Přihlašování...
                </>
              ) : (
                <>
                  Přihlásit se
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
