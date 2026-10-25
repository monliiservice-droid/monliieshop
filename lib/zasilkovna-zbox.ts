// Zásilkovna (Packeta) – výběr Z-BOXu přes oficiální mapový widget
// Dokumentace: https://docs.packetery.com/01-pickup-point-selection/02-widget-v6.html

export interface ZBoxPoint {
  id: string
  name: string
  place: string
  street: string
  city: string
  zip: string
  country: string
  url?: string
}

/**
 * Zásilkovna configuration
 */
export const ZASILKOVNA_CONFIG = {
  zboxDeliveryPrice: 69, // Kč - Z-BOX delivery
  freeShippingThreshold: 2500, // Kč - free shipping threshold
  codFee: 30, // Kč - cash on delivery fee
}

const WIDGET_SCRIPT_URL = 'https://widget.packeta.com/v6/www/js/library.js'

declare global {
  interface Window {
    Packeta?: {
      Widget: {
        pick: (apiKey: string, callback: (point: any) => void, options?: Record<string, unknown>) => void
      }
    }
  }
}

let scriptPromise: Promise<void> | null = null

function loadWidgetScript(): Promise<void> {
  if (window.Packeta) return Promise.resolve()
  if (!scriptPromise) {
    scriptPromise = new Promise((resolve, reject) => {
      const script = document.createElement('script')
      script.src = WIDGET_SCRIPT_URL
      script.async = true
      script.onload = () => resolve()
      script.onerror = () => {
        scriptPromise = null
        reject(new Error('Nepodařilo se načíst mapu Zásilkovny'))
      }
      document.head.appendChild(script)
    })
  }
  return scriptPromise
}

/** Na serveru chybí API klíč Zásilkovny (proměnná ZASILKOVNA_API_KEY) */
export class ZasilkovnaNotConfiguredError extends Error {
  constructor() {
    super('Zásilkovna není nakonfigurovaná')
  }
}

let apiKeyPromise: Promise<string> | null = null

// API klíč Zásilkovny je podle jejich dokumentace veřejný (widget běží v prohlížeči);
// tajné je pouze API heslo, které se zde nepoužívá.
function getWidgetApiKey(): Promise<string> {
  if (!apiKeyPromise) {
    apiKeyPromise = fetch('/api/zasilkovna/config')
      .then((res) => (res.ok ? res.json() : Promise.reject(new Error('config'))))
      .then((data) => {
        if (!data.apiKey) throw new ZasilkovnaNotConfiguredError()
        return data.apiKey as string
      })
      .catch((error) => {
        apiKeyPromise = null
        throw error
      })
  }
  return apiKeyPromise
}

/**
 * Otevře mapu Zásilkovny s Z-BOXy. Vrátí vybraný Z-BOX, nebo null, když zákazník okno zavřel.
 */
export async function pickZBox(): Promise<ZBoxPoint | null> {
  const [apiKey] = await Promise.all([getWidgetApiKey(), loadWidgetScript()])

  return new Promise((resolve) => {
    window.Packeta!.Widget.pick(
      apiKey,
      (point) => {
        if (!point) {
          resolve(null)
          return
        }
        resolve({
          id: String(point.id),
          name: point.name || point.place || 'Z-BOX',
          place: point.place || '',
          street: point.street || '',
          city: point.city || '',
          zip: point.zip || '',
          country: point.country || 'cz',
          ...(point.url && { url: point.url }),
        })
      },
      {
        country: 'cz',
        language: 'cs',
        // Zobrazit pouze Z-BOXy
        vendors: [{ country: 'cz', group: 'zbox' }],
      }
    )
  })
}
