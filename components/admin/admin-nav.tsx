'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  FolderTree,
  LayoutDashboard,
  LayoutTemplate,
  Package,
  Percent,
  Settings,
  ShoppingBag,
  Tag,
  TrendingUp,
} from 'lucide-react'

const NAV_ITEMS = [
  { href: '/admin', icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/admin/objednavky', icon: ShoppingBag, label: 'Objednávky' },
  { href: '/admin/produkty', icon: Package, label: 'Produkty' },
  { href: '/admin/kategorie', icon: FolderTree, label: 'Kategorie' },
  { href: '/admin/obsah', icon: LayoutTemplate, label: 'Obsah webu' },
  { href: '/admin/vyprodeje', icon: Percent, label: 'Výprodeje' },
  { href: '/admin/slevove-kody', icon: Tag, label: 'Slevové kódy' },
  { href: '/admin/trzby', icon: TrendingUp, label: 'Tržby a faktury' },
  { href: '/admin/nastaveni', icon: Settings, label: 'Nastavení' },
]

export function AdminNav() {
  const pathname = usePathname()
  const isActive = (href: string) => (href === '/admin' ? pathname === href : pathname.startsWith(href))

  return (
    <>
      {/* Mobil: vodorovně posuvné menu */}
      <nav className="sticky top-0 z-30 flex gap-1 overflow-x-auto border-b bg-white px-3 py-2 md:hidden">
        {NAV_ITEMS.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`flex shrink-0 items-center gap-1.5 rounded-md px-3 py-2 text-sm ${isActive(item.href) ? 'bg-gray-900 text-white' : 'text-gray-700 hover:bg-gray-100'}`}
          >
            <item.icon className="h-4 w-4" />
            {item.label}
          </Link>
        ))}
      </nav>

      {/* Počítač: boční panel */}
      <aside className="hidden w-64 shrink-0 border-r bg-white md:block">
        <nav className="sticky top-0 space-y-1 p-4">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 rounded-lg px-4 py-2.5 transition-colors ${isActive(item.href) ? 'bg-gray-900 text-white' : 'text-gray-700 hover:bg-gray-100'}`}
            >
              <item.icon className="h-5 w-5" />
              <span className="font-medium">{item.label}</span>
            </Link>
          ))}
        </nav>
      </aside>
    </>
  )
}
