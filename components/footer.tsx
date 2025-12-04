'use client'

import Link from 'next/link'
import Image from 'next/image'
import { Facebook, Instagram } from 'lucide-react'
import { useEffect, useState } from 'react'

interface CompanySettings {
  companyName: string
  ico: string
  street: string
  city: string
  zip: string
  country: string
  email: string
  phone: string
}

export function Footer() {
  const [companySettings, setCompanySettings] = useState<CompanySettings | null>(null)

  useEffect(() => {
    // Načtení fakturačních údajů z API
    fetch('/api/admin/company-settings')
      .then(res => res.json())
      .then(data => setCompanySettings(data))
      .catch(err => console.error('Error loading company settings:', err))
  }, [])
  
  return (
    <footer className="bg-gradient-to-b from-white via-pink-50/20 to-pink-50/30" style={{borderTop: '1px solid rgba(147, 30, 49, 0.08)'}}>
      <div className="container py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          {/* Brand */}
          <div className="space-y-4">
            <Image
              src="/logo_wide_black.png"
              alt="Monlii"
              width={140}
              height={46}
              className="mb-2"
            />
            <p className="text-sm text-gray-600 leading-relaxed">
              Jedinečné spodní prádlo s příběhem a českou tradicí
            </p>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h4 className="font-bold text-black">Navigace</h4>
            <ul className="space-y-3 text-sm text-gray-600">
              <li><Link href="/" className="hover:text-black transition-all hover:translate-x-1 inline-block">Domů</Link></li>
              <li><Link href="/obchod" className="hover:text-black transition-all hover:translate-x-1 inline-block">Obchod</Link></li>
              <li><Link href="/o-nas" className="hover:text-black transition-all hover:translate-x-1 inline-block">O nás</Link></li>
              <li><Link href="/kontakty" className="hover:text-black transition-all hover:translate-x-1 inline-block">Kontakty</Link></li>
            </ul>
          </div>

          {/* Customer Service */}
          <div className="space-y-4">
            <h4 className="font-bold text-black">Zákaznický servis</h4>
            <ul className="space-y-3 text-sm text-gray-600">
              <li><Link href="/obchodni-podminky" className="hover:text-black transition-all hover:translate-x-1 inline-block">Obchodní podmínky</Link></li>
              <li><Link href="/doprava" className="hover:text-black transition-all hover:translate-x-1 inline-block">Doprava a platba</Link></li>
              <li><Link href="/reklamace" className="hover:text-black transition-all hover:translate-x-1 inline-block">Reklamace</Link></li>
              <li><Link href="/ochrana-osobnich-udaju" className="hover:text-black transition-all hover:translate-x-1 inline-block">Ochrana osobních údajů</Link></li>
            </ul>
          </div>

          {/* Contact Info */}
          <div className="space-y-4">
            <h4 className="font-bold text-black">Kontakt</h4>
            <ul className="space-y-2 text-sm text-gray-600">
              {companySettings?.email && (
                <li>
                  <a href={`mailto:${companySettings.email}`} className="hover:text-black transition-colors">
                    {companySettings.email}
                  </a>
                </li>
              )}
              {companySettings?.phone && (
                <li>
                  <a href={`tel:${companySettings.phone.replace(/\s/g, '')}`} className="hover:text-black transition-colors">
                    {companySettings.phone}
                  </a>
                </li>
              )}
            </ul>
            <div className="pt-4">
              <h5 className="font-semibold text-sm text-black mb-2">Sledujte nás</h5>
              <div className="flex space-x-3">
                <Link 
                  href="https://www.facebook.com/monlii.cz" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="w-9 h-9 flex items-center justify-center rounded-full bg-white text-[#931e31] hover:bg-[#931e31] hover:text-white transition-all shadow-sm hover:shadow-md"
                >
                  <Facebook className="h-4 w-4" />
                </Link>
                <Link 
                  href="https://www.instagram.com/monlii_i/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="w-9 h-9 flex items-center justify-center rounded-full bg-white text-[#931e31] hover:bg-[#931e31] hover:text-white transition-all shadow-sm hover:shadow-md"
                >
                  <Instagram className="h-4 w-4" />
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Company Info & Payment Logos */}
        <div className="mt-12 pt-8 space-y-6" style={{borderTop: '1px solid rgba(147, 30, 49, 0.08)'}}>
          {/* Company Identification */}
          <div className="text-center space-y-2">
            {companySettings && (
              <>
                <p className="text-sm text-gray-700 font-semibold">{companySettings.companyName}</p>
                <p className="text-xs text-gray-600">
                  {companySettings.ico && `IČO: ${companySettings.ico}`}
                  {companySettings.ico && companySettings.street && ' | '}
                  {companySettings.street && `${companySettings.street}, `}
                  {companySettings.zip && `${companySettings.zip} `}
                  {companySettings.city}
                  {companySettings.country && `, ${companySettings.country}`}
                </p>
              </>
            )}
          </div>

          {/* Payment Methods */}
          <div className="flex flex-col items-center space-y-3">
            <p className="text-xs text-gray-600 font-medium">Přijímáme platební karty:</p>
            <div className="flex items-center gap-4 flex-wrap justify-center">
              {/* Visa */}
              <div className="h-8 px-3 bg-white rounded border border-gray-200 flex items-center">
                <span className="text-sm font-bold text-[#1A1F71]">VISA</span>
              </div>
              {/* Mastercard */}
              <div className="h-8 px-3 bg-white rounded border border-gray-200 flex items-center">
                <div className="flex items-center gap-[-4px]">
                  <div className="w-5 h-5 rounded-full bg-[#EB001B]"></div>
                  <div className="w-5 h-5 rounded-full bg-[#FF5F00] -ml-2"></div>
                </div>
              </div>
              {/* GoPay */}
              <div className="h-8 px-3 bg-[#00C9A5] rounded flex items-center">
                <span className="text-sm font-bold text-white">GoPay</span>
              </div>
              {/* 3D Secure */}
              <div className="h-8 px-3 bg-white rounded border border-gray-200 flex items-center">
                <span className="text-xs font-semibold text-gray-700">3D Secure</span>
              </div>
            </div>
          </div>

          {/* Copyright */}
          <div className="text-center space-y-2 pt-4">
            <p className="text-sm text-gray-600 font-medium">&copy; {new Date().getFullYear()} Monlii. Všechna práva vyhrazena.</p>
            <p className="text-xs text-gray-500">
              Stránku vytvořil <Link href="https://nevymyslis.cz" target="_blank" rel="noopener noreferrer" className="text-[#931e31] hover:underline font-medium">Roman Velička z nevymyslis.cz</Link>
            </p>
          </div>
        </div>
      </div>
    </footer>
  )
}
