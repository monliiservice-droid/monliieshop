import nodemailer from 'nodemailer'
import type SMTPTransport from 'nodemailer/lib/smtp-transport'

// Mailtrap konfigurace
const transportOptions: SMTPTransport.Options = {
  host: process.env.MAILTRAP_HOST || 'sandbox.smtp.mailtrap.io',
  port: parseInt(process.env.MAILTRAP_PORT || '2525'),
  auth: {
    user: process.env.MAILTRAP_USER || '',
    pass: process.env.MAILTRAP_PASS || '',
  },
}

const transporter = nodemailer.createTransport(transportOptions)

// Typy emailů
export type EmailType = 
  | 'order_received_customer'
  | 'order_received_seller'
  | 'order_accepted'
  | 'order_rejected'
  | 'order_in_production'
  | 'order_ready_to_ship'
  | 'order_shipped'
  | 'order_delivered'
  | 'review_request'
  | 'invoice_created'

interface OrderData {
  orderNumber: string
  customerName: string
  customerEmail: string
  totalAmount: number
  items: any[]
  shippingAddress: any
  trackingNumber?: string
  paymentMethod?: string
  qrPaymentData?: {
    qrCodeURL: string
    variableSymbol: string
    accountNumber: string
    bankCode: string
  }
}

interface InvoiceData {
  invoiceNumber: string
  orderNumber: string
  customerName: string
  customerEmail: string
  totalAmount: number
  subtotal: number
  vatAmount: number
  vatRate: number
  items: string // JSON string
  issueDate: string
  dueDate: string
  status: string
  paymentMethod?: string
  paymentStatus?: string
}

// Email šablony
export async function sendOrderEmail(type: EmailType, orderData: OrderData) {
  const { subject, html } = getEmailTemplate(type, orderData)
  
  const to = type === 'order_received_seller' 
    ? process.env.SELLER_EMAIL || 'prodejce@monlii.cz'
    : orderData.customerEmail

  try {
    await transporter.sendMail({
      from: `"Monlii" <${process.env.EMAIL_FROM || 'noreply@monlii.cz'}>`,
      to,
      subject,
      html,
    })
    
    console.log(`Email sent: ${type} to ${to}`)
    return { success: true }
  } catch (error) {
    console.error('Email sending failed:', error)
    return { success: false, error }
  }
}

// Email pro fakturu
export async function sendInvoiceEmail(invoiceData: InvoiceData) {
  const { subject, html } = getInvoiceEmailTemplate(invoiceData)
  
  try {
    await transporter.sendMail({
      from: `"Monlii" <${process.env.EMAIL_FROM || 'noreply@monlii.cz'}>`,
      to: invoiceData.customerEmail,
      subject,
      html,
    })
    
    console.log(`Invoice email sent to ${invoiceData.customerEmail}`)
    return { success: true }
  } catch (error) {
    console.error('Invoice email sending failed:', error)
    return { success: false, error }
  }
}

// Combined order + invoice + QR code email (for QR payments at order creation)
interface OrderWithInvoiceData extends OrderData {
  invoice: {
    invoiceNumber: string
    subtotal: number
    vatAmount: number
    vatRate: number
    items: string
  }
}

