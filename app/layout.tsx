import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AdLayoutShell } from "@/components/ads/AdLayoutShell";
import { AuthProvider } from "@/components/auth/auth-provider";
import { AppHeader } from "@/components/layout/app-header";
import { ADSENSE_CLIENT } from "@/lib/ads/config";
import { SITE_URL } from "@/lib/site/config";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
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
    url: SITE_URL,
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
    "google-adsense-account": ADSENSE_CLIENT,
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
        <AuthProvider>
          <div className="fixed inset-0 bg-gradient-to-b from-[#010101] via-[#020617] to-[#010101]">
            <div className="absolute left-1/4 top-20 h-96 w-96 rounded-full bg-emerald-950/4 blur-3xl" />
            <div className="absolute right-1/4 top-40 h-80 w-80 rounded-full bg-emerald-950/3 blur-3xl" />
            <div className="absolute bottom-20 left-1/2 h-72 w-72 rounded-full bg-emerald-950/2 blur-3xl" />
          </div>

          <AdLayoutShell header={<AppHeader />}>{children}</AdLayoutShell>
        </AuthProvider>
      </body>
    </html>
  );
}
