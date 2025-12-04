import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Package, ShoppingBag, TrendingUp, Users } from 'lucide-react'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'

// Force dynamic rendering - don't cache this page
export const dynamic = 'force-dynamic'
export const revalidate = 0

async function getDashboardData() {
  try {
    const [productCount, orderCount, totalRevenue, recentOrders] = await Promise.all([
      prisma.product.count(),
      prisma.order.count(),
      prisma.order.aggregate({
        _sum: {
          totalAmount: true
        },
        where: {
          paymentStatus: 'paid'
        }
      }),
      prisma.order.findMany({
        take: 5,
        orderBy: {
          createdAt: 'desc'
        },
        select: {
          id: true,
          orderNumber: true,
          customerName: true,
          totalAmount: true,
          status: true,
          createdAt: true
        }
      })
    ])

    return {
      productCount,
      orderCount,
      totalRevenue: totalRevenue._sum.totalAmount || 0,
      recentOrders
    }
  } catch (error) {
    console.error('Error fetching dashboard data:', error)
    return {
      productCount: 0,
      orderCount: 0,
      totalRevenue: 0,
      recentOrders: []
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
            <a href="/admin/trzby" className="block p-3 hover:bg-gray-50 rounded-lg border">
              <div className="font-medium">Tržby</div>
              <div className="text-sm text-gray-600">Zobrazit statistiky a tržby</div>
            </a>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Nové objednávky</CardTitle>
          </CardHeader>
          <CardContent>
            {data.recentOrders.length === 0 ? (
              <p className="text-sm text-gray-600">Žádné objednávky</p>
            ) : (
              <div className="space-y-3">
                {data.recentOrders.map((order) => (
                  <Link key={order.id} href={`/admin/objednavky`}>
                    <div className="p-3 hover:bg-gray-50 rounded-lg border transition-colors cursor-pointer">
                      <div className="flex justify-between items-start mb-1">
                        <div className="font-medium">{order.orderNumber}</div>
                        <div className="text-sm font-semibold text-[#931e31]">{order.totalAmount.toLocaleString('cs-CZ')} Kč</div>
                      </div>
                      <div className="text-sm text-gray-600">{order.customerName}</div>
                      <div className="flex justify-between items-center mt-2">
                        <span className="text-xs px-2 py-1 rounded-full bg-blue-100 text-blue-700">
                          {order.status === 'new' && 'Nová'}
                          {order.status === 'accepted' && 'Přijato'}
                          {order.status === 'shipped' && 'Odesláno'}
                          {order.status === 'delivered' && 'Doručeno'}
                        </span>
                        <span className="text-xs text-gray-500">
                          {new Date(order.createdAt).toLocaleDateString('cs-CZ')}
                        </span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
