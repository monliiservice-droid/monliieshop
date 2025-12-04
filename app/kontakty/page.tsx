'use client'

import { Navbar } from '@/components/navbar'
import { Footer } from '@/components/footer'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Mail, Phone, MapPin, Facebook, Instagram, Clock, Store, Send } from 'lucide-react'
import { useState } from 'react'

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: ''
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    
    // Simulace odeslání (později nahradit skutečným API)
    setTimeout(() => {
      setIsSubmitting(false)
      setSubmitStatus('success')
      setFormData({ name: '', email: '', phone: '', message: '' })
      
      setTimeout(() => setSubmitStatus('idle'), 5000)
    }, 1000)
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }))
  }
  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-white">
        {/* Hero Section */}
        <section className="relative py-20 overflow-hidden">
          {/* Background Image */}
          <div className="absolute inset-0">
            {/* Desktop Image */}
            <div 
              className="hidden md:block absolute inset-0 bg-cover bg-bottom bg-no-repeat"
              style={{ backgroundImage: 'url(/hero_section_new.png)' }}
            />
            {/* Mobile Image */}
            <div 
              className="block md:hidden absolute inset-0 bg-cover bg-center bg-no-repeat"
              style={{ backgroundImage: 'url(/hero_section_new_mobile.JPG)' }}
            />
            <div className="absolute inset-0 bg-black/40"></div>
          </div>
          
          <div className="container max-w-4xl text-center relative z-10">
            <h1 className="text-4xl md:text-6xl font-bold mb-4 tracking-tight uppercase text-white animate-fade-in">
              Kontakty
            </h1>
            <p className="text-lg md:text-xl text-white/90 leading-relaxed animate-fade-in" style={{animationDelay: '0.2s'}}>
              Máte dotaz? Neváhejte nás kontaktovat
            </p>
          </div>
        </section>

        {/* Contact Info */}
        <section className="py-24 bg-gradient-to-b from-white via-pink-50/20 to-white">
          <div className="container max-w-5xl">
            <div className="text-center mb-16 animate-fade-in">
              <h2 className="text-4xl md:text-5xl font-bold mb-4 tracking-tight">Kontaktujte nás</h2>
              <p className="text-xl text-gray-600">Jsme tu pro vás každý den</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
              {/* Email Card */}
              <div className="group animate-fade-in">
                <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-pink-50 to-purple-50 p-8 soft-shadow-lg transition-all duration-500 hover:scale-105 hover:soft-shadow-xl">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-[#931e31]/10 to-[#b8263d]/10 rounded-full -mr-16 -mt-16 transition-transform duration-500 group-hover:scale-150"></div>
                  <div className="relative">
                    <div className="flex items-center mb-6">
                      <div className="w-14 h-14 rounded-full bg-gradient-to-r from-[#931e31] to-[#b8263d] flex items-center justify-center mr-4 transition-transform duration-500 group-hover:rotate-12">
                        <Mail className="h-7 w-7 text-white" />
                      </div>
                      <h3 className="text-2xl font-bold">E-mail</h3>
                    </div>
                    <a href="mailto:monlli@seznam.cz" className="text-[#931e31] hover:text-[#b8263d] font-bold text-xl block mb-3 transition-colors">
                      monlli@seznam.cz
                    </a>
                    <p className="text-gray-600 leading-relaxed">
                      📧 Odpovídáme obvykle do 24 hodin
                    </p>
                  </div>
                </div>
              </div>

              {/* Phone Card */}
              <div className="group animate-fade-in" style={{animationDelay: '0.1s'}}>
                <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-purple-50 to-pink-50 p-8 soft-shadow-lg transition-all duration-500 hover:scale-105 hover:soft-shadow-xl">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-[#b8263d]/10 to-[#931e31]/10 rounded-full -mr-16 -mt-16 transition-transform duration-500 group-hover:scale-150"></div>
                  <div className="relative">
                    <div className="flex items-center mb-6">
                      <div className="w-14 h-14 rounded-full bg-gradient-to-r from-[#b8263d] to-[#931e31] flex items-center justify-center mr-4 transition-transform duration-500 group-hover:rotate-12">
                        <Phone className="h-7 w-7 text-white" />
                      </div>
                      <h3 className="text-2xl font-bold">Telefon</h3>
                    </div>
                    <a href="tel:+420702559369" className="text-[#931e31] hover:text-[#b8263d] font-bold text-xl block mb-3 transition-colors">
                      +420 702 559 369
                    </a>
                    <p className="text-gray-600 leading-relaxed">
                      📞 Volejte kdykoliv během dne
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Social Media */}
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#931e31] to-[#b8263d] p-12 text-center animate-fade-in soft-shadow-xl" style={{animationDelay: '0.2s'}}>
              <div className="absolute top-0 left-0 w-64 h-64 bg-white/5 rounded-full -ml-32 -mt-32"></div>
              <div className="absolute bottom-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-32 -mb-32"></div>
              <div className="relative">
                <h2 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-white">Sledujte nás na sociálních sítích</h2>
                <p className="text-white/90 mb-10 text-lg">Buďte v obraze s nejnovějšími kolekcemi</p>
                <div className="flex justify-center gap-8 flex-wrap">
                  <a 
                    href="https://www.facebook.com/monlii.cz" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex flex-col items-center space-y-3 group"
                  >
                    <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center transition-all group-hover:scale-110 group-hover:shadow-2xl group-hover:bg-gradient-to-br group-hover:from-pink-50 group-hover:to-purple-50">
                      <Facebook className="h-12 w-12 text-[#931e31] transition-transform group-hover:scale-110" />
                    </div>
                    <span className="font-bold text-lg text-white">Facebook</span>
                  </a>
                  <a 
                    href="https://www.instagram.com/monlii_i/" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex flex-col items-center space-y-3 group"
                  >
                    <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center transition-all group-hover:scale-110 group-hover:shadow-2xl group-hover:bg-gradient-to-br group-hover:from-purple-50 group-hover:to-pink-50">
                      <Instagram className="h-12 w-12 text-[#931e31] transition-transform group-hover:scale-110" />
                    </div>
                    <span className="font-bold text-lg text-white">Instagram</span>
                  </a>
                </div>
              </div>
            </div>

            {/* Kde nás najdete */}
            <div className="mt-24 animate-fade-in" style={{animationDelay: '0.3s'}}>
              <h2 className="text-3xl md:text-4xl font-bold text-center mb-4 tracking-tight uppercase">Kde nás najdete</h2>
              <p className="text-center text-gray-600 mb-12 max-w-2xl mx-auto text-lg">
                Naše spodní prádlo najdete v našich prodejnách
              </p>

              {/* Lokace 1 - Havířov */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start mb-16 animate-fade-in" style={{animationDelay: '0.4s'}}>
                {/* Mapa - vlevo na desktopu */}
                <div className="bg-gray-100 rounded-3xl overflow-hidden soft-shadow-lg h-[400px] lg:h-full order-2 lg:order-1 transition-all duration-300 hover:scale-105 hover:soft-shadow-xl">
                  <iframe
                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2575.445678901234!2d18.41234567890123!3d49.78765432109876!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x4713e8f7c5d8e0c5%3A0x1234567890abcdef!2zRGxvdWjDoSB0xZVDrWRhIDk1Yy8xNjEyLCA3MzYgMDEgSGF2zIHFmW92LCBDZWNO!5e0!3m2!1scs!2scz!4v1234567890123!5m2!1scs!2scz"
                    width="100%"
                    height="100%"
                    style={{ border: 0 }}
                    allowFullScreen
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    className="w-full h-full"
                  ></iframe>
                </div>

                {/* Informace - vpravo na desktopu */}
                <div className="space-y-8 order-1 lg:order-2">
                  {/* Adresa */}
                  <div className="bg-gradient-to-br from-pink-50/50 to-purple-50/50 rounded-3xl p-8 soft-shadow-lg transition-all duration-300 hover:scale-105 hover:soft-shadow-xl">
                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0 w-12 h-12 rounded-full bg-gradient-to-r from-[#931e31] to-[#b8263d] flex items-center justify-center">
                        <Store className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold mb-2">Havířov - Kyšky Lišky</h3>
                        <p className="text-gray-700 leading-relaxed">
                          Dlouhá třída 95c/1612<br />
                          <span className="text-sm italic">vstup vedle marketu Albert</span><br />
                          736 01 Havířov, Podlesí
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Info o obchodu */}
                  <div className="bg-gradient-to-br from-pink-50/50 to-purple-50/50 rounded-3xl p-8 soft-shadow-lg transition-all duration-300 hover:scale-105 hover:soft-shadow-xl">
                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0 w-12 h-12 rounded-full bg-gradient-to-r from-[#931e31] to-[#b8263d] flex items-center justify-center">
                        <Clock className="h-6 w-6 text-white" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-xl font-bold mb-2">Otevírací doba obchodu</h3>
                        <p className="text-gray-600 text-sm">
                          Prádlo najdete v obchodě Kyšky Lišky.<br />
                          Otevírací doba dle provozní doby obchodu.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Lokace 2 - Frenštát pod Radhoštěm */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start animate-fade-in" style={{animationDelay: '0.5s'}}>
                {/* Informace */}
                <div className="space-y-8">
                  {/* Adresa */}
                  <div className="bg-gradient-to-br from-pink-50/50 to-purple-50/50 rounded-3xl p-8 soft-shadow-lg transition-all duration-300 hover:scale-105 hover:soft-shadow-xl">
                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0 w-12 h-12 rounded-full bg-gradient-to-r from-[#931e31] to-[#b8263d] flex items-center justify-center">
                        <MapPin className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold mb-2">Frenštát pod Radhoštěm</h3>
                        <p className="text-gray-700 leading-relaxed">
                          Rožnovská 1824<br />
                          744 01 Frenštát pod Radhoštěm
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Otevírací doba */}
                  <div className="bg-gradient-to-br from-pink-50/50 to-purple-50/50 rounded-3xl p-8 soft-shadow-lg transition-all duration-300 hover:scale-105 hover:soft-shadow-xl">
                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0 w-12 h-12 rounded-full bg-gradient-to-r from-[#931e31] to-[#b8263d] flex items-center justify-center">
                        <Clock className="h-6 w-6 text-white" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-xl font-bold mb-4">Otevírací doba</h3>
                        <div className="space-y-2 text-gray-700">
                          <div className="flex justify-between">
                            <span className="font-semibold">PO - PÁ</span>
                            <span>8:30 - 12:00 / 12:30 - 17:00</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="font-semibold">SO</span>
                            <span>8:00 - 12:00</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="font-semibold">NE</span>
                            <span className="text-red-600">ZAVŘENO</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Mapa */}
                <div className="bg-gray-100 rounded-3xl overflow-hidden soft-shadow-lg h-[400px] lg:h-full transition-all duration-300 hover:scale-105 hover:soft-shadow-xl">
                  <iframe
                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2580.8614924441677!2d18.207867976892397!3d49.54789674867931!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x4714107e8a8a8a8b%3A0x8a8a8a8a8a8a8a8a!2sRo%C5%BEnovsk%C3%A1%201824%2C%20744%2001%20Fren%C5%A1t%C3%A1t%20pod%20Radho%C5%A1t%C4%9Bm!5e0!3m2!1scs!2scz!4v1234567890123!5m2!1scs!2scz"
                    width="100%"
                    height="100%"
                    style={{ border: 0 }}
                    allowFullScreen
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    className="w-full h-full"
                  ></iframe>
                </div>
              </div>
            </div>

            {/* Contact Form */}
            <div id="kontaktni-formular" className="mt-20 animate-fade-in" style={{animationDelay: '0.4s'}}>
              <div className="bg-gradient-to-br from-pink-50/50 to-purple-50/50 rounded-3xl p-8 md:p-12 soft-shadow-lg">
                <div className="text-center mb-8">
                  <div className="inline-block p-4 bg-gradient-to-r from-[#931e31] to-[#b8263d] rounded-full mb-6">
                    <Mail className="h-8 w-8 text-white" />
                  </div>
                  <h2 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight">Máte dotaz?</h2>
                  <p className="text-lg text-gray-600 leading-relaxed max-w-2xl mx-auto">
                    Vyplňte formulář a my se vám ozveme co nejdříve
                  </p>
                </div>

                {submitStatus === 'success' && (
                  <div className="mb-8 p-6 bg-green-50 border-2 border-green-500 rounded-2xl text-center animate-fade-in">
                    <p className="text-green-700 font-semibold text-lg">
                      ✅ Děkujeme! Vaše zpráva byla odeslána. Ozveme se vám co nejdříve.
                    </p>
                  </div>
                )}

                <form onSubmit={handleSubmit} className="max-w-3xl mx-auto space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Jméno */}
                    <div>
                      <label htmlFor="name" className="block text-sm font-semibold text-gray-700 mb-2">
                        Jméno a příjmení *
                      </label>
                      <input
                        type="text"
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-[#931e31] focus:ring-2 focus:ring-[#931e31]/20 outline-none transition-all"
                        placeholder="Vaše jméno"
                      />
                    </div>

                    {/* Email */}
                    <div>
                      <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
                        E-mail *
                      </label>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-[#931e31] focus:ring-2 focus:ring-[#931e31]/20 outline-none transition-all"
                        placeholder="vas@email.cz"
                      />
                    </div>
                  </div>

                  {/* Telefon */}
                  <div>
                    <label htmlFor="phone" className="block text-sm font-semibold text-gray-700 mb-2">
                      Telefon
                    </label>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-[#931e31] focus:ring-2 focus:ring-[#931e31]/20 outline-none transition-all"
                      placeholder="+420 123 456 789"
                    />
                  </div>

                  {/* Zpráva */}
                  <div>
                    <label htmlFor="message" className="block text-sm font-semibold text-gray-700 mb-2">
                      Vaše zpráva *
                    </label>
                    <textarea
                      id="message"
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      required
                      rows={6}
                      className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-[#931e31] focus:ring-2 focus:ring-[#931e31]/20 outline-none transition-all resize-none"
                      placeholder="Napište nám svůj dotaz..."
                    />
                  </div>

                  {/* Submit Button */}
                  <div className="text-center pt-4">
                    <Button
                      type="submit"
                      disabled={isSubmitting}
                      className="bg-gradient-to-r from-[#931e31] to-[#b8263d] hover:from-[#6b1623] hover:to-[#931e31] text-white px-8 py-6 rounded-full font-semibold text-lg transition-all duration-300 hover:scale-105 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isSubmitting ? (
                        <>
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                          Odesílám...
                        </>
                      ) : (
                        <>
                          <Send className="h-5 w-5 mr-2" />
                          Odeslat zprávu
                        </>
                      )}
                    </Button>
                  </div>

                  <p className="text-center text-sm text-gray-500 mt-4">
                    * Povinná pole
                  </p>
                </form>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}
