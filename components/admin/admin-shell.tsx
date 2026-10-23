'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { LogoutButton } from '@/components/admin/LogoutButton'
import { AdminNav } from '@/components/admin/admin-nav'

/** Rám administrace – na přihlašovací stránce se menu nezobrazuje */
export function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  if (pathname === '/admin/login') {
    return <>{children}</>
  }

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      <header className="border-b bg-white">
        <div className="flex h-16 items-center justify-between px-4 md:px-6">
          <Link href="/admin" className="flex items-center gap-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo.svg" alt="Monlii" className="h-8 w-auto" />
            <span className="hidden border-l pl-3 text-sm font-semibold text-gray-600 sm:inline">Administrace</span>
          </Link>
          <div className="flex items-center gap-2">
            <Link href="/" target="_blank">
              <Button variant="outline" size="sm">Zobrazit web</Button>
            </Link>
            <LogoutButton />
          </div>
        </div>
      </header>

      <div className="md:flex">
        <AdminNav />
        <main className="min-w-0 flex-1 p-4 md:p-8">{children}</main>
      </div>
    </div>
  )
}
