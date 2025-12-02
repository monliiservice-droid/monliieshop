import Link from 'next/link'
import { Navbar } from '@/components/navbar'
import { Footer } from '@/components/footer'
import { Home, Search, ShoppingBag } from 'lucide-react'

export default function NotFound() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-gradient-to-b from-white via-pink-50/10 to-white flex items-center justify-center py-20">
        <div className="container max-w-2xl text-center">
          <div className="animate-fade-in">
            {/* 404 Number */}
            <div className="mb-8">
              <h1 className="text-9xl md:text-[12rem] font-black bg-gradient-to-r from-[#931e31] to-[#b8263d] bg-clip-text text-transparent">
                404
              </h1>
            </div>

            {/* Message */}
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-gray-900">
              Stránka nenalezena
            </h2>
            <p className="text-xl text-gray-600 mb-12 max-w-md mx-auto">
              Omlouváme se, ale stránka, kterou hledáte, neexistuje nebo byla přesunuta.
            </p>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link 
                href="/"
                className="inline-flex items-center gap-2 bg-gradient-to-r from-[#931e31] to-[#b8263d] hover:from-[#6b1623] hover:to-[#931e31] text-white px-8 py-4 rounded-full font-bold transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-xl"
              >
                <Home className="h-5 w-5" />
                Domů
              </Link>
              <Link 
                href="/obchod"
                className="inline-flex items-center gap-2 bg-white hover:bg-gray-50 text-gray-900 px-8 py-4 rounded-full font-bold border-2 border-gray-200 transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-xl"
              >
                <ShoppingBag className="h-5 w-5" />
                Obchod
              </Link>
            </div>

            {/* Search Suggestion */}
            <div className="mt-12 p-6 bg-pink-50/50 rounded-3xl border border-pink-100">
              <Search className="h-8 w-8 text-[#931e31] mx-auto mb-3" />
              <p className="text-gray-700">
                Zkuste se vrátit na hlavní stránku nebo prozkoumejte naši kolekci produktů.
              </p>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
