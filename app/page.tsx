'use client'

import { Navbar } from '@/components/navbar'
import { Footer } from '@/components/footer'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import Image from 'next/image'
import { ArrowRight, Heart, Package, Shield, Instagram } from 'lucide-react'
import { useEffect, useRef } from 'react'

export default function Home() {
  const reviewsCarouselRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const carousel = reviewsCarouselRef.current
    if (!carousel) return

    const scrollInterval = setInterval(() => {
      const maxScroll = carousel.scrollWidth - carousel.clientWidth
      
      if (carousel.scrollLeft >= maxScroll) {
        carousel.scrollTo({ left: 0, behavior: 'smooth' })
      } else {
        carousel.scrollBy({ left: carousel.clientWidth, behavior: 'smooth' })
      }
    }, 5000) // Auto scroll každých 5 sekund

    return () => clearInterval(scrollInterval)
  }, [])

  return (
    <>
      <Navbar />
      <main>
        {/* Hero Section */}
        <section className="relative min-h-[60vh] flex items-center justify-center overflow-hidden">
          {/* Background Image with Overlay */}
          <div className="absolute inset-0">
            {/* Desktop Image */}
            <div 
              className="hidden sm:block absolute inset-0 bg-cover bg-center bg-no-repeat"
              style={{ backgroundImage: 'url(/hero_section_alternative_2.jpg)' }}
            />
            {/* Mobile Image */}
            <div 
              className="block sm:hidden absolute inset-0 bg-cover bg-center bg-no-repeat"
              style={{ backgroundImage: 'url(/hero_section_new_mobile.JPG)' }}
            />
            <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/50 to-black/60"></div>
          </div>
          
          {/* Content */}
          <div className="container relative z-10 text-center">
            <div className="max-w-3xl mx-auto space-y-8 animate-fade-in">
              {/* Logo */}
              <div className="mb-6">
                <Image
                  src="/logo_wide_white.png"
                  alt="Monlii"
                  width={300}
                  height={100}
                  className="mx-auto opacity-95"
                  priority
                />
              </div>
              
              {/* Heading */}
              <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-light text-white tracking-wide leading-tight uppercase text-center whitespace-nowrap">
                Jedinečné spodní prádlo
              </h1>
              
              {/* Divider */}
              <div className="flex items-center justify-center gap-3 py-2">
                <div className="w-12 h-px bg-white/40"></div>
                <div className="w-2 h-2 rounded-full bg-white/60"></div>
                <div className="w-12 h-px bg-white/40"></div>
              </div>
              
              {/* Subtitle */}
              <p className="text-lg md:text-xl text-white/90 font-light leading-relaxed max-w-2xl mx-auto">
                S příběhem a českou tradicí
              </p>
              
              {/* CTA Button */}
              <div className="pt-4">
                <Link href="/obchod">
                  <Button 
                    size="lg" 
                    className="bg-white/95 hover:bg-white text-[#931e31] px-10 py-7 text-base rounded-full font-medium transition-all duration-300 hover:scale-105 shadow-2xl hover:shadow-white/20"
                  >
                    Prohlédnout kolekci
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Naše hodnoty */}
        <section className="py-16 bg-gradient-to-b from-white via-pink-50/10 to-white">
          <div className="container">
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 tracking-tight animate-fade-in uppercase">Naše hodnoty</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
              <div className="text-center group hover-lift animate-fade-in bg-gray-50/80 rounded-2xl p-6 transition-all duration-500 hover:bg-white hover:shadow-xl">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-[#931e31] to-[#b8263d] text-white mb-4 transition-all duration-500 group-hover:scale-110 group-hover:rotate-6 shadow-lg group-hover:shadow-xl">
                  <Heart className="h-8 w-8" />
                </div>
                <h3 className="text-lg font-bold mb-3 tracking-tight">Ruční výroba</h3>
                <p className="text-sm text-gray-600 leading-relaxed">
                  Každý kousek je vyroben ručně s láskou a péčí o detail. 
                  Žádná masová výroba, pouze kvalitní řemeslná práce.
                </p>
              </div>
              <div className="text-center group hover-lift animate-fade-in bg-gray-50/80 rounded-2xl p-6 transition-all duration-500 hover:bg-white hover:shadow-xl" style={{animationDelay: '0.1s'}}>
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-[#931e31] to-[#b8263d] text-white mb-4 transition-all duration-500 group-hover:scale-110 group-hover:rotate-6 shadow-lg group-hover:shadow-xl">
                  <Shield className="h-8 w-8" />
                </div>
                <h3 className="text-lg font-bold mb-3 tracking-tight">Česká tradice</h3>
                <p className="text-sm text-gray-600 leading-relaxed">
                  Navazujeme na českou švadlenskou tradici a podporujeme 
                  lokální výrobu. Každý produkt vzniká v České republice.
                </p>
              </div>
              <div className="text-center group hover-lift animate-fade-in bg-gray-50/80 rounded-2xl p-6 transition-all duration-500 hover:bg-white hover:shadow-xl" style={{animationDelay: '0.2s'}}>
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-[#931e31] to-[#b8263d] text-white mb-4 transition-all duration-500 group-hover:scale-110 group-hover:rotate-6 shadow-lg group-hover:shadow-xl">
                  <Package className="h-8 w-8" />
                </div>
                <h3 className="text-lg font-bold mb-3 tracking-tight">Jedinečnost</h3>
                <p className="text-sm text-gray-600 leading-relaxed">
                  Každý kousek je originál. Díky ruční výrobě je každé 
                  prádlo trochu jiné a má své vlastní kouzlo.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* About Section */}
        <section className="py-16 bg-white">
          <div className="container max-w-5xl">
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 tracking-tight uppercase animate-fade-in">Náš příběh</h2>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              {/* Image */}
              <div className="relative aspect-[4/3] rounded-3xl overflow-hidden soft-shadow-lg animate-fade-in">
                <Image
                  src="/about_us.jpg"
                  alt="Tým Monlii"
                  fill
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 50vw"
                />
              </div>

              {/* Text */}
              <div className="space-y-6 animate-fade-in">
                <p className="text-lg text-gray-600 leading-relaxed">
                  Monlii je rodinná značka, která vám přináší jedinečné spodní prádlo šité s láskou a péčí. 
                  Každý kousek vzniká v rukách zkušené švadleny a nese s sebou kousek české tradice.
                </p>
                <p className="text-lg text-gray-600 leading-relaxed">
                  Věříme, že spodní prádlo by mělo být nejen krásné, ale především pohodlné. 
                  Proto dbáme na kvalitu materiálů a precizní zpracování každého detailu.
                </p>
                <Link href="/o-nas">
                  <Button variant="outline" size="lg" className="border-0 bg-white hover:bg-[#931e31] hover:text-white transition-all duration-300 rounded-full px-8 py-6 text-lg shadow-md hover:shadow-lg">
                    Více o nás
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Buttons - Produkty & Předplatné */}
        <section className="py-16 bg-gradient-to-b from-white via-pink-50/10 to-white">
          <div className="container max-w-4xl">
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-4 tracking-tight uppercase">Co hledáte?</h2>
            <p className="text-center text-gray-600 mb-12 max-w-2xl mx-auto">
              Vyberte si, co vás zajímá nejvíce
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Produkty Button */}
              <Link href="/obchod" className="group">
                <div className="bg-white rounded-3xl p-10 text-center transition-all duration-500 hover:shadow-2xl hover:-translate-y-2 soft-shadow cursor-pointer">
                  <div className="inline-flex items-center justify-center w-32 h-32 mb-6 transition-all duration-500 group-hover:scale-110">
                    <Image
                      src="/products.png"
                      alt="Produkty"
                      width={128}
                      height={128}
                      className="object-contain"
                    />
                  </div>
                  <h3 className="text-2xl font-bold mb-3 tracking-tight">Produkty</h3>
                  <p className="text-gray-600 leading-relaxed">
                    Prohlédněte si naši kompletní kolekci ručně vyráběného prádla
                  </p>
                </div>
              </Link>

              {/* Předplatné Button */}
              <Link href="/predplatne" className="group">
                <div className="bg-white rounded-3xl p-10 text-center transition-all duration-500 hover:shadow-2xl hover:-translate-y-2 soft-shadow cursor-pointer">
                  <div className="inline-flex items-center justify-center w-32 h-32 mb-6 transition-all duration-500 group-hover:scale-110">
                    <Image
                      src="/subscription.png"
                      alt="Předplatné"
                      width={128}
                      height={128}
                      className="object-contain"
                    />
                  </div>
                  <h3 className="text-2xl font-bold mb-3 tracking-tight">Předplatné</h3>
                  <p className="text-gray-600 leading-relaxed">
                    Objevte výhody pravidelného dodání oblíbeného prádla
                  </p>
                </div>
              </Link>
            </div>
          </div>
        </section>

        {/* Storytelling - Příběhy našich zákaznic */}
        <section className="py-16 bg-white overflow-hidden">
          <div className="container max-w-4xl">
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-3 tracking-tight uppercase">Příběhy našich zákaznic</h2>
            <p className="text-center text-gray-600 mb-12 max-w-2xl mx-auto">
              Seznamte se s ženami, které nosí Monlii a jejich příběhy proč si zamilovaly naše prádlo
            </p>

            {/* Carousel */}
            <div className="relative">
              {/* Left Arrow */}
              <button 
                onClick={() => {
                  const container = document.getElementById('stories-carousel');
                  if (container) container.scrollBy({ left: -container.offsetWidth, behavior: 'smooth' });
                }}
                className="hidden md:flex absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 z-10 w-12 h-12 items-center justify-center rounded-full bg-white shadow-lg hover:bg-[#931e31] hover:text-white transition-all duration-300"
                aria-label="Předchozí příběh"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>

              {/* Right Arrow */}
              <button 
                onClick={() => {
                  const container = document.getElementById('stories-carousel');
                  if (container) container.scrollBy({ left: container.offsetWidth, behavior: 'smooth' });
                }}
                className="hidden md:flex absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 z-10 w-12 h-12 items-center justify-center rounded-full bg-white shadow-lg hover:bg-[#931e31] hover:text-white transition-all duration-300"
                aria-label="Další příběh"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>

              <div id="stories-carousel" className="flex gap-6 overflow-x-auto snap-x snap-mandatory scrollbar-hide pb-8" style={{scrollbarWidth: 'none', msOverflowStyle: 'none'}}>
                {/* Story 1 */}
                <div className="flex-shrink-0 w-full snap-center">
                  <div className="bg-gray-50/80 rounded-2xl p-6 h-full flex flex-col md:flex-row gap-6 items-center soft-shadow hover:shadow-lg transition-shadow">
                    <div className="relative w-full md:w-48 h-56 rounded-2xl overflow-hidden flex-shrink-0">
                      <Image
                        src="/story_1.jpg"
                        alt="Agáta"
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="flex-1 space-y-2">
                      <h3 className="text-xl font-bold text-[#931e31]">Agáta</h3>
                      <p className="text-sm text-gray-600 leading-relaxed">
                        "Mám trochu větší velikost, takže vždycky oceňuju, když prádlo opravdu sedí a drží tam, kde má. Když jsem poprvé vyzkoušela Monlli, byla jsem nadšená — pohodlné, krásné a v originálních vzorech, které v běžných obchodech nenajdu. A protože jsme si s holkama hned lidsky sedly a prádlo mě fakt baví, domluvily jsme se, že se stanu tváří Monlli. Tohle je prostě styl, ve kterém se cítím sama sebou."
                      </p>
                    </div>
                  </div>
                </div>

                {/* Story 2 */}
                <div className="flex-shrink-0 w-full snap-center">
                  <div className="bg-gray-50/80 rounded-2xl p-6 h-full flex flex-col md:flex-row gap-6 items-center soft-shadow hover:shadow-lg transition-shadow">
                    <div className="relative w-full md:w-48 h-56 rounded-2xl overflow-hidden flex-shrink-0">
                      <Image
                        src="/story_2.jpg"
                        alt="Terez"
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="flex-1 space-y-2">
                      <h3 className="text-xl font-bold text-[#931e31]">Terez</h3>
                      <p className="text-sm text-gray-600 leading-relaxed">
                        "Jsem profesionální modelka a už jsem fotila opravdu všechno. Ale když jsem poprvé fotila pro Monlli, překvapilo mě, jak jiný ten zážitek byl. Přístup holek, atmosféra i samotné prádlo… všechno působilo osobně, lidsky a hlavně pohodlně. Upřímně mě překvapilo, jak krásně mi prádlo sedlo a že je příjemné i na běžné nošení, nejen na focení. Od té doby už nejsem jen modelka na fotkách — jsem i jejich stálá zákaznice a faninka. Monlli fotím i nosím s radostí."
                      </p>
                    </div>
                  </div>
                </div>

                {/* Story 3 */}
                <div className="flex-shrink-0 w-full snap-center">
                  <div className="bg-gray-50/80 rounded-2xl p-6 h-full flex flex-col md:flex-row gap-6 items-center soft-shadow hover:shadow-lg transition-shadow">
                    <div className="relative w-full md:w-48 h-56 rounded-2xl overflow-hidden flex-shrink-0">
                      <Image
                        src="/story_3_new.jpg"
                        alt="Natka"
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="flex-1 space-y-2">
                      <h3 className="text-xl font-bold text-[#931e31]">Natka</h3>
                      <p className="text-sm text-gray-600 leading-relaxed">
                        "Jsem drobnější postavy, ale mám větší velikost prsou — což je kombinace, se kterou jsem skoro nikdy nenašla set, který by mi seděl tak, jak jsem si přála. Buď mi neseděla podprsenka, nebo kalhotky. Když jsem u Monlli dostala možnost nechat si prádlo ušít přesně na míru, poprvé v životě jsem měla pocit, že se myslí i na ženy jako jsem já. A výsledek? Nejvíc pohodlný kousek, jaký jsem kdy nosila. Byla jsem tak nadšená, že jsem hned věděla, že chci být součástí toho, aby značka rostla a dostala se k dalším ženám. A tak dnes s radostí ukazuju dál, že prádlo může být krásné, originální a hlavně — opravdu sedět."
                      </p>
                    </div>
                  </div>
                </div>

                {/* Story 4 */}
                <div className="flex-shrink-0 w-full snap-center">
                  <div className="bg-gray-50/80 rounded-2xl p-6 h-full flex flex-col md:flex-row gap-6 items-center soft-shadow hover:shadow-lg transition-shadow">
                    <div className="relative w-full md:w-48 h-56 rounded-2xl overflow-hidden flex-shrink-0">
                      <Image
                        src="/story_4.jpg"
                        alt="Lucka"
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="flex-1 space-y-2">
                      <h3 className="text-xl font-bold text-[#931e31]">Lucka</h3>
                      <p className="text-sm text-gray-600 leading-relaxed">
                        "I když jsem zakladatelka Monlli, dlouhou dobu jsem byla přesně ten typ ženy, která prádlo neřeší. Brala jsem ho jako něco, co má prostě fungovat — nic víc. Až když mamka začala šít, otevřel se mi úplně nový svět. Poprvé jsem pochopila, že prádlo není jen věc v šuplíku, ale malý rituál ženskosti. Začala jsem si vybírat vzory podle nálady, barev, dne… a zjistila jsem, jak moc mě to baví. Dnes si s prádlem doslova hraju — jednou chci být jemná, jindy odvážná, někdy romantická a některé dny prostě jen pohodlná. A právě díky tomu vím, že každá žena může mít kousek, který mluví za ni, ještě dřív než cokoliv řekne."
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Scroll indicator */}
              <div className="flex justify-center gap-2 mt-4">
                <div className="w-2 h-2 rounded-full bg-[#931e31]/30"></div>
                <div className="w-2 h-2 rounded-full bg-[#931e31]/30"></div>
                <div className="w-2 h-2 rounded-full bg-[#931e31]/30"></div>
                <div className="w-2 h-2 rounded-full bg-[#931e31]/30"></div>
              </div>
            </div>
          </div>
        </section>

        {/* Náš Instagram */}
        <section className="py-16 bg-gradient-to-b from-white via-pink-50/10 to-white">
          <div className="container max-w-6xl">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight uppercase">Náš Instagram</h2>
              <p className="text-gray-600 mb-6 max-w-2xl mx-auto text-lg">
                Sledujte nás na Instagramu pro nejnovější kolekce a inspiraci
              </p>
              <a 
                href="https://www.instagram.com/monlii_i/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-[#931e31] hover:text-[#b8263d] font-semibold transition-colors"
              >
                <Instagram className="h-5 w-5" />
                @monlii_i
              </a>
            </div>

            {/* Instagram Feed Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {/* Instagram Post 1 */}
              <a 
                href="https://www.instagram.com/monlii_i/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="relative aspect-square rounded-2xl overflow-hidden soft-shadow group cursor-pointer"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-pink-500/20 to-purple-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                  <Instagram className="h-12 w-12 text-white" />
                </div>
                <div className="w-full h-full bg-gradient-to-br from-pink-100 to-purple-100 flex items-center justify-center">
                  <Instagram className="h-16 w-16 text-[#931e31]/20" />
                </div>
              </a>

              {/* Instagram Post 2 */}
              <a 
                href="https://www.instagram.com/monlii_i/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="relative aspect-square rounded-2xl overflow-hidden soft-shadow group cursor-pointer"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-pink-500/20 to-purple-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                  <Instagram className="h-12 w-12 text-white" />
                </div>
                <div className="w-full h-full bg-gradient-to-br from-purple-100 to-pink-100 flex items-center justify-center">
                  <Instagram className="h-16 w-16 text-[#931e31]/20" />
                </div>
              </a>

              {/* Instagram Post 3 */}
              <a 
                href="https://www.instagram.com/monlii_i/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="relative aspect-square rounded-2xl overflow-hidden soft-shadow group cursor-pointer"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-pink-500/20 to-purple-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                  <Instagram className="h-12 w-12 text-white" />
                </div>
                <div className="w-full h-full bg-gradient-to-br from-pink-100 to-purple-100 flex items-center justify-center">
                  <Instagram className="h-16 w-16 text-[#931e31]/20" />
                </div>
              </a>

              {/* Instagram Post 4 */}
              <a 
                href="https://www.instagram.com/monlii_i/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="relative aspect-square rounded-2xl overflow-hidden soft-shadow group cursor-pointer"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-pink-500/20 to-purple-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                  <Instagram className="h-12 w-12 text-white" />
                </div>
                <div className="w-full h-full bg-gradient-to-br from-purple-100 to-pink-100 flex items-center justify-center">
                  <Instagram className="h-16 w-16 text-[#931e31]/20" />
                </div>
              </a>

              {/* Instagram Post 5 - Hidden on mobile */}
              <a 
                href="https://www.instagram.com/monlii_i/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="hidden md:block relative aspect-square rounded-2xl overflow-hidden soft-shadow group cursor-pointer"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-pink-500/20 to-purple-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                  <Instagram className="h-12 w-12 text-white" />
                </div>
                <div className="w-full h-full bg-gradient-to-br from-pink-100 to-purple-100 flex items-center justify-center">
                  <Instagram className="h-16 w-16 text-[#931e31]/20" />
                </div>
              </a>

              {/* Instagram Post 6 - Hidden on mobile */}
              <a 
                href="https://www.instagram.com/monlii_i/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="hidden md:block relative aspect-square rounded-2xl overflow-hidden soft-shadow group cursor-pointer"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-pink-500/20 to-purple-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                  <Instagram className="h-12 w-12 text-white" />
                </div>
                <div className="w-full h-full bg-gradient-to-br from-purple-100 to-pink-100 flex items-center justify-center">
                  <Instagram className="h-16 w-16 text-[#931e31]/20" />
                </div>
              </a>

              {/* Instagram Post 7 - Hidden on mobile and tablet */}
              <a 
                href="https://www.instagram.com/monlii_i/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="hidden lg:block relative aspect-square rounded-2xl overflow-hidden soft-shadow group cursor-pointer"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-pink-500/20 to-purple-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                  <Instagram className="h-12 w-12 text-white" />
                </div>
                <div className="w-full h-full bg-gradient-to-br from-pink-100 to-purple-100 flex items-center justify-center">
                  <Instagram className="h-16 w-16 text-[#931e31]/20" />
                </div>
              </a>

              {/* Instagram Post 8 - Hidden on mobile and tablet */}
              <a 
                href="https://www.instagram.com/monlii_i/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="hidden lg:block relative aspect-square rounded-2xl overflow-hidden soft-shadow group cursor-pointer"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-pink-500/20 to-purple-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                  <Instagram className="h-12 w-12 text-white" />
                </div>
                <div className="w-full h-full bg-gradient-to-br from-purple-100 to-pink-100 flex items-center justify-center">
                  <Instagram className="h-16 w-16 text-[#931e31]/20" />
                </div>
              </a>
            </div>

            {/* CTA Button */}
            <div className="text-center mt-12">
              <a 
                href="https://www.instagram.com/monlii_i/" 
                target="_blank" 
                rel="noopener noreferrer"
              >
                <Button className="bg-gradient-to-r from-[#931e31] to-[#b8263d] hover:from-[#6b1623] hover:to-[#931e31] text-white px-8 py-6 rounded-full font-semibold text-lg transition-all duration-300 hover:scale-105 shadow-md hover:shadow-lg">
                  <Instagram className="mr-2 h-5 w-5" />
                  Sledovat na Instagramu
                </Button>
              </a>
            </div>
          </div>
        </section>

        {/* Reviews Section */}
        <section className="py-16 bg-gradient-to-b from-white via-pink-50/10 to-white overflow-hidden">
          <div className="container max-w-7xl">
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-4 tracking-tight uppercase">Co o nás říkají</h2>
            <p className="text-center text-gray-600 mb-16 max-w-2xl mx-auto">
              Přečtěte si, co říkají naše zákaznice o našem prádle
            </p>

            <div 
              ref={reviewsCarouselRef}
              className="flex gap-6 overflow-x-auto snap-x snap-mandatory scrollbar-hide pb-8 scroll-smooth" 
              style={{scrollbarWidth: 'none', msOverflowStyle: 'none'}}
            >
              {/* Review 1 - Ester */}
              <div className="flex-shrink-0 w-full md:w-[calc(33.333%-16px)] snap-start">
                <div className="bg-white rounded-2xl p-8 soft-shadow hover:soft-shadow-lg transition-all h-full flex flex-col">
                  <div className="flex mb-4">
                    {[...Array(5)].map((_, i) => (
                      <svg key={i} className="w-5 h-5 text-[#931e31] fill-current" viewBox="0 0 20 20">
                        <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z"/>
                      </svg>
                    ))}
                  </div>
                  <p className="text-gray-600 mb-6 leading-relaxed italic flex-1">
                    "S prádlem jsem velmi spokojená, prádlo je pohodlné, nikde nic neškrtí ani neškrábe. Materiál je na těle příjemný. A navíc prádlo na mě vypadá opravdu skvěle!"
                  </p>
                  <div className="flex items-center">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#931e31] to-[#b8263d] flex items-center justify-center text-white font-bold mr-3">
                      E
                    </div>
                    <div>
                      <p className="font-bold">Ester</p>
                      <p className="text-sm text-gray-500">Set Dark</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Review 2 - Terez */}
              <div className="flex-shrink-0 w-full md:w-[calc(33.333%-16px)] snap-start">
                <div className="bg-white rounded-2xl p-8 soft-shadow hover:soft-shadow-lg transition-all h-full flex flex-col">
                  <div className="flex mb-4">
                    {[...Array(5)].map((_, i) => (
                      <svg key={i} className="w-5 h-5 text-[#931e31] fill-current" viewBox="0 0 20 20">
                        <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z"/>
                      </svg>
                    ))}
                  </div>
                  <p className="text-gray-600 mb-6 leading-relaxed italic flex-1">
                    "Před nějakým časem jsem měla možnost vyzkoušet vaše prádlo na míru musím říct že jsem velice mile překvapena prádlo úžasně sedí a každý design je opravdu krásný jde vidět že na tom pracuji dvě vkusné ženy a musím podotknout že prádlo je velmi praktické díky jeho pohodlnosti takže je vhodné na běžné celodenní nošení kamkoliv."
                  </p>
                  <div className="flex items-center">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#931e31] to-[#b8263d] flex items-center justify-center text-white font-bold mr-3">
                      T
                    </div>
                    <div>
                      <p className="font-bold">Terez</p>
                      <p className="text-sm text-gray-500">Set Pink Lady</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Review 3 - Viki */}
              <div className="flex-shrink-0 w-full md:w-[calc(33.333%-16px)] snap-start">
                <div className="bg-white rounded-2xl p-8 soft-shadow hover:soft-shadow-lg transition-all h-full flex flex-col">
                  <div className="flex mb-4">
                    {[...Array(5)].map((_, i) => (
                      <svg key={i} className="w-5 h-5 text-[#931e31] fill-current" viewBox="0 0 20 20">
                        <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z"/>
                      </svg>
                    ))}
                  </div>
                  <p className="text-gray-600 mb-6 leading-relaxed italic flex-1">
                    "Prádlo úžasně sedí a každý design je opravdu krásný jde vidět že na tom pracuji dvě vkusné ženy a musím podotknout že prádlo je velmi praktické díky jeho pohodlnosti takže je vhodné na běžné celodenní nošení kamkoliv děkuji za tuhle možnost a určitě doufám že se vám bude i nadále dařit vytvářet tak kouzelné kousky."
                  </p>
                  <div className="flex items-center">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#931e31] to-[#b8263d] flex items-center justify-center text-white font-bold mr-3">
                      V
                    </div>
                    <div>
                      <p className="font-bold">Viki</p>
                      <p className="text-sm text-gray-500">Krajkový set s classic podvazky</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Review 4 - Jana */}
              <div className="flex-shrink-0 w-full md:w-[calc(33.333%-16px)] snap-start">
                <div className="bg-white rounded-2xl p-8 soft-shadow hover:soft-shadow-lg transition-all h-full flex flex-col">
                  <div className="flex mb-4">
                    {[...Array(5)].map((_, i) => (
                      <svg key={i} className="w-5 h-5 text-[#931e31] fill-current" viewBox="0 0 20 20">
                        <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z"/>
                      </svg>
                    ))}
                  </div>
                  <p className="text-gray-600 mb-6 leading-relaxed italic flex-1">
                    "Neskutečně mě překvapila rychlost dodání, kvalita a cena daného prádla. Úžasně sedí, elastické, nikde neškrábe a netahá. A vzhledem k tomu, že je použitá krajka, tak hřeje a nosím jej v zimě. Objednala jsem si další soupravu a už se nemůžu dočkat."
                  </p>
                  <div className="flex items-center">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#931e31] to-[#b8263d] flex items-center justify-center text-white font-bold mr-3">
                      J
                    </div>
                    <div>
                      <p className="font-bold">Jana</p>
                      <p className="text-sm text-gray-500">Bezešvé kalhotky a podprsenka</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Review 5 - Alena */}
              <div className="flex-shrink-0 w-full md:w-[calc(33.333%-16px)] snap-start">
                <div className="bg-white rounded-2xl p-8 soft-shadow hover:soft-shadow-lg transition-all h-full flex flex-col">
                  <div className="flex mb-4">
                    {[...Array(5)].map((_, i) => (
                      <svg key={i} className="w-5 h-5 text-[#931e31] fill-current" viewBox="0 0 20 20">
                        <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z"/>
                      </svg>
                    ))}
                  </div>
                  <p className="text-gray-600 mb-6 leading-relaxed italic flex-1">
                    "Děkuji za krásné kalhotky a podprsenku! Oba kousky jsou kvalitně zpracované, budou příjemné na nošení především oceňuji vaši rychlost a příjemnou a vstřícnou komunikaci."
                  </p>
                  <div className="flex items-center">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#931e31] to-[#b8263d] flex items-center justify-center text-white font-bold mr-3">
                      A
                    </div>
                    <div>
                      <p className="font-bold">Alena</p>
                      <p className="text-sm text-gray-500">Set Smaragd</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Review 6 - Jana */}
              <div className="flex-shrink-0 w-full md:w-[calc(33.333%-16px)] snap-start">
                <div className="bg-white rounded-2xl p-8 soft-shadow hover:soft-shadow-lg transition-all h-full flex flex-col">
                  <div className="flex mb-4">
                    {[...Array(5)].map((_, i) => (
                      <svg key={i} className="w-5 h-5 text-[#931e31] fill-current" viewBox="0 0 20 20">
                        <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z"/>
                      </svg>
                    ))}
                  </div>
                  <p className="text-gray-600 mb-6 leading-relaxed italic flex-1">
                    "Moc děkuju za hezký komplet na to, že vůbec nevíte, na jakého člověka šijete, tak smekám klobouk každá máme jinou postavu a vy si s tím poradíte."
                  </p>
                  <div className="flex items-center">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#931e31] to-[#b8263d] flex items-center justify-center text-white font-bold mr-3">
                      J
                    </div>
                    <div>
                      <p className="font-bold">Jana</p>
                      <p className="text-sm text-gray-500">Černý krajkový set</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Review 7 - Ester */}
              <div className="flex-shrink-0 w-full md:w-[calc(33.333%-16px)] snap-start">
                <div className="bg-white rounded-2xl p-8 soft-shadow hover:soft-shadow-lg transition-all h-full flex flex-col">
                  <div className="flex mb-4">
                    {[...Array(5)].map((_, i) => (
                      <svg key={i} className="w-5 h-5 text-[#931e31] fill-current" viewBox="0 0 20 20">
                        <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z"/>
                      </svg>
                    ))}
                  </div>
                  <p className="text-gray-600 mb-6 leading-relaxed italic flex-1">
                    "Moooc děkuji za prádlo, které jste mi ušily na míru. Je strašně moc pohodlné a nikdy mi tak nesedělo žádné prádlo. Těším se až budeme mít další nové kousky jen tak dále."
                  </p>
                  <div className="flex items-center">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#931e31] to-[#b8263d] flex items-center justify-center text-white font-bold mr-3">
                      E
                    </div>
                    <div>
                      <p className="font-bold">Ester</p>
                      <p className="text-sm text-gray-500">Valentýnský set limitka</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Scroll indicators */}
            <div className="flex justify-center gap-2 mt-8">
              {[...Array(7)].map((_, i) => (
                <div key={i} className="w-2 h-2 rounded-full bg-[#931e31]/30"></div>
              ))}
            </div>
          </div>
        </section>

        {/* Instagram Feed Section */}
        <section className="py-24 bg-gradient-to-b from-white to-pink-50/20 relative overflow-hidden">
          {/* Dekorativní pozadí */}
          <div className="absolute inset-0">
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-br from-pink-200/10 via-purple-200/10 to-rose-200/10 rounded-full blur-3xl animate-pulse"></div>
          </div>
          
          <div className="container relative z-10">
            <div className="text-center mb-12 animate-fade-in">
              <div className="inline-flex items-center justify-center mb-4">
                <div className="w-16 h-16 rounded-full bg-gradient-to-r from-[#931e31] to-[#b8263d] flex items-center justify-center">
                  <Instagram className="h-8 w-8 text-white" />
                </div>
              </div>
              <h2 className="text-4xl md:text-5xl font-bold mb-4 tracking-tight bg-gradient-to-r from-gray-900 via-[#931e31] to-gray-900 bg-clip-text text-transparent">
                Sledujte nás na Instagramu
              </h2>
              <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
                Inspirujte se našimi nejnovějšími kolekcemi a příběhy spokojených zákaznic
              </p>
              <a 
                href="https://www.instagram.com/monlii_i/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-block"
              >
                <Button 
                  size="lg" 
                  className="bg-gradient-to-r from-[#931e31] to-[#b8263d] hover:from-[#6b1623] hover:to-[#931e31] text-white px-8 py-6 rounded-full font-semibold transition-all duration-300 hover:scale-105 shadow-lg"
                >
                  <Instagram className="h-5 w-5 mr-2" />
                  @monlii_i
                  <ArrowRight className="h-5 w-5 ml-2" />
                </Button>
              </a>
            </div>

            {/* Instagram Embed Container */}
            <div className="max-w-6xl mx-auto">
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {/* Placeholder pro Instagram příspěvky - nahradí se dynamickým feedem */}
                {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                  <div key={i} className="aspect-square bg-gradient-to-br from-pink-100/50 to-purple-100/50 rounded-2xl overflow-hidden group cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-xl relative">
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="text-center p-6">
                        <Instagram className="h-12 w-12 text-[#931e31]/30 mx-auto mb-3" />
                        <p className="text-xs text-gray-500">Instagram post #{i}</p>
                      </div>
                    </div>
                    {/* Overlay on hover */}
                    <div className="absolute inset-0 bg-gradient-to-t from-[#931e31]/90 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
                      <p className="text-white text-sm font-medium">Zobrazit na Instagramu</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Info text */}
              <div className="mt-12 text-center">
                <p className="text-gray-600 text-sm max-w-2xl mx-auto">
                  💡 <strong>Pro administrátory:</strong> Instagram feed lze nahradit živým feedem pomocí Instagram API nebo embed widgetu. 
                  Aktuálně jsou zde placeholdery - můžete je nahradit ručně přidanými obrázky nebo dynamickým feedem.
                </p>
              </div>
            </div>
          </div>
        </section>

      </main>
      <Footer />
    </>
  )
}