export async function sendOrderWithInvoiceEmail(data: OrderWithInvoiceData) {
  const logoUrl = `${process.env.NEXT_PUBLIC_URL || 'https://monlii.cz'}/logo_wide_black.png`
  
  const baseStyles = `
    <style>
      body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
      .container { max-width: 600px; margin: 0 auto; padding: 20px; }
      .header { text-align: center; padding: 30px 0; border-bottom: 3px solid #931e31; }
      .content { padding: 30px 20px; }
      .footer { text-align: center; padding: 20px; background: #f5f5f5; color: #666; font-size: 12px; }
      .order-details { background: #f9f9f9; padding: 20px; border-radius: 8px; margin: 20px 0; }
      .item { border-bottom: 1px solid #eee; padding: 10px 0; }
      .total { font-size: 18px; font-weight: bold; color: #931e31; margin-top: 15px; }
    </style>
  `

  const items = JSON.parse(data.invoice.items)

  const html = `
    ${baseStyles}
    <div class="container">
      <div class="header">
        <img src="${logoUrl}" alt="Monlii" width="150">
      </div>
      <div class="content">
        <h2>Děkujeme za objednávku! 🎉</h2>
        <p>Ahoj ${data.customerName},</p>
        <p>Právě jsme obdrželi tvou objednávku <strong>#${data.orderNumber}</strong>.</p>
        
        <div style="background: #f0f9ff; padding: 20px; border-radius: 12px; margin: 30px 0; border: 2px solid #3b82f6;">
          <h3 style="color: #1e40af; margin-bottom: 15px;">💳 Zaplatit objednávku</h3>
          <p style="margin-bottom: 20px;">Pro dokončení objednávky proveď platbu pomocí QR kódu nebo bankovním převodem:</p>
          
          ${data.qrPaymentData ? `
            <div style="text-align: center; margin: 20px 0;">
              <img src="${data.qrPaymentData.qrCodeURL}" alt="QR kód pro platbu" style="width: 250px; height: 250px; border: 4px solid #931e31; border-radius: 12px; padding: 10px; background: white;">
            </div>
            
            <div style="background: white; padding: 15px; border-radius: 8px; margin-top: 20px;">
              <p style="margin: 5px 0;"><strong>Číslo účtu:</strong> ${data.qrPaymentData.accountNumber}/${data.qrPaymentData.bankCode}</p>
              <p style="margin: 5px 0;"><strong>Částka:</strong> <span style="color: #931e31; font-size: 18px; font-weight: bold;">${data.totalAmount.toLocaleString('cs-CZ')} Kč</span></p>
              <p style="margin: 5px 0;"><strong>Variabilní symbol:</strong> ${data.qrPaymentData.variableSymbol}</p>
              <p style="margin: 5px 0;"><strong>Zpráva:</strong> Objednavka ${data.orderNumber}</p>
            </div>
          ` : ''}
        </div>

        ${data.shippingAddress?.shippingDetails?.pickupPoint ? `
          <div style="background: #f3e8ff; padding: 20px; border-radius: 12px; margin: 20px 0; border: 2px solid #9333ea;">
            <h3 style="color: #7c3aed; margin: 0 0 15px 0;">📦 Výdejní místo Zásilkovna</h3>
            <p style="font-weight: bold; font-size: 18px; margin: 0 0 10px 0;">${data.shippingAddress.shippingDetails.pickupPoint.name}</p>
            <p style="margin: 0; color: #374151;">
              ${data.shippingAddress.shippingDetails.pickupPoint.street}<br>
              ${data.shippingAddress.shippingDetails.pickupPoint.zip} ${data.shippingAddress.shippingDetails.pickupPoint.city}
            </p>
          </div>
        ` : ''}

        <div style="background: #fef3c7; padding: 20px; border-radius: 12px; margin: 30px 0; border: 2px solid #f59e0b;">
          <h3 style="color: #92400e; margin: 0 0 15px 0;">📄 Faktura ${data.invoice.invoiceNumber}</h3>
          
          <table style="width: 100%; border-collapse: collapse; margin: 15px 0;">
            <thead>
              <tr style="background: #931e31; color: white;">
                <th style="padding: 10px; text-align: left;">Položka</th>
                <th style="padding: 10px; text-align: right;">Ks</th>
                <th style="padding: 10px; text-align: right;">Cena</th>
              </tr>
            </thead>
            <tbody>
              ${items.map((item: any) => `
                <tr style="border-bottom: 1px solid #eee;">
                  <td style="padding: 10px;">${item.name}</td>
                  <td style="padding: 10px; text-align: right;">${item.quantity}</td>
                  <td style="padding: 10px; text-align: right;">${(item.quantity * item.price).toLocaleString('cs-CZ')} Kč</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
          
          <div style="text-align: right; padding-top: 15px; border-top: 2px solid #f59e0b;">
            <p style="margin: 5px 0;">Mezisoučet: ${data.invoice.subtotal.toLocaleString('cs-CZ')} Kč</p>
            ${data.invoice.vatAmount > 0 ? `<p style="margin: 5px 0;">DPH (${data.invoice.vatRate}%): ${data.invoice.vatAmount.toLocaleString('cs-CZ')} Kč</p>` : ''}
            <p style="margin: 15px 0 0 0; font-size: 24px; font-weight: bold; color: #931e31;">
              Celkem: ${data.totalAmount.toLocaleString('cs-CZ')} Kč
            </p>
          </div>
        </div>

        <p>Jakmile obdržíme platbu, začneme na tvé objednávce pracovat! 🎨</p>
        <p>S láskou,<br>Tým Monlii ❤️</p>
      </div>
      <div class="footer">
        <p>&copy; ${new Date().getFullYear()} Monlii. Všechna práva vyhrazena.</p>
      </div>
    </div>
  `

  try {
    await transporter.sendMail({
      from: `"Monlii" <${process.env.EMAIL_FROM || 'noreply@monlii.cz'}>`,
      to: data.customerEmail,
      subject: `Faktura a platební údaje - Objednávka #${data.orderNumber}`,
      html,
    })
    
    console.log(`Order with invoice email sent to ${data.customerEmail}`)
    return { success: true }
  } catch (error) {
    console.error('Order with invoice email sending failed:', error)
    return { success: false, error }
  }
}

