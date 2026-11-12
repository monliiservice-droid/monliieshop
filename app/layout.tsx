import type { Metadata, Viewport } from "next";
import { fontVariables } from "@/lib/fonts";
import "./globals.css";
import { getSeoSettings } from "@/lib/site-settings-server";
import { keywordList, verificationCode } from "@/lib/seo-settings";
import { Toaster } from "@/components/ui/sonner";

// Titulek, popis, klíčová slova a ověřovací kódy vyhledávačů se nastavují v Nastavení → SEO
export async function generateMetadata(): Promise<Metadata> {
  const seo = await getSeoSettings()
  const google = verificationCode(seo.googleVerification)
  const seznam = verificationCode(seo.seznamVerification)
  const bing = verificationCode(seo.bingVerification)
  const shareImage = seo.shareImage || '/story_4.jpg'

  return {
    title: seo.title,
    description: seo.description,
    keywords: keywordList(seo),
    authors: [{ name: 'Monlii' }],
    creator: 'Monlii',
    publisher: 'Monlii',
    metadataBase: new URL(process.env.NEXT_PUBLIC_URL || 'https://monlii.cz'),
    manifest: '/site.webmanifest',
    icons: {
      icon: [
        { url: '/favicon.ico', sizes: 'any' },
        { url: '/icon.png', type: 'image/png', sizes: '32x32' },
        { url: '/icon-192.png', type: 'image/png', sizes: '192x192' },
        { url: '/icon-512.png', type: 'image/png', sizes: '512x512' },
      ],
      apple: [{ url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' }],
    },
    openGraph: {
      title: seo.title,
      description: seo.description,
      type: 'website',
      locale: 'cs_CZ',
      siteName: 'Monlii',
      images: [{ url: shareImage, alt: seo.title }],
    },
    twitter: {
      card: 'summary_large_image',
      title: seo.title,
      description: seo.description,
      images: [shareImage],
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
    verification: {
      ...(google && { google }),
      other: {
        ...(seznam && { 'seznam-wmt': seznam }),
        ...(bing && { 'msvalidate.01': bing }),
      },
    },
  }
}

export const viewport: Viewport = {
  themeColor: '#fbf7f2',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="cs" className={fontVariables}>
      <body>
        {children}
        <Toaster theme="light" position="top-center" richColors closeButton />
      </body>
    </html>
  );
}
