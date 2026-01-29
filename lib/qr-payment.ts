export interface PaymentDetails {
  accountNumber: string
  bankCode: string
  amount: number
  variableSymbol: string
  message?: string
}

export function generateQRPaymentString(details: PaymentDetails): string {
  const { accountNumber, bankCode, amount, variableSymbol, message } = details
  
  const amountFormatted = amount.toFixed(2)
  
  let qrString = `SPD*1.0*ACC:CZ${bankCode}${accountNumber.padStart(16, '0')}*AM:${amountFormatted}*CC:CZK*`
  
  if (variableSymbol) {
    qrString += `X-VS:${variableSymbol}*`
  }
  
  if (message) {
    qrString += `MSG:${message}*`
  }
  
  return qrString
}

export function generateVariableSymbol(orderNumber: string): string {
  const numericPart = orderNumber.replace(/\D/g, '')
  return numericPart.padStart(10, '0')
}

export function getQRCodeDataURL(paymentString: string): string {
  return `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(paymentString)}`
}

export function generatePaymentQRCode(orderNumber: string, amount: number): {
  qrString: string
  qrCodeURL: string
  variableSymbol: string
  accountNumber: string
  bankCode: string
} {
  const accountNumber = '7843801238'
  const bankCode = '6363'
  const variableSymbol = generateVariableSymbol(orderNumber)
  
  const paymentDetails: PaymentDetails = {
    accountNumber,
    bankCode,
    amount,
    variableSymbol,
    message: `Objednavka ${orderNumber}`
  }
  
  const qrString = generateQRPaymentString(paymentDetails)
  const qrCodeURL = getQRCodeDataURL(qrString)
  
  return {
    qrString,
    qrCodeURL,
    variableSymbol,
    accountNumber,
    bankCode
  }
}