function getEmailTemplate(type: EmailType, data: OrderData): { subject: string; html: string } {
  const logoUrl = `${process.env.NEXT_PUBLIC_URL || 'https://monlii.cz'}/logo_wide_black.png`
  
  const baseStyles = `
    <style>
      body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
      .container { max-width: 600px; margin: 0 auto; padding: 20px; }
      .header { text-align: center; padding: 30px 0; border-bottom: 3px solid #931e31; }
      .content { padding: 30px 20px; }
      .footer { text-align: center; padding: 20px; background: #f5f5f5; color: #666; font-size: 12px; }
      .button { display: inline-block; padding: 12px 30px; background: #931e31; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
      .order-details { background: #f9f9f9; padding: 20px; border-radius: 8px; margin: 20px 0; }
      .item { border-bottom: 1px solid #eee; padding: 10px 0; }
      .total { font-size: 18px; font-weight: bold; color: #931e31; margin-top: 15px; }
    </style>
  `

  switch (type) {
    case 'order_received_customer':
      return {
        subject: `Děkujeme za objednávku #${data.orderNumber}`,
        html: `
          ${baseStyles}
          <div class="container">
            <div class="header">
              <img src="${logoUrl}" alt="Monlii" width="150">
            </div>
            <div class="content">
              <h2>Děkujeme za vaši objednávku!</h2>
              <p>Ahoj ${data.customerName},</p>
              <p>Právě jsme obdrželi tvou objednávku <strong>#${data.orderNumber}</strong> a už na ní pracujeme! 🎉</p>
              
              <div class="order-details">
                <h3>Detail objednávky:</h3>
                ${data.items.map(item => `
                  <div class="item">
                    <strong>${item.name}</strong><br>
                    Množství: ${item.quantity} × ${item.price} Kč
                  </div>
                `).join('')}
                <div class="total">
                  Celkem: ${data.totalAmount.toLocaleString('cs-CZ')} Kč
                </div>
              </div>
              
              ${data.paymentMethod === 'qr_code' && data.qrPaymentData ? `
                <div style="background: #f0f9ff; padding: 20px; border-radius: 12px; margin: 30px 0; border: 2px solid #3b82f6;">
                  <h3 style="color: #1e40af; margin-bottom: 15px;">💳 Informace pro platbu</h3>
                  <p style="margin-bottom: 20px;">Pro dokončení objednávky proveď platbu pomocí QR kódu nebo bankovním převodem:</p>
                  
                  <div style="text-align: center; margin: 20px 0;">
                    <img src="${data.qrPaymentData.qrCodeURL}" alt="QR kód pro platbu" style="width: 250px; height: 250px; border: 4px solid #931e31; border-radius: 12px; padding: 10px; background: white;">
                  </div>
                  
                  <div style="background: white; padding: 15px; border-radius: 8px; margin-top: 20px;">
                    <p style="margin: 5px 0;"><strong>Číslo účtu:</strong> ${data.qrPaymentData.accountNumber}/${data.qrPaymentData.bankCode}</p>
                    <p style="margin: 5px 0;"><strong>Částka:</strong> <span style="color: #931e31; font-size: 18px; font-weight: bold;">${data.totalAmount.toLocaleString('cs-CZ')} Kč</span></p>
                    <p style="margin: 5px 0;"><strong>Variabilní symbol:</strong> ${data.qrPaymentData.variableSymbol}</p>
                    <p style="margin: 5px 0;"><strong>Zpráva:</strong> Objednavka ${data.orderNumber}</p>
                  </div>
                  
                  <p style="margin-top: 15px; font-size: 14px; color: #6b7280;">
                    <strong>Jak zaplatit:</strong><br>
                    1. Otevři svou mobilní bankovní aplikaci<br>
                    2. Vyber možnost "Platba QR kódem"<br>
                    3. Naskenuj QR kód výše<br>
                    4. Potvrď platbu
                  </p>
                </div>
              ` : ''}
              
              ${data.paymentMethod === 'cod' ? `
                <div style="background: #fff3cd; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #f59e0b;">
                  <strong>💵 Platba na dobírku</strong><br>
                  Objednávku zaplatíš při převzetí.
                </div>
              ` : ''}
              
              ${data.shippingAddress?.shippingDetails?.pickupPoint ? `
                <div style="background: #f3e8ff; padding: 20px; border-radius: 12px; margin: 20px 0; border: 2px solid #9333ea;">
                  <h3 style="color: #7c3aed; margin: 0 0 15px 0;">📦 Výdejní místo Zásilkovna</h3>
                  <p style="font-weight: bold; font-size: 18px; margin: 0 0 10px 0;">${data.shippingAddress.shippingDetails.pickupPoint.name}</p>
                  <p style="margin: 0; color: #374151;">
                    ${data.shippingAddress.shippingDetails.pickupPoint.street}<br>
                    ${data.shippingAddress.shippingDetails.pickupPoint.zip} ${data.shippingAddress.shippingDetails.pickupPoint.city}
                  </p>
                  ${data.shippingAddress.shippingDetails.pickupPoint.openingHours ? `
                    <p style="margin: 10px 0 0 0; font-size: 14px; color: #6b7280;">
                      Otevírací doba: ${data.shippingAddress.shippingDetails.pickupPoint.openingHours}
                    </p>
                  ` : ''}
                </div>
              ` : ''}
              
              <p>Brzy tě budeme kontaktovat s potvrzením přijetí objednávky.</p>
              <p>S láskou,<br>Tým Monlii ❤️</p>
            </div>
            <div class="footer">
              <p>&copy; ${new Date().getFullYear()} Monlii. Všechna práva vyhrazena.</p>
            </div>
          </div>
        `
      }

    case 'order_received_seller':
      return {
        subject: `Nová objednávka #${data.orderNumber}`,
        html: `
          ${baseStyles}
          <div class="container">
            <div class="header">
              <img src="${logoUrl}" alt="Monlii" width="150">
            </div>
            <div class="content">
              <h2>🔔 Nová objednávka!</h2>
              <p>Objednávka <strong>#${data.orderNumber}</strong></p>
              
              <div class="order-details">
                <p><strong>Zákazník:</strong> ${data.customerName}</p>
                <p><strong>Email:</strong> ${data.customerEmail}</p>
                <p><strong>Adresa:</strong> ${data.shippingAddress.street}, ${data.shippingAddress.zip} ${data.shippingAddress.city}</p>
                
                ${data.paymentMethod ? `
                  <p><strong>Způsob platby:</strong> ${
                    data.paymentMethod === 'qr_code' ? 'QR platba / Bankovní převod' : 
                    data.paymentMethod === 'cod' ? 'Dobírka' : data.paymentMethod
                  }</p>
                ` : ''}
                
                ${data.paymentMethod === 'qr_code' && data.qrPaymentData ? `
                  <p><strong>Variabilní symbol:</strong> ${data.qrPaymentData.variableSymbol}</p>
                  <p style="color: #f59e0b;"><strong>⚠️ Čeká se na platbu zákazníka</strong></p>
                ` : ''}
                
                ${data.paymentMethod === 'cod' ? `
                  <p style="color: #10b981;"><strong>✓ Platba při převzetí</strong></p>
                ` : ''}
                
                ${data.shippingAddress?.shippingDetails?.pickupPoint ? `
                  <div style="background: #f3e8ff; padding: 15px; border-radius: 8px; margin: 15px 0; border-left: 4px solid #9333ea;">
                    <strong>📦 Výdejní místo:</strong><br>
                    <strong>${data.shippingAddress.shippingDetails.pickupPoint.name}</strong><br>
                    ${data.shippingAddress.shippingDetails.pickupPoint.street}, ${data.shippingAddress.shippingDetails.pickupPoint.zip} ${data.shippingAddress.shippingDetails.pickupPoint.city}
                  </div>
                ` : ''}
                
                <h3>Položky:</h3>
                ${data.items.map(item => `
                  <div class="item">
                    <strong>${item.name}</strong><br>
                    Množství: ${item.quantity} × ${item.price} Kč
                  </div>
                `).join('')}
                <div class="total">
                  Celkem: ${data.totalAmount.toLocaleString('cs-CZ')} Kč
                </div>
              </div>
              
              <a href="${process.env.NEXT_PUBLIC_URL}/admin/objednavky" class="button">Zobrazit v admin panelu</a>
            </div>
            <div class="footer">
              <p>Monlii Admin Panel</p>
            </div>
          </div>
        `
      }

    case 'order_accepted':
      return {
        subject: `Objednávka #${data.orderNumber} byla přijata a je ve výrobě`,
        html: `
          ${baseStyles}
          <div class="container">
            <div class="header">
              <img src="${logoUrl}" alt="Monlii" width="150">
            </div>
            <div class="content">
              <h2>Tvoje objednávka je ve výrobě! 🎨✨</h2>
              <p>Ahoj ${data.customerName},</p>
              
              ${data.paymentMethod === 'qr_code' ? `
                <div style="background: #d1fae5; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #10b981;">
                  <strong>✅ Platba přijata!</strong><br>
                  Děkujeme, tvá platba za objednávku <strong>#${data.orderNumber}</strong> byla úspěšně přijata.
                </div>
              ` : ''}
              
              <p>S radostí ti oznamujeme, že tvoje objednávka už je ve výrobě!</p>
              
              <div class="order-details">
                <h3>Co se právě děje:</h3>
                <p>✂️ S láskou vytváříme každý kousek ručně, jen pro tebe!</p>
                <p>👗 Tvoje prádlo už je v rukách naší zkušené švadleny</p>
                <p>💝 Pečlivě dbáme na každý detail, aby bylo dokonalé</p>
              </div>
              
              ${data.shippingAddress?.shippingDetails?.pickupPoint ? `
                <div style="background: #f3e8ff; padding: 20px; border-radius: 12px; margin: 20px 0; border: 2px solid #9333ea;">
                  <h3 style="color: #7c3aed; margin: 0 0 15px 0;">📦 Balíček bude k vyzvednutí na:</h3>
                  <p style="font-weight: bold; font-size: 18px; margin: 0 0 10px 0;">${data.shippingAddress.shippingDetails.pickupPoint.name}</p>
                  <p style="margin: 0; color: #374151;">
                    ${data.shippingAddress.shippingDetails.pickupPoint.street}<br>
                    ${data.shippingAddress.shippingDetails.pickupPoint.zip} ${data.shippingAddress.shippingDetails.pickupPoint.city}
                  </p>
                </div>
              ` : ''}
              
              <p>Budeme tě průběžně informovat o dalších krocích tvé objednávky.</p>
              ${data.paymentMethod === 'cod' ? `<p>Zároveň ti posíláme fakturu v samostatném emailu.</p>` : ''}
              <p>S láskou,<br>Tým Monlii ❤️</p>
            </div>
            <div class="footer">
              <p>&copy; ${new Date().getFullYear()} Monlii. Všechna práva vyhrazena.</p>
            </div>
          </div>
        `
      }

    case 'order_rejected':
      return {
        subject: `Objednávka #${data.orderNumber} - Omlouváme se`,
        html: `
          ${baseStyles}
          <div class="container">
            <div class="header">
              <img src="${logoUrl}" alt="Monlii" width="150">
            </div>
            <div class="content">
              <h2>Omlouváme se</h2>
              <p>Ahoj ${data.customerName},</p>
              <p>Bohužel musíme odmítnout tvoji objednávku <strong>#${data.orderNumber}</strong>.</p>
              <p>V případě platby kartou byla částka vrácena zpět na tvůj účet.</p>
              <p>Pokud máš jakékoliv dotazy, neváhej nás kontaktovat.</p>
              <p>S láskou,<br>Tým Monlii ❤️</p>
            </div>
            <div class="footer">
              <p>&copy; ${new Date().getFullYear()} Monlii. Všechna práva vyhrazena.</p>
            </div>
          </div>
        `
      }

    case 'order_in_production':
      return {
        subject: `Objednávka #${data.orderNumber} je ve výrobě`,
        html: `
          ${baseStyles}
          <div class="container">
            <div class="header">
              <img src="${logoUrl}" alt="Monlii" width="150">
            </div>
            <div class="content">
              <h2>Tvoje objednávka je ve výrobě! 🎨</h2>
              <p>Ahoj ${data.customerName},</p>
              <p>Tvoje objednávka <strong>#${data.orderNumber}</strong> je právě ve výrobě.</p>
              <p>S láskou vytváříme každý kousek ručně, jen pro tebe!</p>
              <p>S láskou,<br>Tým Monlii ❤️</p>
            </div>
            <div class="footer">
              <p>&copy; ${new Date().getFullYear()} Monlii. Všechna práva vyhrazena.</p>
            </div>
          </div>
        `
      }

    case 'order_ready_to_ship':
      return {
        subject: `Objednávka #${data.orderNumber} je připravena k odeslání`,
        html: `
          ${baseStyles}
          <div class="container">
            <div class="header">
              <img src="${logoUrl}" alt="Monlii" width="150">
            </div>
            <div class="content">
              <h2>Tvoje objednávka je připravena! 📦</h2>
              <p>Ahoj ${data.customerName},</p>
              <p>Tvoje objednávka <strong>#${data.orderNumber}</strong> je hotová a připravená k odeslání!</p>
              <p>V nejbližších dnech ji odešleme a dostaneš informace o sledování zásilky.</p>
              
              ${data.shippingAddress?.shippingDetails?.pickupPoint ? `
                <div style="background: #f3e8ff; padding: 20px; border-radius: 12px; margin: 20px 0; border: 2px solid #9333ea;">
                  <h3 style="color: #7c3aed; margin: 0 0 15px 0;">📦 Balíček bude k vyzvednutí na:</h3>
                  <p style="font-weight: bold; font-size: 18px; margin: 0 0 10px 0;">${data.shippingAddress.shippingDetails.pickupPoint.name}</p>
                  <p style="margin: 0; color: #374151;">
                    ${data.shippingAddress.shippingDetails.pickupPoint.street}<br>
                    ${data.shippingAddress.shippingDetails.pickupPoint.zip} ${data.shippingAddress.shippingDetails.pickupPoint.city}
                  </p>
                </div>
              ` : ''}
              
              <p>S láskou,<br>Tým Monlii ❤️</p>
            </div>
            <div class="footer">
              <p>&copy; ${new Date().getFullYear()} Monlii. Všechna práva vyhrazena.</p>
            </div>
          </div>
        `
      }

    case 'order_shipped':
      return {
        subject: `Objednávka #${data.orderNumber} byla odeslána`,
        html: `
          ${baseStyles}
          <div class="container">
            <div class="header">
              <img src="${logoUrl}" alt="Monlii" width="150">
            </div>
            <div class="content">
              <h2>Tvoje objednávka je na cestě! 🚚</h2>
              <p>Ahoj ${data.customerName},</p>
              <p>Tvoje objednávka <strong>#${data.orderNumber}</strong> byla odeslána!</p>
              
              ${data.shippingAddress?.shippingDetails?.pickupPoint ? `
                <div style="background: #f3e8ff; padding: 20px; border-radius: 12px; margin: 20px 0; border: 2px solid #9333ea;">
                  <h3 style="color: #7c3aed; margin: 0 0 15px 0;">📦 Vyzvedni si balíček na:</h3>
                  <p style="font-weight: bold; font-size: 18px; margin: 0 0 10px 0;">${data.shippingAddress.shippingDetails.pickupPoint.name}</p>
                  <p style="margin: 0; color: #374151;">
                    ${data.shippingAddress.shippingDetails.pickupPoint.street}<br>
                    ${data.shippingAddress.shippingDetails.pickupPoint.zip} ${data.shippingAddress.shippingDetails.pickupPoint.city}
                  </p>
                  ${data.shippingAddress.shippingDetails.pickupPoint.openingHours ? `
                    <p style="margin: 10px 0 0 0; font-size: 14px; color: #6b7280;">
                      Otevírací doba: ${data.shippingAddress.shippingDetails.pickupPoint.openingHours}
                    </p>
                  ` : ''}
                </div>
              ` : ''}
              
              ${data.trackingNumber ? `
                <div class="order-details">
                  <p><strong>Sledovací číslo:</strong> ${data.trackingNumber}</p>
                  <a href="https://www.zasilkovna.cz/sledovani/${data.trackingNumber}" class="button">Sledovat zásilku</a>
                </div>
              ` : ''}
              <p>Těšíme se, až si balíček vyzvedneš!</p>
              <p>S láskou,<br>Tým Monlii ❤️</p>
            </div>
            <div class="footer">
              <p>&copy; ${new Date().getFullYear()} Monlii. Všechna práva vyhrazena.</p>
            </div>
          </div>
        `
      }

    case 'order_delivered':
      return {
        subject: `Objednávka #${data.orderNumber} byla doručena`,
        html: `
          ${baseStyles}
          <div class="container">
            <div class="header">
              <img src="${logoUrl}" alt="Monlii" width="150">
            </div>
            <div class="content">
              <h2>Tvoje objednávka dorazila! 🎉</h2>
              <p>Ahoj ${data.customerName},</p>
              <p>Tvoje objednávka <strong>#${data.orderNumber}</strong> byla úspěšně doručena!</p>
              <p>Doufáme, že se ti naše produkty líbí a budou ti sloužit dlouho a s radostí.</p>
              <p>S láskou,<br>Tým Monlii ❤️</p>
            </div>
            <div class="footer">
              <p>&copy; ${new Date().getFullYear()} Monlii. Všechna práva vyhrazena.</p>
            </div>
          </div>
        `
      }

    case 'review_request':
      return {
        subject: `Jak se ti líbí naše produkty? 💝`,
        html: `
          ${baseStyles}
          <div class="container">
            <div class="header">
              <img src="${logoUrl}" alt="Monlii" width="150">
            </div>
            <div class="content">
              <h2>Řekni nám, co si myslíš! 💝</h2>
              <p>Ahoj ${data.customerName},</p>
              <p>Už uplynulo 5 dní od doručení tvé objednávky <strong>#${data.orderNumber}</strong> a rádi bychom věděli, jak se ti naše produkty líbí!</p>
              
              <p>Tvoje recenze nám moc pomůže a zároveň pomůžeš dalším zákaznicím se rozhodnout. 🌟</p>
              
              <a href="https://g.page/r/CR_YdQSCYSqbEBM/review" class="button">Napsat recenzi na Google</a>
              
              <div class="order-details">
                <h3>Máme pro tebe speciální nabídku!</h3>
                <p>Jako poděkování za tvou přízeň ti nabízíme <strong>5% slevu</strong> na další nákup.</p>
                <p>Použij kód: <strong>RECENZE5</strong> (při nákupu nad 1000 Kč)</p>
                <a href="${process.env.NEXT_PUBLIC_URL}/obchod" class="button">Nakoupit znovu</a>
              </div>
              
              <p>S láskou,<br>Tým Monlii ❤️</p>
            </div>
            <div class="footer">
              <p>&copy; ${new Date().getFullYear()} Monlii. Všechna práva vyhrazena.</p>
            </div>
          </div>
        `
      }

    default:
      throw new Error(`Unknown email type: ${type}`)
  }
}

