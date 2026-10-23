'use client'

import { useEffect, useState } from 'react'

function readCount(): number {
  try {
    const cart = JSON.parse(localStorage.getItem('cart') || '[]')
    return Array.isArray(cart) ? cart.reduce((sum, item) => sum + (Number(item?.quantity) || 1), 0) : 0
  } catch {
    return 0
  }
}

/** Počet kusů v košíku – aktualizuje se při změně košíku i v jiné záložce */
export function useCartCount(): number {
  const [count, setCount] = useState(0)
  useEffect(() => {
    const update = () => setCount(readCount())
    update()
    window.addEventListener('cartUpdated', update)
    window.addEventListener('storage', update)
    return () => {
      window.removeEventListener('cartUpdated', update)
      window.removeEventListener('storage', update)
    }
  }, [])
  return count
}
