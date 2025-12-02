import { Navbar } from '@/components/navbar'
import { Footer } from '@/components/footer'
import { Heart, Scissors, Sparkles, ArrowRight } from 'lucide-react'
import Image from 'next/image'

export default function AboutPage() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-white">
        {/* Hero Section */}
        <section className="relative py-20 overflow-hidden">
          {/* Background Image */}
          <div className="absolute inset-0">
            {/* Desktop Image */}
            <div 
              className="hidden md:block absolute inset-0 bg-cover bg-bottom bg-no-repeat"
              style={{ backgroundImage: 'url(/hero_section_new.png)' }}
            />
            {/* Mobile Image */}
            <div 
              className="block md:hidden absolute inset-0 bg-cover bg-center bg-no-repeat"
              style={{ backgroundImage: 'url(/hero_section_new_mobile.JPG)' }}
            />
            <div className="absolute inset-0 bg-black/40"></div>
          </div>
          
          <div className="container max-w-4xl text-center relative z-10">
            <h1 className="text-4xl md:text-6xl font-bold mb-4 tracking-tight uppercase text-white animate-fade-in">
              O nás
            </h1>
            <p className="text-lg md:text-xl text-white/90 leading-relaxed animate-fade-in" style={{animationDelay: '0.2s'}}>
              Poznejte příběh za značkou Monlii a naši rodinnou tradici
            </p>
          </div>
        </section>

        {/* Story */}
        <section className="py-24 bg-white relative overflow-hidden">
          {/* Dekorativní kruhy */}
          <div className="absolute top-20 right-10 w-72 h-72 bg-pink-200/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-20 left-10 w-96 h-96 bg-purple-200/10 rounded-full blur-3xl animate-pulse" style={{animationDelay: '1s'}}></div>
          
          <div className="container max-w-4xl relative z-10">
            <div className="animate-fade-in">
              <div className="space-y-8 text-lg text-gray-700 leading-relaxed">
                <p className="text-2xl font-semibold text-gray-900 hover-lift transition-all duration-300">
                  Monlli není jen značka spodního prádla. Je to náš rodinný projekt, který začal dávno předtím, 
                  než vznikl samotný e-shop. Začal u mamky. U jejího snu, který si nosila v hlavě celé roky, 
                  ale nikdy si na něj nenašla prostor. Vždycky tu byl někdo, o koho se starala víc než o sebe — 
                  my dvě, práce, domácnost… život.
                </p>
                <p className="animate-fade-in" style={{animationDelay: '0.2s'}}>
                  A pak jednoho dne přišel moment, kdy jsme si jako tři holky sedly ke stolu a řekly si:
                  <span className="block mt-4 italic text-[#931e31] font-medium text-xl bg-pink-50/50 rounded-2xl p-6 border-l-4 border-[#931e31] shadow-sm hover:shadow-md transition-all duration-300">
                    „Proč vlastně ne? Proč nezkusit vytvořit něco vlastního, něco, co bude dávat smysl nám třem a bude nás bavit?"
                  </span>
                </p>
                <p className="font-bold text-gray-900 text-3xl text-center my-8 animate-fade-in bg-gradient-to-r from-[#931e31] to-[#b8263d] bg-clip-text text-transparent" style={{animationDelay: '0.4s'}}>
                  A tak vzniklo Monlli.
                </p>
                <p>
                  Název, který pro nás neznamená jen brand, ale připomínku toho, že když se spojíme, 
                  dokážeme vytvořit víc, než jsme si kdy myslely.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Why Lingerie */}
        <section className="py-24 bg-gradient-to-b from-pink-50/30 to-white relative overflow-hidden">
          {/* Dekorativní prvky */}
          <div className="absolute top-0 left-0 w-full h-full">
            <div className="absolute top-10 left-20 w-64 h-64 bg-gradient-to-br from-pink-300/10 to-purple-300/10 rounded-full blur-3xl"></div>
            <div className="absolute bottom-10 right-20 w-80 h-80 bg-gradient-to-br from-rose-300/10 to-pink-300/10 rounded-full blur-3xl"></div>
          </div>
          
          <div className="container max-w-4xl relative z-10">
            <div className="animate-fade-in">
              <h2 className="text-4xl md:text-5xl font-bold mb-12 tracking-tight bg-gradient-to-r from-gray-900 via-[#931e31] to-gray-900 bg-clip-text text-transparent">Proč vlastně prádlo?</h2>
              <div className="space-y-6 text-lg text-gray-700 leading-relaxed">
                <p className="text-xl font-medium text-gray-900">
                  Věříme, že každá žena si zaslouží cítit se krásně. Bez ohledu na věk, postavu, náladu nebo to, co čeká venku.
                </p>
                <p>
                  Chceme, aby se každá žena v Monlli prádle cítila sama sebou.
                </p>
                <div className="relative my-12 animate-fade-in" style={{animationDelay: '0.3s'}}>
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-pink-200/30 to-transparent"></div>
                  <p className="text-center text-2xl font-bold text-gray-900 py-8 relative z-10">
                    Ne dokonale…<br/>
                    <span className="text-[#931e31] text-3xl">Ale skutečně dobře.</span>
                  </p>
                </div>
                <p>
                  Proto vybíráme materiály, které nejsou jen hezké, ale i pohodlné. Proto si hrajeme s krajkou, 
                  detaily a střihem. Proto zkoušíme, ladíme, fotíme, předěláváme… protože každý kus musí mít duši.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Team Photo with Family Project */}
        <section className="py-24 bg-white">
          <div className="container max-w-6xl">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div className="relative aspect-[4/3] overflow-hidden rounded-3xl animate-fade-in soft-shadow-lg group">
                <div className="absolute inset-0 bg-gradient-to-t from-[#931e31]/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500 z-10"></div>
                <Image
                  src="/about_us.jpg"
                  alt="Tým Monlii - rodinná firma"
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                  sizes="(max-width: 1024px) 100vw, 50vw"
                />
              </div>
              <div className="animate-fade-in space-y-6" style={{animationDelay: '0.2s'}}>
                <div className="inline-block">
                  <h2 className="text-4xl md:text-5xl font-bold mb-6 tracking-tight bg-gradient-to-r from-[#931e31] to-[#b8263d] bg-clip-text text-transparent">Rodinný projekt s ženskou energií</h2>
                  <div className="h-1 w-24 bg-gradient-to-r from-[#931e31] to-[#b8263d] rounded-full"></div>
                </div>
                <div className="space-y-6 text-lg text-gray-700 leading-relaxed">
                  <p>
                    Pracujeme spolu. Dohadujeme se, smějeme se, zkoušíme prototypy, přemýšlíme, jak udělat Monlli 
                    nejen produktem, ale i pocitem.
                  </p>
                  <p>
                    A to je naše výhoda — jsme tři různé ženy. Každá jiná, každá někdy bojuje se sebevědomím, 
                    každá má svůj pohled.
                  </p>
                  <p className="font-medium text-gray-900">
                    A právě díky tomu tvoříme prádlo, které není jen pro „ideální postavy", ale pro reálné ženy. 
                    Pro ženy jako jsme my, jako jsi ty, jako je tvoje ségra nebo mamka.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Community */}
        <section className="py-24 bg-gradient-to-b from-white to-pink-50/20 relative overflow-hidden">
          {/* Animované pozadí */}
          <div className="absolute inset-0">
            <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-pink-200/20 to-purple-200/20 rounded-full blur-3xl animate-pulse"></div>
            <div className="absolute bottom-0 left-0 w-80 h-80 bg-gradient-to-br from-rose-200/20 to-pink-200/20 rounded-full blur-3xl animate-pulse" style={{animationDelay: '1.5s'}}></div>
          </div>
          
          <div className="container max-w-4xl relative z-10">
            <div className="animate-fade-in">
              <div className="text-center mb-12">
                <h2 className="text-4xl md:text-5xl font-bold tracking-tight bg-gradient-to-r from-gray-900 via-[#931e31] to-gray-900 bg-clip-text text-transparent inline-block">Komunita před produktem</h2>
                <div className="h-1 w-32 bg-gradient-to-r from-[#931e31] to-[#b8263d] rounded-full mx-auto mt-4"></div>
              </div>
              <div className="space-y-6 text-lg text-gray-700 leading-relaxed">
                <p className="text-xl font-medium text-gray-900">
                  Ano, prodáváme prádlo.<br/>
                  Ale to, co chceme budovat, je komunita žen, které se podporují, milují své tělo a nestydí se za to být ženské.
                </p>
                <p>
                  Proto u nás nenajdeš jen produkt. Najdeš příběhy. Inspiraci. Reálné ženy. A přístup bez filtrů. 
                  Náš svět je o přijetí, radosti, něze a síle, kterou v sobě má každá z nás.
                </p>
                <div className="bg-gradient-to-br from-white to-pink-50/30 rounded-3xl p-10 soft-shadow-xl mt-12 text-center animate-fade-in border border-pink-100 relative overflow-hidden group" style={{animationDelay: '0.3s'}}>
                  <div className="absolute inset-0 bg-gradient-to-r from-pink-200/0 via-pink-200/20 to-pink-200/0 transform -skew-x-12 translate-x-full group-hover:translate-x-[-100%] transition-transform duration-1000"></div>
                  <div className="relative z-10">
                    <div className="inline-block mb-4">
                      <Heart className="h-12 w-12 text-[#931e31] fill-[#931e31] animate-pulse" />
                    </div>
                    <p className="text-2xl font-bold text-gray-900 mb-4">
                      Tohle jsme my.
                    </p>
                    <p className="text-xl text-gray-700 mb-6">
                      Tři holky, jedna rodina a jeden společný sen.
                    </p>
                    <p className="text-3xl font-bold bg-gradient-to-r from-[#931e31] to-[#b8263d] bg-clip-text text-transparent">
                      A ty jsi teď jeho součástí. ❤️
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Values */}
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
                  <Scissors className="h-8 w-8" />
                </div>
                <h3 className="text-lg font-bold mb-3 tracking-tight">Česká tradice</h3>
                <p className="text-sm text-gray-600 leading-relaxed">
                  Navazujeme na českou švadlenskou tradici a podporujeme 
                  lokální výrobu. Každý produkt vzniká v České republice.
                </p>
              </div>
              <div className="text-center group hover-lift animate-fade-in bg-gray-50/80 rounded-2xl p-6 transition-all duration-500 hover:bg-white hover:shadow-xl" style={{animationDelay: '0.2s'}}>
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-[#931e31] to-[#b8263d] text-white mb-4 transition-all duration-500 group-hover:scale-110 group-hover:rotate-6 shadow-lg group-hover:shadow-xl">
                  <Sparkles className="h-8 w-8" />
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

        {/* CTA */}
        <section className="py-24 bg-gradient-to-b from-white via-pink-50/20 to-white relative overflow-hidden">
          {/* Dekorativní pozadí */}
          <div className="absolute inset-0">
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-br from-pink-200/20 via-purple-200/20 to-rose-200/20 rounded-full blur-3xl animate-pulse"></div>
          </div>
          
          <div className="container max-w-4xl text-center animate-fade-in relative z-10">
            <div className="inline-block mb-6">
              <Sparkles className="h-16 w-16 text-[#931e31] mx-auto mb-4 animate-pulse" />
            </div>
            <h2 className="text-4xl md:text-6xl font-bold mb-8 tracking-tight bg-gradient-to-r from-gray-900 via-[#931e31] to-gray-900 bg-clip-text text-transparent">
              Přidejte se k našemu příběhu
            </h2>
            <div className="h-1 w-32 bg-gradient-to-r from-[#931e31] to-[#b8263d] rounded-full mx-auto mb-8"></div>
            <p className="text-xl md:text-2xl text-gray-700 mb-12 leading-relaxed max-w-2xl mx-auto">
              Objevte krásné a pohodlné spodní prádlo, které šije zkušená švadlena. 
              Každý kousek je unikátní a podporuje rodinnou výrobu a české ruční řemeslo.
            </p>
            <a href="/obchod" className="inline-block group">
              <button className="bg-gradient-to-r from-[#931e31] to-[#b8263d] hover:from-[#6b1623] hover:to-[#931e31] text-white px-12 py-6 rounded-full font-bold text-xl transition-all duration-300 hover:scale-110 shadow-xl hover:shadow-2xl relative overflow-hidden">
                <span className="relative z-10 flex items-center gap-2">
                  Prohlédnout kolekci
                  <ArrowRight className="h-6 w-6 group-hover:translate-x-1 transition-transform" />
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 transform -skew-x-12 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
              </button>
            </a>
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}
