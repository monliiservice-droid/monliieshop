#!/usr/bin/env tsx
/**
 * Skript pro ověření konzistence Prisma schema s databází
 * Spustit: npx tsx scripts/verify-schema.ts
 */

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function verifySchema() {
  console.log('🔍 Ověřuji konzistenci databáze...\n')

  try {
    // Test 1: Zkontroluj OrderItem tabulku
    console.log('📋 Kontroluji OrderItem model...')
    try {
      const orderItem = await prisma.orderItem.findFirst()
      console.log('✅ OrderItem model je dostupný')
      
      // Zkontroluj že máme potřebná pole
      if (orderItem) {
        const hasProductName = 'productName' in orderItem
        console.log(`  - productName pole: ${hasProductName ? '✅' : '❌ CHYBÍ!'}`)
      }
    } catch (error: any) {
      if (error.message.includes('productName')) {
        console.error('❌ CHYBA: Sloupec productName neexistuje v databázi!')
        console.error('   Řešení: Spusť `npm run build` nebo `prisma migrate deploy`')
      } else {
        console.error('❌ Chyba při kontrole OrderItem:', error.message)
      }
    }

    // Test 2: Zkontroluj Order tabulku
    console.log('\n📋 Kontroluji Order model...')
    try {
      const order = await prisma.order.findFirst()
      console.log('✅ Order model je dostupný')
    } catch (error: any) {
      console.error('❌ Chyba při kontrole Order:', error.message)
    }

    // Test 3: Zkontroluj Product tabulku
    console.log('\n📋 Kontroluji Product model...')
    try {
      const product = await prisma.product.findFirst()
      console.log('✅ Product model je dostupný')
    } catch (error: any) {
      console.error('❌ Chyba při kontrole Product:', error.message)
    }

    // Test 4: Zkontroluj CompanySettings tabulku
    console.log('\n📋 Kontroluji CompanySettings model...')
    try {
      const settings = await prisma.companySettings.findFirst()
      console.log('✅ CompanySettings model je dostupný')
    } catch (error: any) {
      console.error('❌ Chyba při kontrole CompanySettings:', error.message)
    }

    console.log('\n✅ Ověření dokončeno!')
    
  } catch (error) {
    console.error('\n❌ Kritická chyba:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

verifySchema()
