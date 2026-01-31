export interface PaymentDetails {
  accountNumber: string
  bankCode: string
  amount: number
  variableSymbol: string
  message?: string
}

/**
 * Calculate IBAN check digits for Czech accounts
 * Czech IBAN format: CZkk bbbb ssss ssss ssss ssss
 * Where kk = check digits, bbbb = bank code, rest = account number (16 digits)
 */
function calculateCzechIBAN(bankCode: string, accountNumber: string): string {
  // Pad bank code to 4 digits and account number to 16 digits
  const paddedBankCode = bankCode.padStart(4, '0')
  const paddedAccount = accountNumber.padStart(16, '0')
  
  // BBAN = bank code + account number
  const bban = paddedBankCode + paddedAccount
  
  // For check digit calculation: BBAN + CZ00
  // Replace letters: C=12, Z=35, so CZ = 1235
  const numericString = bban + '123500'
  
  // Calculate mod 97 using string arithmetic (number is too large for JS)
  let remainder = 0
  for (let i = 0; i < numericString.length; i++) {
    remainder = (remainder * 10 + parseInt(numericString[i])) % 97
  }
  
  // Check digits = 98 - remainder
  const checkDigits = (98 - remainder).toString().padStart(2, '0')
  
  return `CZ${checkDigits}${bban}`
}

export function generateQRPaymentString(details: PaymentDetails): string {
  const { accountNumber, bankCode, amount, variableSymbol, message } = details
  
  const amountFormatted = amount.toFixed(2)
  const iban = calculateCzechIBAN(bankCode, accountNumber)
  
  let qrString = `SPD*1.0*ACC:${iban}*AM:${amountFormatted}*CC:CZK`
  
  if (variableSymbol) {
    qrString += `*X-VS:${variableSymbol}`
  }
  
  if (message) {
    qrString += `*MSG:${message}`
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
  iban: string
} {
  // Bank account details - configurable via environment variables
  const accountNumber = process.env.BANK_ACCOUNT_NUMBER || '7843801238'
  const bankCode = process.env.BANK_CODE || '6363'
  const variableSymbol = generateVariableSymbol(orderNumber)
  const iban = calculateCzechIBAN(bankCode, accountNumber)
  
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
    bankCode,
    iban
  }
}
