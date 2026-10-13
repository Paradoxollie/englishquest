import type { Metadata } from "next";
import { Atkinson_Hyperlegible, Bricolage_Grotesque } from "next/font/google";
import "./globals.css";
import { AdLayoutShell } from "@/components/ads/AdLayoutShell";
import { AuthProvider } from "@/components/auth/auth-provider";
import { AppHeader } from "@/components/layout/app-header";
import { ADSENSE_CLIENT } from "@/lib/ads/config";
import { SITE_URL } from "@/lib/site/config";

const bricolage = Bricolage_Grotesque({
  subsets: ["latin"],
  weight: ["500", "700", "800"],
  variable: "--font-bricolage",
  display: "swap",
});

const atkinson = Atkinson_Hyperlegible({
  subsets: ["latin"],
  weight: ["400", "700"],
  style: ["normal", "italic"],
  variable: "--font-atkinson",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "English Quest, apprendre l'anglais en jouant",
    template: "%s | English Quest",
  },
  description:
    "Un parcours d'anglais par niveau, des cours courts avec quiz et sept jeux pour s'entraîner. Gratuit, créé par Pierre Marienne, professeur d'anglais.",
  keywords: [
    "apprendre l'anglais",
    "cours d'anglais",
    "jeux pour apprendre l'anglais",
    "anglais gamifié",
    "grammaire anglaise",
    "vocabulaire anglais",
    "anglais collège lycée",
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
    title: "English Quest, apprendre l'anglais en jouant",
    description:
      "Un parcours d'anglais par niveau, des cours courts avec quiz et sept jeux pour s'entraîner. Gratuit.",
  },
  twitter: {
    card: "summary_large_image",
    title: "English Quest, apprendre l'anglais en jouant",
    description:
      "Un parcours d'anglais par niveau, des cours courts avec quiz et sept jeux pour s'entraîner. Gratuit.",
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
    <html lang="fr" suppressHydrationWarning className={`${bricolage.variable} ${atkinson.variable}`}>
      <body className="min-h-screen antialiased" suppressHydrationWarning>
        <AuthProvider>
          <AdLayoutShell header={<AppHeader />}>{children}</AdLayoutShell>
        </AuthProvider>
      </body>
    </html>
  );
}
