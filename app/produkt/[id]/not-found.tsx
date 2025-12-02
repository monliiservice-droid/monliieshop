import { Navbar } from '@/components/navbar'
import { Footer } from '@/components/footer'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { AlertCircle } from 'lucide-react'

export default function NotFound() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-white flex items-center justify-center">
        <div className="container max-w-2xl text-center py-20">
          <AlertCircle className="h-24 w-24 mx-auto text-gray-400 mb-6" />
          <h1 className="text-4xl font-bold mb-4">Produkt nenalezen</h1>
          <p className="text-xl text-gray-600 mb-8">
            Omlouváme se, ale produkt, který hledáte, neexistuje nebo byl odstraněn.
          </p>
          <Link href="/obchod">
            <Button className="bg-gradient-to-r from-[#931e31] to-[#b8263d] hover:from-[#6b1623] hover:to-[#931e31] text-white px-8 py-6 rounded-full font-semibold text-lg transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-xl">
              Zpět do obchodu
            </Button>
          </Link>
        </div>
      </main>
      <Footer />
    </>
  )
}
