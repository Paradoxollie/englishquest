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
    "Apprenez l'anglais de manière ludique avec English Quest. Jeux pédagogiques, cours structurés et activités gamifiées pour progresser en anglais. Créé par Pierre Marienne, professeur d'anglais dans le Val-d'Oise.",
  keywords: [
    "apprendre anglais",
    "cours anglais",
    "jeux anglais",
    "apprentissage anglais",
    "anglais gamifié",
    "cours anglais en ligne",
    "apprendre anglais français",
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
      "Apprenez l'anglais de manière ludique avec des jeux pédagogiques, des cours structurés et des activités gamifiées.",
  },
  twitter: {
    card: "summary_large_image",
    title: "English Quest - Apprendre l'anglais en jouant",
    description:
      "Apprenez l'anglais de manière ludique avec des jeux pédagogiques et des cours structurés.",
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
        {/* Script AdSense - doit être visible dans le HTML source pour validation Google */}
        <Script
          id="google-adsense"
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-6094969027977372"
          crossOrigin="anonymous"
          strategy="beforeInteractive"
        />



        <AuthProvider>
          {/* 
            Full-screen dark radial gradient background
            Color palette: from #020617 at edges to #0b1b38 / #020617 at top center
            To tweak colors, modify the bg-[radial-gradient(...)] classes below
          */}
          <div className="fixed inset-0 bg-gradient-to-b from-[#010101] via-[#020617] to-[#010101]">
            {/* Blurred orbs in background - very subtle dark emerald with very low opacity */}
            {/* To adjust orb colors/positions, modify the absolute positioned divs below */}
            <div className="absolute top-20 left-1/4 h-96 w-96 rounded-full bg-emerald-950/4 blur-3xl" />
            <div className="absolute top-40 right-1/4 h-80 w-80 rounded-full bg-emerald-950/3 blur-3xl" />
            <div className="absolute bottom-20 left-1/2 h-72 w-72 rounded-full bg-emerald-950/2 blur-3xl" />
          </div>

          {/* Centered container with wider max-width for 3-column layout */}
          <div className="relative z-10 mx-auto min-h-screen max-w-[1600px] px-2 md:px-4 py-3 md:py-6">
            <div className="flex min-h-screen flex-col gap-4 md:gap-10">
              {/* Glass panel header */}
              <AppHeader />

              <div className="flex flex-1 gap-6 justify-center">
                {/* Visual Balancer (Left Spacer) - Ensures main content stays perfectly centered */}
                <div className="hidden 2xl:block w-[300px] flex-shrink-0" aria-hidden="true" />

                <main className="flex-1 min-w-0 max-w-5xl">
                  {children}

                  <ConditionalAdSlot>
                    <FooterAdContainer />
                    <FooterAd />
                  </ConditionalAdSlot>
                </main>

                {/* Sidebar Ad - Visible only on 2XL screens to maintain centering */}
                {/* On smaller screens (laptop), we hide it to prioritize content centering */}
                <aside className="hidden 2xl:block w-[300px] flex-shrink-0">
                  <div className="sticky top-6">
                    <ConditionalAdSlot>
                      <SidebarAdContainer />
                      <SidebarAd />
                    </ConditionalAdSlot>
                  </div>
                </aside>
              </div>

              {/* Simple footer with muted text */}
              <footer className="text-center text-xs text-slate-400 space-y-2 pb-4">
                <div>© English Quest – Apprentissage de l'anglais gamifié</div>
                <div className="flex justify-center gap-4 text-slate-500">
                  <Link href="/about" className="hover:text-slate-400 transition-colors">
                    À propos
                  </Link>
                  <Link href="/contact" className="hover:text-slate-400 transition-colors">
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
