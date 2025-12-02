import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  try {
    // Najdi nějaký existující produkt
    const product = await prisma.product.findFirst()

    if (!product) {
      console.log('❌ Nejdřív musíš mít alespoň jeden produkt v databázi!')
      return
    }

    // Vytvoř demo objednávku
    const order = await prisma.order.create({
      data: {
        orderNumber: `DEMO-${Date.now()}`,
        customerName: 'Jana Nováková',
        customerEmail: 'jana.novakova@example.com',
        customerPhone: '+420 777 123 456',
        shippingAddress: JSON.stringify({
          street: 'Václavské náměstí 1',
          city: 'Praha',
          zip: '110 00',
          country: 'Česká republika'
        }),
        billingAddress: JSON.stringify({
          street: 'Václavské náměstí 1',
          city: 'Praha',
          zip: '110 00',
          country: 'Česká republika'
        }),
        totalAmount: product.price * 2,
        discountCode: null,
        discountAmount: 0,
        status: 'new',
        paymentMethod: 'gopay',
        paymentStatus: 'paid',
        shippingMethod: 'zasilkovna_pickup',
        trackingNumber: null,
        gopayPaymentId: `demo_${Date.now()}`,
        items: {
          create: [
            {
              productId: product.id,
              quantity: 2,
              price: product.price,
              variant: JSON.stringify({
                Velikost: 'M',
                Barva: 'Černá'
              })
            }
          ]
        }
      },
      include: {
        items: {
          include: {
            product: true
          }
        }
      }
    })

    console.log('✅ Demo objednávka vytvořena!')
    console.log('\n📦 Detail objednávky:')
    console.log(`   Číslo: ${order.orderNumber}`)
    console.log(`   Zákazník: ${order.customerName}`)
    console.log(`   Email: ${order.customerEmail}`)
    console.log(`   Status: ${order.status}`)
    console.log(`   Platba: ${order.paymentStatus}`)
    console.log(`   Částka: ${order.totalAmount} Kč`)
    console.log(`\n   Položky:`)
    order.items.forEach((item: any, index: number) => {
      console.log(`   ${index + 1}. ${item.product.name} - ${item.quantity}× ${item.price} Kč`)
    })
    console.log('\n🎉 Můžeš otestovat workflow na /admin/objednavky')

  } catch (error) {
    console.error('❌ Chyba při vytváření demo objednávky:', error)
  } finally {
    await prisma.$disconnect()
  }
}

main()
