import { Navbar } from '@/components/navbar'
import { Footer } from '@/components/footer'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'
import { prisma } from '@/lib/prisma'

// Force dynamic rendering - don't cache this page
export const dynamic = 'force-dynamic'
export const revalidate = 0

async function getProducts() {
  try {
    const products = await prisma.product.findMany({
      orderBy: {
        createdAt: 'desc'
      }
    })
    return products
  } catch (error) {
    console.error('Error fetching products:', error)
    return []
  }
}

export default async function ShopPage() {
  const products = await getProducts()

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
              Naše produkty
            </h1>
            <p className="text-lg md:text-xl text-white/90 leading-relaxed animate-fade-in" style={{animationDelay: '0.2s'}}>
              Objevte naši kolekci ručně vyráběného prádla s láskou a péčí
            </p>
          </div>
        </section>

        <section className="py-20 bg-white">
          <div className="container">

            {products.length === 0 ? (
              <div className="text-center py-32 animate-fade-in">
                <p className="text-gray-600 text-xl">Zatím nemáme žádné produkty k zobrazení.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                {products.map((product, index) => {
                  const images = JSON.parse(product.images)
                  return (
                    <Card key={product.id} className="overflow-hidden border-0 bg-white transition-all duration-500 rounded-2xl group hover-lift animate-fade-in soft-shadow hover:soft-shadow-lg" style={{animationDelay: `${index * 0.05}s`}}>
                      <Link href={`/produkt/${product.id}`}>
                        <CardHeader className="p-0 cursor-pointer">
                          <div className="aspect-[3/4] bg-gray-100 relative overflow-hidden">
                            {images.length > 0 ? (
                              <img 
                                src={images[0]} 
                                alt={product.name}
                                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-gray-400 font-medium">
                                Bez obrázku
                              </div>
                            )}
                            {product.stock === 0 && (
                              <Badge className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm text-gray-700 rounded-full px-4 py-1.5 shadow-md">
                                Vyprodáno
                              </Badge>
                            )}
                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors"></div>
                          </div>
                        </CardHeader>
                      </Link>
                      <CardContent className="p-6 text-center">
                        <Link href={`/produkt/${product.id}`} className="hover:text-[#931e31] transition-colors">
                          <CardTitle className="text-2xl mb-3 font-bold tracking-tight">{product.name}</CardTitle>
                        </Link>
                        {product.description && (
                          <p className="text-sm text-gray-600 line-clamp-2 mb-3">
                            {product.description}
                          </p>
                        )}
                        <p className="text-xl font-bold text-[#931e31]">{product.price} Kč</p>
                      </CardContent>
                      <CardFooter className="p-6 pt-0">
                        <Link href={`/produkt/${product.id}`} className="w-full">
                          <Button className="w-full bg-gradient-to-r from-[#931e31] to-[#b8263d] hover:from-[#6b1623] hover:to-[#931e31] text-white rounded-full py-6 font-semibold transition-all duration-300 shadow-md hover:shadow-lg">
                            {product.stock === 0 ? 'Zobrazit detail' : 'Vybrat velikost'}
                          </Button>
                        </Link>
                      </CardFooter>
                    </Card>
                  )
                })}
              </div>
            )}
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}
