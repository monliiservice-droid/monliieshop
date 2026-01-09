'use client'

import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Construction, Instagram, Phone, ExternalLink, X } from 'lucide-react'
import Link from 'next/link'

export function WelcomeNotice() {
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    // Zkontrolovat, zda již bylo okno zobrazeno
    const hasSeenNotice = localStorage.getItem('monlii-welcome-notice-seen')
    
    if (!hasSeenNotice) {
      // Zobrazit modal po krátkém zpoždění pro lepší UX
      setTimeout(() => {
        setIsOpen(true)
      }, 500)
    }
  }, [])

  const handleClose = () => {
    // Označit jako zobrazené
    localStorage.setItem('monlii-welcome-notice-seen', 'true')
    setIsOpen(false)
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="sm:max-w-[600px] p-0 overflow-hidden border-0 bg-gradient-to-br from-white via-pink-50/30 to-purple-50/30">
        {/* Close button */}
        <button
          onClick={handleClose}
          className="absolute right-4 top-4 z-50 rounded-full p-2 text-gray-400 hover:text-gray-600 hover:bg-white/80 transition-all"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Header s gradientem */}
        <div className="bg-gradient-to-r from-[#931e31] to-[#b8263d] p-8 text-center relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16"></div>
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full -ml-12 -mb-12"></div>
          
          <div className="relative z-10">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl mb-4">
              <Construction className="h-8 w-8 text-white" />
            </div>
            <DialogTitle className="text-3xl font-bold text-white mb-2">
              Vítejte v novém Monlii! 👋
            </DialogTitle>
            <DialogDescription className="text-pink-50 text-lg">
              Právě dokončujeme poslední úpravy
            </DialogDescription>
          </div>
        </div>

        {/* Content */}
        <div className="p-8">
          <div className="space-y-6">
            {/* Hlavní zpráva */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <p className="text-gray-700 text-lg leading-relaxed">
                Náš nový e-shop se právě připravuje na váš příchod. Zatím zde můžete procházet produkty a seznamovat se s naší nabídkou, ale <strong>objednávky ještě nejsou aktivní</strong>.
              </p>
            </div>

            {/* Možnosti nákupu */}
            <div>
              <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <span className="text-2xl">💝</span>
                Chcete si objednat hned?
              </h3>
              
              <div className="space-y-3">
                {/* Instagram */}
                <a 
                  href="https://www.instagram.com/monlii_i/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center gap-4 p-4 bg-gradient-to-r from-pink-50 to-purple-50 hover:from-pink-100 hover:to-purple-100 rounded-xl transition-all duration-300 border border-pink-200/50 group"
                >
                  <div className="w-10 h-10 bg-gradient-to-br from-pink-500 to-purple-600 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                    <Instagram className="h-5 w-5 text-white" />
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900">Napište nám na Instagramu</p>
                    <p className="text-sm text-gray-600">@monlii_i</p>
                  </div>
                  <ExternalLink className="h-5 w-5 text-gray-400 group-hover:text-gray-600" />
                </a>

                {/* Telefon */}
                <a 
                  href="tel:+420777014753" 
                  className="flex items-center gap-4 p-4 bg-gradient-to-r from-green-50 to-emerald-50 hover:from-green-100 hover:to-emerald-100 rounded-xl transition-all duration-300 border border-green-200/50 group"
                >
                  <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                    <Phone className="h-5 w-5 text-white" />
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900">Zavolejte nám</p>
                    <p className="text-sm text-gray-600">+420 777 014 753</p>
                  </div>
                </a>

                {/* Starý eshop */}
                <a 
                  href="https://monlii.shop" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center gap-4 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 hover:from-blue-100 hover:to-indigo-100 rounded-xl transition-all duration-300 border border-blue-200/50 group"
                >
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                    <ExternalLink className="h-5 w-5 text-white" />
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900">Navštivte náš původní e-shop</p>
                    <p className="text-sm text-gray-600">monlii.shop</p>
                  </div>
                  <ExternalLink className="h-5 w-5 text-gray-400 group-hover:text-gray-600" />
                </a>
              </div>
            </div>

            {/* Tlačítko zavřít */}
            <Button
              onClick={handleClose}
              className="w-full bg-gradient-to-r from-[#931e31] to-[#b8263d] hover:from-[#6b1623] hover:to-[#931e31] text-white py-6 rounded-xl font-semibold text-lg transition-all duration-300 shadow-lg hover:shadow-xl"
            >
              Rozumím, chci se podívat
            </Button>

            <p className="text-center text-sm text-gray-500">
              Děkujeme za trpělivost a těšíme se na vás! ❤️
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
