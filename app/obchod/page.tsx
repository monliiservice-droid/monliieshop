import { Navbar } from '@/components/navbar'
import { Footer } from '@/components/footer'
import { prisma } from '@/lib/prisma'
import { ProductsGrid } from '@/components/products-grid'
import { Metadata } from 'next'

// Force dynamic rendering - don't cache this page
export const dynamic = 'force-dynamic'
export const revalidate = 0

export const metadata: Metadata = {
  title: 'Obchod | Monlii - Ručně šité spodní prádlo',
  description: 'Prozkoumejte naši kolekci ručně šitého dámského prádla. Podprsenky, braletky, kalhotky a luxusní sety vyrobené s láskou v České republice.',
  keywords: ['obchod spodní prádlo', 'koupit podprsenku', 'luxusní prádlo eshop', 'české prádlo prodej', 'braletky prodej', 'dámské kalhotky'],
  openGraph: {
    title: 'Obchod | Monlii - Ručně šité spodní prádlo',
    description: 'Prozkoumejte naši kolekci ručně šitého dámského prádla. Podprsenky, braletky, kalhotky a luxusní sety vyrobené s láskou v České republice.',
    url: '/obchod',
    images: ['/story_4.jpg'],
  },
}

async function getProducts() {
  try {
    const products = await prisma.product.findMany({
      orderBy: [
        { sortOrder: 'asc' },
        { createdAt: 'desc' }
      ],
      select: {
        id: true,
        name: true,
        description: true,
        price: true,
        stock: true,
        images: true,
        category: true
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
            <ProductsGrid products={products} />
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}
