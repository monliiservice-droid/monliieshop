import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Package, ShoppingBag, TrendingUp, Users } from 'lucide-react'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'

async function getDashboardData() {
  try {
    const [productCount, orderCount, totalRevenue] = await Promise.all([
      prisma.product.count(),
      prisma.order.count(),
      prisma.order.aggregate({
        _sum: {
          totalAmount: true
        },
        where: {
          paymentStatus: 'paid'
        }
      })
    ])

    return {
      productCount,
      orderCount,
      totalRevenue: totalRevenue._sum.totalAmount || 0
    }
  } catch (error) {
    console.error('Error fetching dashboard data:', error)
    return {
      productCount: 0,
      orderCount: 0,
      totalRevenue: 0
    }
  }
}

export default async function AdminDashboard() {
  const data = await getDashboardData()

  const stats = [
    {
      title: 'Celkové produkty',
      value: data.productCount,
      icon: Package,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      href: '/admin/produkty'
    },
    {
      title: 'Objednávky',
      value: data.orderCount,
      icon: ShoppingBag,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      href: '/admin/objednavky'
    },
    {
      title: 'Tržby',
      value: `${data.totalRevenue.toLocaleString('cs-CZ')} Kč`,
      icon: TrendingUp,
      color: 'text-pink-600',
      bgColor: 'bg-pink-50',
      href: '/admin/trzby'
    },
  ]

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Dashboard</h1>
        <p className="text-gray-600">Přehled vašeho e-shopu</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {stats.map((stat) => (
          <Link key={stat.title} href={stat.href}>
            <Card className="cursor-pointer hover:shadow-lg transition-all duration-300 hover:scale-105 hover:border-[#931e31]">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">
                  {stat.title}
                </CardTitle>
                <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                  <stat.icon className={`h-5 w-5 ${stat.color}`} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Rychlé akce</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <a href="/admin/produkty/novy" className="block p-3 hover:bg-gray-50 rounded-lg border">
              <div className="font-medium">Přidat nový produkt</div>
              <div className="text-sm text-gray-600">Vytvořit nový produkt v obchodě</div>
            </a>
            <a href="/admin/objednavky" className="block p-3 hover:bg-gray-50 rounded-lg border">
              <div className="font-medium">Zobrazit objednávky</div>
              <div className="text-sm text-gray-600">Spravovat objednávky zákazníků</div>
            </a>
            <a href="/admin/nastaveni" className="block p-3 hover:bg-gray-50 rounded-lg border">
              <div className="font-medium">Nastavení</div>
              <div className="text-sm text-gray-600">Upravit platební a doručovací možnosti</div>
            </a>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Poslední aktivity</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600">Žádné nedávné aktivity</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
