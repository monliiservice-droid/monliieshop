#!/usr/bin/env tsx
/**
 * Aplikuje migraci přímo na produkční databázi
 * POZOR: Toto je nouzové řešení! Normálně by migrace měly běžet přes Prisma Migrate.
 */

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function applyMigration() {
  console.log('🔧 Aplikuji migraci na produkční databázi...\n')

  try {
    // Aplikuj SQL přímo
    await prisma.$executeRawUnsafe(`
      ALTER TABLE "OrderItem" 
      ADD COLUMN IF NOT EXISTS "productName" TEXT NOT NULL DEFAULT '';
    `)

    console.log('✅ Migrace úspěšně aplikována!')
    console.log('   - Přidán sloupec "productName" do tabulky "OrderItem"')
    
    // Ověř že sloupec existuje
    const result = await prisma.$queryRaw`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'OrderItem' AND column_name = 'productName';
    ` as any[]

    if (result.length > 0) {
      console.log('\n✅ Ověření: Sloupec "productName" existuje v databázi')
    } else {
      console.log('\n❌ CHYBA: Sloupec nebyl vytvořen!')
    }

  } catch (error: any) {
    console.error('\n❌ Chyba při aplikaci migrace:', error.message)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

applyMigration()
