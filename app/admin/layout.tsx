import Link from 'next/link'
import Image from 'next/image'
import { LayoutDashboard, Package, Settings, ShoppingBag, Users, Tag, TrendingUp } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { LogoutButton } from '@/components/admin/LogoutButton'

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const navItems = [
    { href: '/admin', icon: LayoutDashboard, label: 'Dashboard' },
    { href: '/admin/produkty', icon: Package, label: 'Produkty' },
    { href: '/admin/objednavky', icon: ShoppingBag, label: 'Objednávky' },
    { href: '/admin/trzby', icon: TrendingUp, label: 'Tržby' },
    { href: '/admin/slevove-kody', icon: Tag, label: 'Slevové kódy' },
    { href: '/admin/nastaveni', icon: Settings, label: 'Nastavení' },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Admin Header */}
      <header className="bg-white border-b">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link href="/admin" className="flex items-center space-x-3">
              <Image 
                src="/logo_wide_black.png" 
                alt="Monlii Logo" 
                width={120} 
                height={40}
                className="h-8 w-auto"
                priority
              />
              <span className="text-sm font-semibold text-gray-600 border-l pl-3">Admin Panel</span>
            </Link>
          </div>
          <div className="flex items-center space-x-4">
            <Link href="/" target="_blank">
              <Button variant="outline" size="sm">
                Zobrazit web
              </Button>
            </Link>
            <LogoutButton />
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside className="w-64 min-h-[calc(100vh-4rem)] bg-white border-r">
          <nav className="p-4 space-y-2">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center space-x-3 px-4 py-3 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <item.icon className="h-5 w-5 text-gray-600" />
                <span className="font-medium">{item.label}</span>
              </Link>
            ))}
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-8">
          {children}
        </main>
      </div>
    </div>
  )
}
