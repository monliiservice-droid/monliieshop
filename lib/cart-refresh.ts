'use client'

import { toast } from 'sonner'

type CartLine = { id: string; name: string; price: number }

/**
 * Srovná ceny v košíku s aktuálními cenami na serveru a odebere položky, které už nejde objednat.
 * Při chybě sítě vrátí košík beze změny – objednávku pak stejně ověří server.
 */
export async function refreshCartPrices<T extends CartLine>(items: T[]): Promise<T[]> {
  if (items.length === 0) return items
  try {
    const response = await fetch('/api/cart/quote', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ items }),
    })
    if (!response.ok) return items
    const { items: quotes } = (await response.json()) as { items: ({ price: number } | { error: string })[] }
    if (!Array.isArray(quotes) || quotes.length !== items.length) return items

    const removed: string[] = []
    let changed = false
    const updated: T[] = []
    items.forEach((item, index) => {
      const quote = quotes[index]
      if ('error' in quote) {
        removed.push(`${item.name}: ${quote.error}`)
        return
      }
      if (Math.abs(quote.price - item.price) > 0.001) changed = true
      updated.push({ ...item, price: quote.price })
    })

    if (removed.length > 0 || changed) {
      localStorage.setItem('cart', JSON.stringify(updated))
      window.dispatchEvent(new Event('cartUpdated'))
    }
    for (const message of removed) toast.error(`Odebráno z košíku – ${message}`, { duration: 8000 })
    if (changed) toast.info('Ceny v košíku jsme aktualizovali podle aktuální nabídky.')
    return updated
  } catch {
    return items
  }
}
