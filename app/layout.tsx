import type { Metadata } from "next";
import { Lora } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { CookieConsent } from "@/components/cookie-consent";
import { WelcomeNotice } from "@/components/welcome-notice";

const lora = Lora({
  subsets: ["latin", "latin-ext"],
  variable: "--font-lora",
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Monlii | Jedinečné spodní prádlo s příběhem a českou tradicí",
  description: "Objevte krásné a pohodlné spodní prádlo, které šije zkušená švadlena. Každý kousek je unikátní a podporuje rodinnou výrobu a české ruční řemeslo.",
  keywords: ['spodní prádlo', 'ručně šité prádlo', 'české prádlo', 'dámské prádlo', 'podprsenky', 'kalhotky', 'braletky', 'luxusní prádlo', 'monlii', 'rodinná výroba', 'české řemeslo'],
  authors: [{ name: 'Monlii' }],
  creator: 'Monlii',
  publisher: 'Monlii',
  metadataBase: new URL(process.env.NEXT_PUBLIC_URL || 'https://monlii.cz'),
  alternates: {
    canonical: '/',
  },
  manifest: '/site.webmanifest',
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/icon.png', type: 'image/png' }
    ],
    apple: '/apple-icon.png',
  },
  openGraph: {
    title: "Monlii | Jedinečné spodní prádlo s příběhem a českou tradicí",
    description: "Objevte krásné a pohodlné spodní prádlo, které šije zkušená švadlena. Každý kousek je unikátní a podporuje rodinnou výrobu a české ruční řemeslo.",
    type: 'website',
    locale: 'cs_CZ',
    url: 'https://monlii.cz',
    siteName: 'Monlii',
    images: [
      {
        url: '/story_4.jpg',
        width: 1200,
        height: 630,
        alt: 'Monlii - Jedinečné spodní prádlo',
      }
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: "Monlii | Jedinečné spodní prádlo",
    description: "Objevte krásné a pohodlné spodní prádlo, které šije zkušená švadlena.",
    images: ['/story_4.jpg'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="cs">
      <body
        className={`${lora.variable} font-serif antialiased`}
      >
        {children}
        <CookieConsent />
        <WelcomeNotice />
      </body>
    </html>
  );
}
