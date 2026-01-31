'use client'

import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { ShoppingBag, CreditCard, QrCode, Truck, X } from 'lucide-react'
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
              <ShoppingBag className="h-8 w-8 text-white" />
            </div>
            <DialogTitle className="text-3xl font-bold text-white mb-2">
              Objednávky jsou spuštěny! 🎉
            </DialogTitle>
            <DialogDescription className="text-pink-50 text-lg">
              Vítejte v novém Monlii e-shopu
            </DialogDescription>
          </div>
        </div>

        {/* Content */}
        <div className="p-8">
          <div className="space-y-6">
            {/* Hlavní zpráva */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <p className="text-gray-700 text-lg leading-relaxed">
                Náš nový e-shop je nyní plně funkční a <strong>můžete si objednat</strong>! Platby kartou jsou zatím ve vývoji, ale máme pro vás další možnosti.
              </p>
            </div>

            {/* Možnosti platby */}
            <div>
              <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <span className="text-2xl">�</span>
                Jak můžete platit?
              </h3>
              
              <div className="space-y-3">
                {/* QR platba */}
                <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200/50">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center flex-shrink-0">
                    <QrCode className="h-5 w-5 text-white" />
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900">QR platba / Bankovní převod</p>
                    <p className="text-sm text-gray-600">Rychlá platba přes mobilní bankovnictví</p>
                  </div>
                  <span className="text-green-600 font-semibold text-sm">✓ Dostupné</span>
                </div>

                {/* Dobírka */}
                <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl border border-amber-200/50">
                  <div className="w-10 h-10 bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Truck className="h-5 w-5 text-white" />
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900">Dobírka</p>
                    <p className="text-sm text-gray-600">Platba při převzetí zásilky</p>
                  </div>
                  <span className="text-green-600 font-semibold text-sm">✓ Dostupné</span>
                </div>

                {/* Kartou - brzy */}
                <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-gray-50 to-slate-50 rounded-xl border border-gray-200/50 opacity-70">
                  <div className="w-10 h-10 bg-gradient-to-br from-gray-400 to-slate-500 rounded-xl flex items-center justify-center flex-shrink-0">
                    <CreditCard className="h-5 w-5 text-white" />
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900">Platba kartou</p>
                    <p className="text-sm text-gray-600">Visa, Mastercard, Apple Pay...</p>
                  </div>
                  <span className="text-amber-600 font-semibold text-sm">Již brzy</span>
                </div>
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
