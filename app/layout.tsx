import type { Metadata } from "next";
import { Atkinson_Hyperlegible, Bangers } from "next/font/google";
import "./globals.css";
import "./studio-theme.css";
import "./comic-theme.css";
import { SiteShell } from "@/components/layout/site-shell";
import { AuthProvider } from "@/components/auth/auth-provider";
import { AppHeader } from "@/components/layout/app-header";
import { RewardCelebrations } from "@/components/rewards/reward-celebrations";
import { SITE_URL } from "@/lib/site/config";

// Lettrage BD pour les titres, police très lisible (conçue pour les lecteurs fragiles) pour le texte.
const displayFont = Bangers({
  subsets: ["latin"],
  weight: ["400"],
  variable: "--font-bangers",
  display: "swap",
});

const bodyFont = Atkinson_Hyperlegible({
  subsets: ["latin"],
  weight: ["400", "700"],
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
};

const themeInitScript = `try{var t=localStorage.getItem('eq-theme');if(t==='dark'||t==='light'){document.documentElement.dataset.theme=t;}else{document.documentElement.dataset.theme='light';}}catch(e){document.documentElement.dataset.theme='light';}`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="fr"
      suppressHydrationWarning
      className={`${displayFont.variable} ${bodyFont.variable}`}
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body className="min-h-screen antialiased" suppressHydrationWarning>
        <AuthProvider>
          <SiteShell header={<AppHeader />}>{children}</SiteShell>
          <RewardCelebrations />
        </AuthProvider>
      </body>
    </html>
  );
}
