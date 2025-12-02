import Link from 'next/link'
import Image from 'next/image'
import { Facebook, Instagram } from 'lucide-react'

export function Footer() {
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

          {/* Contact */}
          <div className="space-y-4">
            <h4 className="font-bold text-black">Sledujte nás</h4>
            <div className="flex space-x-4">
              <Link 
                href="https://www.facebook.com/monlii.cz" 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-10 h-10 flex items-center justify-center rounded-full bg-white text-[#931e31] hover:bg-[#931e31] hover:text-white transition-all shadow-sm hover:shadow-md"
              >
                <Facebook className="h-5 w-5" />
              </Link>
              <Link 
                href="https://www.instagram.com/monlii_i/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-10 h-10 flex items-center justify-center rounded-full bg-white text-[#931e31] hover:bg-[#931e31] hover:text-white transition-all shadow-sm hover:shadow-md"
              >
                <Instagram className="h-5 w-5" />
              </Link>
            </div>
          </div>
        </div>

        <div className="mt-12 pt-8 text-center space-y-2" style={{borderTop: '1px solid rgba(147, 30, 49, 0.08)'}}>
          <p className="text-sm text-gray-600 font-medium">&copy; {new Date().getFullYear()} Monlii. Všechna práva vyhrazena.</p>
          <p className="text-xs text-gray-500">
            Stránku vytvořil <Link href="https://nevymyslis.cz" target="_blank" rel="noopener noreferrer" className="text-[#931e31] hover:underline font-medium">Roman Velička z nevymyslis.cz</Link>
          </p>
        </div>
      </div>
    </footer>
  )
}
