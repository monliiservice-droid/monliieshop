import type { Metadata, Viewport } from "next";
import { fontVariables } from "@/lib/fonts";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";

const TITLE = "Monlii | Šité s láskou k tělu i přírodě";
const DESCRIPTION =
  "Ručně šité prádlo a oblečení pro ženy, muže i děti z rodinné české dílny. Malé série, poctivé materiály a střihy, které opravdu sedí.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  keywords: ['ručně šité oblečení', 'české prádlo', 'dámské prádlo', 'pánské prádlo', 'dětské oblečení', 'rodinná dílna', 'pomalá móda', 'monlii'],
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
      { url: '/icon-512.png', type: 'image/png', sizes: '512x512' }
    ],
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' }
    ],
  },
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    type: 'website',
    locale: 'cs_CZ',
    siteName: 'Monlii',
    images: [{ url: '/story_4.jpg', alt: 'Monlii – šité s láskou k tělu i přírodě' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: TITLE,
    description: DESCRIPTION,
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
