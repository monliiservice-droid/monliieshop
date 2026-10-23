import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting database seed...')

  // Admin se přihlašuje přes ADMIN_USERNAME / ADMIN_PASSWORD(_HASH) z env, uživatele v DB nezakládáme.

  // Výchozí fakturační údaje – vytvoří se jen pokud ještě neexistují.
  // Existující nastavení (hlavně nextInvoiceNum) seed nikdy nepřepisuje,
  // jinak by se při opakovaném spuštění restartovala číselná řada faktur.
  const currentYear = new Date().getFullYear()
  
  const existing = await prisma.companySettings.findFirst()
  if (existing) {
    console.log('ℹ️  Company settings already exist, skipping:', existing.companyName)
    return
  }

  const companySettings = await prisma.companySettings.create({
    data: {
      companyName: 'Lucie Ivanková',
      ico: '14316242',
      dic: null,
      street: 'Dolní Domaslavice 34',
      city: 'Dolní Domaslavice',
      zip: '73938',
      email: 'luckaivankova1@seznam.cz',
      phone: '735823160',
      invoicePrefix: currentYear.toString(),
      nextInvoiceNum: 1,
      defaultVatRate: 0,
      vatPayer: false,
      invoiceDueDays: 14,
    },
  })
  
  console.log('✅ Company settings created:', companySettings.companyName)

  console.log('🎉 Database seed completed!')
}

main()
  .catch((e) => {
    console.error('❌ Seed error:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
