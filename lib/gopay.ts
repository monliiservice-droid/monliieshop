/**
 * GoPay API Integration
 * Dokumentace: https://doc.gopay.com
 */

interface GoPay {
  goId: string
  clientId: string
  clientSecret: string
  isProductionMode: boolean
}

interface GoPayPayment {
  amount: number
  currency: string
  order_number: string
  order_description?: string
  items?: Array<{
    name: string
    amount: number
    count: number
  }>
  callback: {
    return_url: string
    notification_url: string
  }
  payer?: {
    contact: {
      first_name?: string
      last_name?: string
      email: string
      phone_number?: string
    }
  }
  lang?: string
}

interface GoPayPaymentResponse {
  id: number
  state: string
  gw_url: string
}

class GoPayClient {
  private goId: string
  private clientId: string
  private clientSecret: string
  private baseUrl: string
  private accessToken: string | null = null
  private tokenExpiry: number = 0

  constructor(config: GoPay) {
    this.goId = config.goId
    this.clientId = config.clientId
    this.clientSecret = config.clientSecret
    this.baseUrl = config.isProductionMode
      ? 'https://gate.gopay.cz/api'
      : 'https://gw.sandbox.gopay.com/api'
  }

  /**
   * Získání OAuth2 access tokenu
   */
  private async getAccessToken(): Promise<string> {
    // Pokud máme platný token, použijeme ho
    if (this.accessToken && Date.now() < this.tokenExpiry) {
      return this.accessToken
    }

    const credentials = Buffer.from(
      `${this.clientId}:${this.clientSecret}`
    ).toString('base64')

    const response = await fetch(`${this.baseUrl}/oauth2/token`, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Basic ${credentials}`,
      },
      body: 'grant_type=client_credentials&scope=payment-all',
    })

    if (!response.ok) {
      throw new Error(`GoPay auth failed: ${response.statusText}`)
    }

    const data = await response.json()
    this.accessToken = data.access_token
    // Token je platný 30 minut, nastavíme expiraci o 5 minut dříve
    this.tokenExpiry = Date.now() + (data.expires_in - 300) * 1000

    return this.accessToken
  }

  /**
   * Vytvoření platby
   */
  async createPayment(payment: GoPayPayment): Promise<GoPayPaymentResponse> {
    const token = await this.getAccessToken()

    const response = await fetch(`${this.baseUrl}/payments/payment`, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({
        payer: {
          default_payment_instrument: 'PAYMENT_CARD',
          allowed_payment_instruments: [
            'PAYMENT_CARD',
            'BANK_ACCOUNT',
            'GPAY',
            'PAYPAL',
          ],
          contact: payment.payer?.contact || {},
        },
        target: {
          type: 'ACCOUNT',
          goid: this.goId,
        },
        amount: payment.amount * 100, // GoPay očekává částku v haléřích/centech
        currency: payment.currency,
        order_number: payment.order_number,
        order_description: payment.order_description,
        items: payment.items?.map(item => ({
          name: item.name,
          amount: item.amount * 100,
          count: item.count,
        })) || [],
        callback: {
          return_url: payment.callback.return_url,
          notification_url: payment.callback.notification_url,
        },
        lang: payment.lang || 'CS',
      }),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(`GoPay payment creation failed: ${JSON.stringify(error)}`)
    }

    return response.json()
  }

  /**
   * Získání stavu platby
   */
  async getPaymentStatus(paymentId: number): Promise<any> {
    const token = await this.getAccessToken()

    const response = await fetch(`${this.baseUrl}/payments/payment/${paymentId}`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    })

    if (!response.ok) {
      throw new Error(`GoPay payment status failed: ${response.statusText}`)
    }

    return response.json()
  }

  /**
   * Zrušení platby
   */
  async cancelPayment(paymentId: number): Promise<void> {
    const token = await this.getAccessToken()

    const response = await fetch(`${this.baseUrl}/payments/payment/${paymentId}/void`, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    })

    if (!response.ok) {
      throw new Error(`GoPay payment cancellation failed: ${response.statusText}`)
    }
  }

  /**
   * Vrácení platby (refund)
   */
  async refundPayment(paymentId: number, amount: number): Promise<void> {
    const token = await this.getAccessToken()

    const response = await fetch(`${this.baseUrl}/payments/payment/${paymentId}/refund`, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({
        amount: amount * 100, // v haléřích
      }),
    })

    if (!response.ok) {
      throw new Error(`GoPay refund failed: ${response.statusText}`)
    }
  }
}

// Singleton instance
let gopayInstance: GoPayClient | null = null

export function getGoPayClient(): GoPayClient {
  if (!gopayInstance) {
    const goId = process.env.GOPAY_GO_ID
    const clientId = process.env.GOPAY_CLIENT_ID
    const clientSecret = process.env.GOPAY_CLIENT_SECRET
    const isProduction = process.env.NODE_ENV === 'production'

    if (!goId || !clientId || !clientSecret) {
      throw new Error('GoPay credentials are not configured')
    }

    gopayInstance = new GoPayClient({
      goId,
      clientId,
      clientSecret,
      isProductionMode: isProduction,
    })
  }

  return gopayInstance
}

/**
 * Helper pro interpretaci GoPay stavů
 */
export function getGoPayStateDescription(state: string): string {
  const states: Record<string, string> = {
    'CREATED': 'Platba vytvořena',
    'PAYMENT_METHOD_CHOSEN': 'Zákazník vybral platební metodu',
    'PAID': 'Platba zaplacena',
    'AUTHORIZED': 'Platba autorizována',
    'CANCELED': 'Platba zrušena',
    'TIMEOUTED': 'Platba vypršela',
    'REFUNDED': 'Platba vrácena',
    'PARTIALLY_REFUNDED': 'Platba částečně vrácena',
  }
  return states[state] || state
}

export { GoPayClient }
export type { GoPayPayment, GoPayPaymentResponse }
