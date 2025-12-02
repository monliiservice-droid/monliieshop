import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting database seed...')

  // 1. Vytvoř admin uživatele
  const adminPassword = await bcrypt.hash('111023@Granko', 10)
  
  const admin = await prisma.admin.upsert({
    where: { email: 'admin' },
    update: {
      password: adminPassword,
      name: 'Admin',
    },
    create: {
      email: 'admin',
      password: adminPassword,
      name: 'Admin',
    },
  })
  
  console.log('✅ Admin user created/updated:', admin.email)

  // 2. Vytvoř company settings (fakturační údaje)
  const currentYear = new Date().getFullYear()
  
  const companySettings = await prisma.companySettings.upsert({
    where: { id: 'default' },
    update: {
      companyName: 'Lucie Ivanková',
      ico: '14316242',
      dic: null, // Není plátce DPH
      street: 'Dolní Domaslavice 34',
      city: 'Dolní Domaslavice',
      zip: '73938',
      email: 'luckaivankova1@seznam.cz',
      phone: '735823160',
      invoicePrefix: currentYear.toString(),
      nextInvoiceNum: 1,
      defaultVatRate: 0, // Není plátce DPH
      vatPayer: false,
      invoiceDueDays: 14,
    },
    create: {
      id: 'default',
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
  
  console.log('✅ Company settings created/updated:', companySettings.companyName)

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
