'use client'

import { toast } from 'sonner'

/** Zobrazí chybu z admin API – konkrétní hlášku ze serveru, jinak obecnou s kódem odpovědi */
export async function toastResponseError(res: Response, fallback: string) {
  const result = await res.json().catch(() => ({}))
  const message = typeof result?.message === 'string' && result.message ? result.message : `${fallback} (chyba ${res.status})`
  toast.error(message, { duration: 10000 })
}

export function toastNetworkError(fallback: string) {
  toast.error(`${fallback} – zkontrolujte připojení k internetu a zkuste to znovu.`, { duration: 10000 })
}
