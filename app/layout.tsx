import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/components/auth/auth-provider";
import { AppHeader } from "@/components/layout/app-header";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "EnglishQuest",
  description:
    "Level up your English with quests, games, and teacher missions tailored for French students.",
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

          {/* Centered container */}
          <div className="relative z-10 mx-auto min-h-screen max-w-6xl px-4 py-6">
            <div className="flex min-h-screen flex-col gap-10">
              {/* Glass panel header */}
              <AppHeader />

              <main className="flex-1">{children}</main>

              {/* Simple footer with muted text */}
              <footer className="text-center text-xs text-slate-400">
                © English Quest – Apprentissage de l'anglais gamifié
              </footer>
            </div>
          </div>
        </AuthProvider>
      </body>
    </html>
  );
}
