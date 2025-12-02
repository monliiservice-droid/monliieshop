'use client'

import { LogOut } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'

export function LogoutButton() {
  const router = useRouter()

  const handleLogout = () => {
    // Vyčistit HTTP Basic Auth credentials
    // Redirect na speciální URL s neplatnými credentials
    const logoutUrl = `${window.location.protocol}//logout:logout@${window.location.host}/admin`
    
    // Otevřít v novém okně a zavřít ho
    const logoutWindow = window.open(logoutUrl, '_blank')
    if (logoutWindow) {
      setTimeout(() => {
        logoutWindow.close()
      }, 100)
    }
    
    // Redirect na homepage
    window.location.href = '/'
  }

  return (
    <Button variant="ghost" size="sm" onClick={handleLogout}>
      <LogOut className="h-4 w-4 mr-2" />
      Odhlásit
    </Button>
  )
}
