import type { Metadata } from "next";
import { Lora } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { CookieConsent } from "@/components/cookie-consent";

const lora = Lora({
  subsets: ["latin", "latin-ext"],
  variable: "--font-lora",
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Monlii | Jedinečné spodní prádlo s příběhem a českou tradicí",
  description: "Objevte krásné a pohodlné spodní prádlo, které šije zkušená švadlena. Každý kousek je unikátní a podporuje rodinnou výrobu a české ruční řemeslo.",
  icons: {
    icon: '/favicon.png',
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
      </body>
    </html>
  );
}
