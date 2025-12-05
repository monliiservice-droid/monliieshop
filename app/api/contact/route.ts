import { NextRequest, NextResponse } from 'next/server'
import nodemailer from 'nodemailer'

const transportOptions = {
  host: process.env.MAILTRAP_HOST || 'sandbox.smtp.mailtrap.io',
  port: parseInt(process.env.MAILTRAP_PORT || '2525'),
  auth: {
    user: process.env.MAILTRAP_USER || '',
    pass: process.env.MAILTRAP_PASS || '',
  },
}

const transporter = nodemailer.createTransport(transportOptions)

export async function POST(request: NextRequest) {
  try {
    const { name, email, phone, message } = await request.json()

    // Validace
    if (!name || !email || !message) {
      return NextResponse.json(
        { message: 'Jméno, email a zpráva jsou povinné' },
        { status: 400 }
      )
    }

    const sellerEmail = process.env.SELLER_EMAIL || 'luckaivankova1@seznam.cz'
    const fromEmail = process.env.EMAIL_FROM || 'noreply@monlii.cz'
    const logoUrl = `${process.env.NEXT_PUBLIC_URL || 'https://monlii.cz'}/logo_wide_black.png`

    // Email pro prodejce
    const sellerEmailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="text-align: center; padding: 30px; border-bottom: 3px solid #931e31;">
          <img src="${logoUrl}" alt="Monlii" width="150">
        </div>
        <div style="padding: 40px 30px;">
          <h2 style="color: #931e31; margin-bottom: 20px;">🔔 Nová zpráva z kontaktního formuláře</h2>
          
          <div style="background: #f9f9f9; padding: 25px; border-radius: 10px; margin: 25px 0;">
            <p style="margin: 10px 0;"><strong>Jméno:</strong> ${name}</p>
            <p style="margin: 10px 0;"><strong>Email:</strong> <a href="mailto:${email}" style="color: #931e31;">${email}</a></p>
            ${phone ? `<p style="margin: 10px 0;"><strong>Telefon:</strong> ${phone}</p>` : ''}
          </div>

          <div style="background: #fff3cd; padding: 20px; border-left: 4px solid #ffc107; border-radius: 5px; margin: 25px 0;">
            <h3 style="margin-top: 0; color: #856404;">Zpráva:</h3>
            <p style="white-space: pre-wrap; line-height: 1.6;">${message}</p>
          </div>

          <p style="color: #666; font-size: 14px; margin-top: 30px;">
            💡 <strong>Tip:</strong> Odpovězte zákazníkovi na email <a href="mailto:${email}" style="color: #931e31;">${email}</a>
          </p>
        </div>
        <div style="text-align: center; padding: 20px; background: #f5f5f5; color: #666; font-size: 12px;">
          <p>&copy; ${new Date().getFullYear()} Monlii Admin Panel</p>
        </div>
      </div>
    `

    // Email pro zákazníka (automatická odpověď)
    const customerEmailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="text-align: center; padding: 30px; border-bottom: 3px solid #931e31;">
          <img src="${logoUrl}" alt="Monlii" width="150">
        </div>
        <div style="padding: 40px 30px;">
          <h2 style="color: #931e31; margin-bottom: 20px;">Děkujeme za vaši zprávu! ✉️</h2>
          
          <p style="font-size: 16px; line-height: 1.6; color: #333;">Ahoj ${name},</p>
          
          <p style="font-size: 16px; line-height: 1.6; color: #333;">
            Děkujeme, že jsi nás kontaktoval/a. Tvoji zprávu jsme obdrželi a co nejdříve se ti ozveme.
          </p>

          <div style="background: #f0f9ff; padding: 20px; border-left: 4px solid #3b82f6; border-radius: 5px; margin: 25px 0;">
            <p style="margin: 0; color: #1e40af;">
              ⏰ <strong>Odpovídáme obvykle do 24 hodin</strong><br>
              Pokud potřebuješ něco urgentního, neváhej nám zavolat!
            </p>
          </div>

          <div style="background: #f9f9f9; padding: 25px; border-radius: 10px; margin: 25px 0;">
            <h3 style="color: #666; font-size: 14px; margin-top: 0;">Tvoje zpráva:</h3>
            <p style="color: #666; white-space: pre-wrap; line-height: 1.6;">${message}</p>
          </div>

          <div style="text-align: center; margin: 30px 0;">
            <p style="color: #666; margin-bottom: 15px;">Mezitím můžeš:</p>
            <a href="${process.env.NEXT_PUBLIC_URL}/obchod" 
               style="display: inline-block; background: linear-gradient(to right, #931e31, #b8263d); 
                      color: white; padding: 12px 30px; text-decoration: none; border-radius: 25px; 
                      font-weight: bold; margin: 5px;">
              Prohlédnout naše produkty
            </a>
          </div>

          <p style="font-size: 16px; line-height: 1.6; color: #333; margin-top: 30px;">
            S láskou,<br>
            <strong style="color: #931e31;">Tým Monlii ❤️</strong>
          </p>
        </div>
        <div style="text-align: center; padding: 20px; background: #f5f5f5; color: #666; font-size: 12px;">
          <p>&copy; ${new Date().getFullYear()} Monlii. Všechna práva vyhrazena.</p>
          <p style="margin-top: 10px;">
            <a href="${process.env.NEXT_PUBLIC_URL}" style="color: #931e31; text-decoration: none;">monlii.cz</a> | 
            <a href="mailto:monlli@seznam.cz" style="color: #931e31; text-decoration: none;">monlli@seznam.cz</a>
          </p>
        </div>
      </div>
    `

    // Odeslání emailu prodejci
    await transporter.sendMail({
      from: `"${name}" <${fromEmail}>`,
      replyTo: email,
      to: sellerEmail,
      subject: `🔔 Nová zpráva z kontaktního formuláře od ${name}`,
      html: sellerEmailHtml,
    })

    // Odeslání automatické odpovědi zákazníkovi
    await transporter.sendMail({
      from: `"Monlii" <${fromEmail}>`,
      to: email,
      subject: 'Děkujeme za vaši zprávu - Monlii',
      html: customerEmailHtml,
    })

    console.log(`Contact form submission from ${email} sent successfully`)

    return NextResponse.json({
      success: true,
      message: 'Zpráva byla úspěšně odeslána',
    })
  } catch (error) {
    console.error('Error sending contact form:', error)
    return NextResponse.json(
      { message: 'Chyba při odesílání zprávy' },
      { status: 500 }
    )
  }
}