function getInvoiceEmailTemplate(data: InvoiceData): { subject: string; html: string } {
  const logoUrl = `${process.env.NEXT_PUBLIC_URL || 'https://monlii.cz'}/logo_wide_black.png`
  
  const baseStyles = `
    <style>
      body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
      .container { max-width: 600px; margin: 0 auto; padding: 20px; }
      .header { text-align: center; padding: 30px 0; border-bottom: 3px solid #931e31; }
      .content { padding: 30px 20px; }
      .footer { text-align: center; padding: 20px; background: #f5f5f5; color: #666; font-size: 12px; }
      .invoice-box { background: #f9f9f9; padding: 20px; border-radius: 8px; margin: 20px 0; }
      .invoice-table { width: 100%; border-collapse: collapse; margin: 20px 0; }
      .invoice-table th { background: #931e31; color: white; padding: 10px; text-align: left; }
      .invoice-table td { padding: 10px; border-bottom: 1px solid #eee; }
      .total-row { font-weight: bold; font-size: 18px; color: #931e31; }
      .status-badge { display: inline-block; padding: 5px 15px; border-radius: 5px; font-weight: bold; }
      .status-paid { background: #4ade80; color: white; }
      .status-unpaid { background: #f59e0b; color: white; }
      .button { display: inline-block; padding: 12px 30px; background: #931e31; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
    </style>
  `

  const paymentMethodLabels: Record<string, string> = {
    card: 'Platba kartou',
    transfer: 'Bankovní převod',
    cod: 'Dobírka'
  }

  const items = JSON.parse(data.items)

  return {
    subject: `Faktura ${data.invoiceNumber} k objednávce ${data.orderNumber}`,
    html: `
      ${baseStyles}
      <div class="container">
        <div class="header">
          <img src="${logoUrl}" alt="Monlii" width="150">
        </div>
        <div class="content">
          <h2>Děkujeme za vaši objednávku! 🎉</h2>
          <p>Ahoj ${data.customerName},</p>
          <p>Tvoje objednávka byla přijata a vystavili jsme pro tebe fakturu.</p>
          
          <div class="invoice-box">
            <h3>Faktura ${data.invoiceNumber}</h3>
            <p><strong>K objednávce:</strong> ${data.orderNumber}</p>
            <p><strong>Datum vystavení:</strong> ${new Date(data.issueDate).toLocaleDateString('cs-CZ')}</p>
            ${data.paymentMethod ? `<p><strong>Způsob platby:</strong> ${paymentMethodLabels[data.paymentMethod] || data.paymentMethod}</p>` : ''}
            <p><strong>Status platby:</strong> 
              <span class="status-badge ${data.paymentMethod === 'card' || data.paymentMethod === 'transfer' || data.status === 'paid' || data.paymentStatus === 'paid' ? 'status-paid' : 'status-unpaid'}">
                ${data.paymentMethod === 'card' || data.paymentMethod === 'transfer' || data.status === 'paid' || data.paymentStatus === 'paid' ? 'Zaplaceno ✓' : 'Bude zaplacena při přijetí'}
              </span>
            </p>
          </div>

          <table class="invoice-table">
            <thead>
              <tr>
                <th>Položka</th>
                <th style="text-align: right;">Množství</th>
                <th style="text-align: right;">Cena/ks</th>
                <th style="text-align: right;">Celkem</th>
              </tr>
            </thead>
            <tbody>
              ${items.map((item: any) => `
                <tr>
                  <td>${item.name}</td>
                  <td style="text-align: right;">${item.quantity}</td>
                  <td style="text-align: right;">${item.price.toLocaleString('cs-CZ')} Kč</td>
                  <td style="text-align: right;">${(item.quantity * item.price).toLocaleString('cs-CZ')} Kč</td>
                </tr>
              `).join('')}
            </tbody>
          </table>

          <div style="text-align: right; padding: 20px; background: #f9f9f9; border-radius: 8px;">
            <p style="margin: 5px 0;">Mezisoučet: ${data.subtotal.toLocaleString('cs-CZ')} Kč</p>
            ${data.vatAmount > 0 ? `<p style="margin: 5px 0;">DPH (${data.vatRate}%): ${data.vatAmount.toLocaleString('cs-CZ')} Kč</p>` : ''}
            <p class="total-row" style="margin: 15px 0 0 0; font-size: 24px;">
              Celkem: ${data.totalAmount.toLocaleString('cs-CZ')} Kč
            </p>
          </div>

          ${data.paymentMethod === 'card' || data.paymentMethod === 'transfer' || data.status === 'paid' || data.paymentStatus === 'paid' ? `
            <div style="background: #d1fae5; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #4ade80;">
              <strong>✓ Zaplaceno</strong><br>
              Platba byla úspěšně přijata. Děkujeme!
            </div>
          ` : `
            <div style="background: #fff3cd; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #f59e0b;">
              <strong>ℹ️ Platba na dobírku</strong><br>
              Objednávku zaplatíš při převzetí.
            </div>
          `}

          <p>Tuto fakturu si můžeš vytisknout nebo uschovat pro své záznamy.</p>
          
          <p>Pokud máš jakékoliv dotazy, neváhej nás kontaktovat.</p>
          <p>S láskou,<br>Tým Monlii ❤️</p>
        </div>
        <div class="footer">
          <p>&copy; ${new Date().getFullYear()} Monlii. Všechna práva vyhrazena.</p>
        </div>
      </div>
    `
  }
}
