'use client'

import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ChevronDown, Menu, ShoppingBag, X } from 'lucide-react'
import type { NavItem, NavLink, SiteNavigation } from '@/lib/navigation'
import { useCartCount } from './cart-count'
import { SmartImage } from './smart-image'

function CartButton() {
  const count = useCartCount()
  return (
    <Link href="/kosik" className="relative inline-flex h-10 w-10 items-center justify-center" aria-label={`Košík (${count} ks)`}>
      <ShoppingBag className="h-[22px] w-[22px]" strokeWidth={1.5} />
      {count > 0 && (
        <span className="absolute right-0.5 top-0.5 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-wine px-1 text-[10px] font-semibold text-white">
          {count}
        </span>
      )}
    </Link>
  )
}

function MegaMenu({ item, onNavigate }: { item: NavItem; onNavigate: () => void }) {
  return (
    <div className="site-container grid gap-10 py-10 lg:grid-cols-[1fr_280px]">
      <div className="grid grid-cols-2 gap-x-8 gap-y-8 md:grid-cols-3 xl:grid-cols-4">
        {item.groups.map((group) => (
          <div key={group.href}>
            <Link href={group.href} onClick={onNavigate} className="link-line font-display text-xl">
              {group.label}
            </Link>
            {group.links.length > 0 && (
              <ul className="mt-3 space-y-2 text-sm text-ink-soft">
                {group.links.map((link) => (
                  <li key={link.href}>
                    <Link href={link.href} onClick={onNavigate} className="link-line hover:text-ink">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>
        ))}
        <div>
          <Link href={item.href} onClick={onNavigate} className="eyebrow link-line">
            Vše – {item.label}
          </Link>
        </div>
      </div>
      {item.image && (
        <Link href={item.href} onClick={onNavigate} className="group relative hidden aspect-[4/5] overflow-hidden lg:block">
          <SmartImage src={item.image} alt={item.label} fill sizes="280px" className="object-cover transition-transform duration-700 group-hover:scale-105" />
          <span className="absolute bottom-4 left-4 bg-linen px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.16em]">{item.label}</span>
        </Link>
      )}
    </div>
  )
}

function MobileMenu({ navigation, onClose }: { navigation: SiteNavigation; onClose: () => void }) {
  const [openItem, setOpenItem] = useState<string | null>(null)
  return (
    <div className="fixed inset-0 z-[60] lg:hidden" role="dialog" aria-modal="true" aria-label="Menu">
      <button type="button" className="absolute inset-0 bg-ink/40" onClick={onClose} aria-label="Zavřít menu" />
      <div className="absolute inset-y-0 left-0 flex w-[min(88vw,400px)] flex-col bg-linen shadow-xl">
        <div className="flex h-16 items-center justify-between border-b border-line px-5">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo.svg" alt="Monlii" className="h-8 w-auto" />
          <button type="button" onClick={onClose} className="-mr-2 p-2" aria-label="Zavřít menu">
            <X className="h-6 w-6" strokeWidth={1.5} />
          </button>
        </div>
        <nav className="flex-1 overflow-y-auto px-5 py-4">
          <ul className="divide-y divide-line">
            {navigation.primary.map((item) => {
              const isOpen = openItem === item.href
              return (
                <li key={item.href} className="py-1">
                  {item.groups.length > 0 ? (
                    <>
                      <button
                        type="button"
                        onClick={() => setOpenItem(isOpen ? null : item.href)}
                        className={`flex w-full items-center justify-between py-3 font-display text-2xl ${item.highlight ? 'text-wine' : ''}`}
                        aria-expanded={isOpen}
                      >
                        {item.label}
                        <ChevronDown className={`h-5 w-5 transition-transform ${isOpen ? 'rotate-180' : ''}`} strokeWidth={1.5} />
                      </button>
                      {isOpen && (
                        <ul className="space-y-3 pb-4 pl-1">
                          <li>
                            <Link href={item.href} onClick={onClose} className="eyebrow">Vše – {item.label}</Link>
                          </li>
                          {item.groups.map((group) => (
                            <li key={group.href}>
                              <Link href={group.href} onClick={onClose} className="font-medium">{group.label}</Link>
                              {group.links.length > 0 && (
                                <ul className="mt-2 space-y-2 border-l border-line pl-4 text-sm text-ink-soft">
                                  {group.links.map((link) => (
                                    <li key={link.href}>
                                      <Link href={link.href} onClick={onClose}>{link.label}</Link>
                                    </li>
                                  ))}
                                </ul>
                              )}
                            </li>
                          ))}
                        </ul>
                      )}
                    </>
                  ) : (
                    <Link href={item.href} onClick={onClose} className={`block py-3 font-display text-2xl ${item.highlight ? 'text-wine' : ''}`}>
                      {item.label}
                    </Link>
                  )}
                </li>
              )
            })}
          </ul>
          <ul className="mt-6 space-y-3 text-sm uppercase tracking-[0.14em]">
            {navigation.secondary.map((link) => (
              <li key={link.href}>
                <Link href={link.href} onClick={onClose}>{link.label}</Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </div>
  )
}

export function HeaderClient({ navigation }: { navigation: SiteNavigation }) {
  const pathname = usePathname()
  const [activeMenu, setActiveMenu] = useState<string | null>(null)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Zavření menu při přechodu na jinou stránku
  useEffect(() => {
    setActiveMenu(null)
    setMobileOpen(false)
  }, [pathname])

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [mobileOpen])

  const openMenu = (href: string | null) => {
    if (closeTimer.current) clearTimeout(closeTimer.current)
    setActiveMenu(href)
  }
  const scheduleClose = () => {
    closeTimer.current = setTimeout(() => setActiveMenu(null), 120)
  }

  const active = navigation.primary.find((item) => item.href === activeMenu && item.groups.length > 0)
  const isCurrent = (link: NavLink) => pathname === link.href || pathname.startsWith(`${link.href}/`)

  return (
    <header
      className={`sticky top-0 z-50 border-b transition-colors duration-300 ${scrolled || active ? 'border-line bg-linen/95 backdrop-blur' : 'border-transparent bg-linen'}`}
      onMouseLeave={scheduleClose}
    >
      <div className="site-container grid h-16 grid-cols-[1fr_auto_1fr] items-center gap-4 lg:h-20">
        {/* Levá část: menu */}
        <div className="flex items-center">
          <button type="button" onClick={() => setMobileOpen(true)} className="-ml-2 p-2 lg:hidden" aria-label="Otevřít menu">
            <Menu className="h-6 w-6" strokeWidth={1.5} />
          </button>
          <nav className="hidden items-center gap-7 lg:flex" aria-label="Hlavní menu">
            {navigation.primary.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onMouseEnter={() => openMenu(item.href)}
                onFocus={() => openMenu(item.href)}
                aria-current={isCurrent(item) ? 'page' : undefined}
                aria-expanded={item.groups.length > 0 ? activeMenu === item.href : undefined}
                className={`link-line py-1 text-[13px] font-semibold uppercase tracking-[0.14em] ${item.highlight ? 'text-wine' : ''}`}
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>

        {/* Logo uprostřed */}
        <Link href="/" className="justify-self-center" aria-label="Monlii – úvodní stránka" onMouseEnter={() => openMenu(null)}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo.svg" alt="Monlii" className="h-9 w-auto lg:h-12" width={175} height={48} />
        </Link>

        {/* Pravá část */}
        <div className="flex items-center justify-end gap-6" onMouseEnter={() => openMenu(null)}>
          <nav className="hidden items-center gap-6 xl:flex" aria-label="Doplňkové menu">
            {navigation.secondary.map((link) => (
              <Link key={link.href} href={link.href} aria-current={isCurrent(link) ? 'page' : undefined} className="link-line text-[13px] text-ink-soft hover:text-ink">
                {link.label}
              </Link>
            ))}
          </nav>
          <CartButton />
        </div>
      </div>

      {/* Megamenu */}
      {active && (
        <div className="absolute inset-x-0 top-full border-b border-line bg-linen shadow-[0_24px_40px_-24px_rgba(43,15,12,0.25)]" onMouseEnter={() => openMenu(active.href)}>
          <MegaMenu item={active} onNavigate={() => setActiveMenu(null)} />
        </div>
      )}

      {/* Menu se vykresluje mimo hlavičku: po odscrolování má hlavička backdrop-blur, který by „fixed“
          menu uzavřel do své výšky */}
      {mobileOpen && createPortal(<MobileMenu navigation={navigation} onClose={() => setMobileOpen(false)} />, document.body)}
    </header>
  )
}
