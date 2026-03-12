import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Script from "next/script";
import Link from "next/link";
import "./globals.css";
import { AuthProvider } from "@/components/auth/auth-provider";
import { ConditionalAdSlot } from "@/components/ads/ConditionalAdSlot";
import { AppHeader } from "@/components/layout/app-header";
import { FooterAd } from "@/components/ads/FooterAd";
import { FooterAdContainer } from "@/components/ads/FooterAdServer";
import { SidebarAd } from "@/components/ads/SidebarAd";
import { SidebarAdContainer } from "@/components/ads/SidebarAdServer";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "English Quest - Apprendre l'anglais en jouant",
    template: "%s | English Quest",
  },
  description:
    "Apprenez l'anglais de facon ludique avec English Quest. Jeux pedagogiques, cours structures et activites gamifiees pour progresser en anglais. Cree par Pierre Marienne, professeur d'anglais dans le Val-d'Oise.",
  keywords: [
    "apprendre anglais",
    "cours anglais",
    "jeux anglais",
    "apprentissage anglais",
    "anglais gamifie",
    "cours anglais en ligne",
    "apprendre anglais francais",
  ],
  authors: [{ name: "Pierre Marienne" }],
  creator: "Pierre Marienne",
  publisher: "English Quest",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  openGraph: {
    type: "website",
    locale: "fr_FR",
    url: "https://englishquest.fr",
    siteName: "English Quest",
    title: "English Quest - Apprendre l'anglais en jouant",
    description:
      "Apprenez l'anglais de facon ludique avec des jeux pedagogiques, des cours structures et des activites gamifiees.",
  },
  twitter: {
    card: "summary_large_image",
    title: "English Quest - Apprendre l'anglais en jouant",
    description:
      "Apprenez l'anglais de facon ludique avec des jeux pedagogiques et des cours structures.",
  },
  other: {
    "google-adsense-account": "ca-pub-6094969027977372",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <body
        className={`${inter.variable} min-h-screen text-slate-100 antialiased`}
        suppressHydrationWarning
      >
        <Script
          id="google-adsense"
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-6094969027977372"
          crossOrigin="anonymous"
          strategy="beforeInteractive"
        />

        <AuthProvider>
          <div className="fixed inset-0 bg-gradient-to-b from-[#010101] via-[#020617] to-[#010101]">
            <div className="absolute left-1/4 top-20 h-96 w-96 rounded-full bg-emerald-950/4 blur-3xl" />
            <div className="absolute right-1/4 top-40 h-80 w-80 rounded-full bg-emerald-950/3 blur-3xl" />
            <div className="absolute bottom-20 left-1/2 h-72 w-72 rounded-full bg-emerald-950/2 blur-3xl" />
          </div>

          <div className="relative z-10 mx-auto min-h-screen max-w-[1600px] px-2 py-3 md:px-4 md:py-6">
            <div className="flex min-h-screen flex-col gap-4 md:gap-10">
              <AppHeader />

              <div className="flex flex-1 justify-center gap-6">
                <div className="hidden w-[300px] flex-shrink-0 2xl:block" aria-hidden="true" />

                <main className="max-w-5xl min-w-0 flex-1">
                  {children}

                  <ConditionalAdSlot>
                    <FooterAdContainer />
                    <FooterAd />
                  </ConditionalAdSlot>
                </main>

                <aside className="hidden w-[300px] flex-shrink-0 2xl:block">
                  <div className="sticky top-6">
                    <ConditionalAdSlot>
                      <SidebarAdContainer />
                      <SidebarAd />
                    </ConditionalAdSlot>
                  </div>
                </aside>
              </div>

              <footer className="space-y-2 pb-4 text-center text-xs text-slate-400">
                <div>English Quest - Apprentissage de l'anglais gamifie</div>
                <div className="flex justify-center gap-4 text-slate-500">
                  <Link href="/about" className="transition-colors hover:text-slate-400">
                    A propos
                  </Link>
                  <Link href="/contact" className="transition-colors hover:text-slate-400">
                    Contact
                  </Link>
                </div>
              </footer>
            </div>
          </div>
        </AuthProvider>
      </body>
    </html>
  );
}
