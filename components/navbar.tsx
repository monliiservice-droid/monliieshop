'use client'

import Link from 'next/link'
import Image from 'next/image'
import { ShoppingBag, Menu, X, Facebook, Instagram } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useState, useEffect } from 'react'

export function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [cartItemCount, setCartItemCount] = useState(0)

  useEffect(() => {
    // Načtení počtu položek v košíku
    const updateCartCount = () => {
      try {
        const cart = localStorage.getItem('cart')
        if (cart) {
          const items = JSON.parse(cart)
          // Počítej celkové množství všech položek
          const totalQuantity = items.reduce((total: number, item: any) => {
            return total + (item.quantity || 1)
          }, 0)
          setCartItemCount(totalQuantity)
        } else {
          setCartItemCount(0)
        }
      } catch (error) {
        console.error('Error reading cart:', error)
        setCartItemCount(0)
      }
    }

    updateCartCount()

    // Naslouchání změnám v localStorage
    window.addEventListener('storage', updateCartCount)
    
    // Custom event pro update košíku
    window.addEventListener('cartUpdated', updateCartCount)

    return () => {
      window.removeEventListener('storage', updateCartCount)
      window.removeEventListener('cartUpdated', updateCartCount)
    }
  }, [])

  const navLinks = [
    { href: '/', label: 'Domů' },
    { href: '/obchod', label: 'Produkty' },
    { href: '/predplatne', label: 'Předplatné' },
    { href: '/o-nas', label: 'O nás' },
    { href: '/kontakty', label: 'Kontakty' },
  ]

  return (
    <header className="sticky top-0 z-50 w-full bg-white/80 backdrop-blur-xl supports-[backdrop-filter]:bg-white/70 shadow-sm" style={{boxShadow: '0 4px 20px rgba(147, 30, 49, 0.04), 0 1px 4px rgba(0, 0, 0, 0.02)'}}>
      <div className="container flex h-16 items-center justify-between animate-fade-in">
        {/* Logo */}
        <Link href="/" className="flex items-center group">
          <Image
            src="/logo_wide_black.png"
            alt="Monlii"
            width={120}
            height={40}
            className="transition-transform group-hover:scale-105"
            priority
          />
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-8">
          {navLinks.map((link, index) => (
            <Link
              key={link.href}
              href={link.href}
              className="relative text-sm font-medium transition-colors hover:text-black group"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <span className="relative z-10">{link.label}</span>
              <span className="absolute inset-x-0 -bottom-1 h-0.5 bg-[#931e31] scale-x-0 transition-transform origin-left group-hover:scale-x-100"></span>
            </Link>
          ))}
        </nav>

        {/* Right side - Social Icons & Cart */}
        <div className="flex items-center space-x-4">
          <div className="hidden md:flex items-center space-x-3">
            <Link 
              href="https://www.facebook.com/monlii.cz" 
              target="_blank" 
              rel="noopener noreferrer"
              className="transition-transform hover:scale-110"
            >
              <Facebook className="h-5 w-5 text-gray-600 hover:text-black transition-colors" />
            </Link>
            <Link 
              href="https://www.instagram.com/monlii_i/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="transition-transform hover:scale-110"
            >
              <Instagram className="h-5 w-5 text-gray-600 hover:text-black transition-colors" />
            </Link>
          </div>
          
          <Link href="/kosik">
            <Button variant="ghost" size="icon" className="hover:bg-black hover:text-white transition-all relative">
              <ShoppingBag className="h-5 w-5" />
              {cartItemCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-gradient-to-r from-[#931e31] to-[#b8263d] text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center animate-pulse">
                  {cartItemCount}
                </span>
              )}
              <span className="sr-only">Košík</span>
            </Button>
          </Link>

          {/* Mobile menu button */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden hover:bg-black hover:text-white transition-all"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            <span className="sr-only">Menu</span>
          </Button>
        </div>
      </div>

      {/* Mobile Navigation */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t bg-white animate-slide-in">
          <nav className="container py-4 flex flex-col space-y-3">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm font-medium transition-all hover:translate-x-2 hover:text-black"
                onClick={() => setMobileMenuOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            <div className="flex items-center space-x-4 pt-3 border-t">
              <Link href="https://www.facebook.com/monlii.cz" target="_blank" rel="noopener noreferrer">
                <Facebook className="h-5 w-5 text-gray-600 hover:text-black transition-colors" />
              </Link>
              <Link href="https://www.instagram.com/monlii_i/" target="_blank" rel="noopener noreferrer">
                <Instagram className="h-5 w-5 text-gray-600 hover:text-black transition-colors" />
              </Link>
            </div>
          </nav>
        </div>
      )}
    </header>
  )
}
