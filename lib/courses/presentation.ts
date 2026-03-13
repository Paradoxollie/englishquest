export type CourseVisualProfile = {
  chapterLabel: string;
  accent: string;
  secondary: string;
  rail: string;
  bannerBackground: string;
  cardBackground: string;
  cardBackgroundSoft: string;
  glow: string;
};

const profiles: Record<number, CourseVisualProfile> = {
  1: {
    chapterLabel: "Fondations",
    accent: "#22d3ee",
    secondary: "#34d399",
    rail: "linear-gradient(180deg, #67e8f9 0%, #22d3ee 52%, #34d399 100%)",
    bannerBackground:
      "linear-gradient(135deg, rgba(6, 28, 46, 0.98) 0%, rgba(8, 22, 42, 0.96) 52%, rgba(8, 18, 32, 0.98) 100%)",
    cardBackground:
      "linear-gradient(135deg, rgba(8, 24, 39, 0.98) 0%, rgba(10, 21, 35, 0.98) 58%, rgba(6, 14, 24, 0.99) 100%)",
    cardBackgroundSoft:
      "linear-gradient(135deg, rgba(6, 18, 32, 0.92) 0%, rgba(12, 21, 35, 0.96) 100%)",
    glow: "rgba(34, 211, 238, 0.18)",
  },
  2: {
    chapterLabel: "Elan",
    accent: "#60a5fa",
    secondary: "#f59e0b",
    rail: "linear-gradient(180deg, #93c5fd 0%, #60a5fa 48%, #f59e0b 100%)",
    bannerBackground:
      "linear-gradient(135deg, rgba(11, 26, 52, 0.98) 0%, rgba(15, 23, 42, 0.97) 50%, rgba(38, 22, 11, 0.96) 100%)",
    cardBackground:
      "linear-gradient(135deg, rgba(10, 24, 48, 0.98) 0%, rgba(15, 23, 42, 0.98) 58%, rgba(34, 19, 10, 0.98) 100%)",
    cardBackgroundSoft:
      "linear-gradient(135deg, rgba(12, 22, 40, 0.93) 0%, rgba(22, 22, 28, 0.97) 100%)",
    glow: "rgba(96, 165, 250, 0.18)",
  },
  3: {
    chapterLabel: "Connexion",
    accent: "#818cf8",
    secondary: "#38bdf8",
    rail: "linear-gradient(180deg, #a5b4fc 0%, #818cf8 52%, #38bdf8 100%)",
    bannerBackground:
      "linear-gradient(135deg, rgba(24, 22, 56, 0.98) 0%, rgba(17, 24, 39, 0.97) 52%, rgba(10, 27, 48, 0.96) 100%)",
    cardBackground:
      "linear-gradient(135deg, rgba(24, 21, 55, 0.98) 0%, rgba(12, 20, 36, 0.98) 56%, rgba(10, 25, 46, 0.99) 100%)",
    cardBackgroundSoft:
      "linear-gradient(135deg, rgba(18, 20, 40, 0.94) 0%, rgba(12, 22, 38, 0.97) 100%)",
    glow: "rgba(129, 140, 248, 0.18)",
  },
  4: {
    chapterLabel: "Tactique",
    accent: "#f472b6",
    secondary: "#a78bfa",
    rail: "linear-gradient(180deg, #f9a8d4 0%, #f472b6 48%, #a78bfa 100%)",
    bannerBackground:
      "linear-gradient(135deg, rgba(55, 16, 44, 0.98) 0%, rgba(24, 24, 37, 0.97) 52%, rgba(30, 18, 54, 0.96) 100%)",
    cardBackground:
      "linear-gradient(135deg, rgba(50, 16, 40, 0.98) 0%, rgba(17, 24, 39, 0.98) 56%, rgba(28, 18, 46, 0.99) 100%)",
    cardBackgroundSoft:
      "linear-gradient(135deg, rgba(36, 18, 34, 0.94) 0%, rgba(18, 20, 35, 0.97) 100%)",
    glow: "rgba(244, 114, 182, 0.18)",
  },
  5: {
    chapterLabel: "Maitrise",
    accent: "#f87171",
    secondary: "#fbbf24",
    rail: "linear-gradient(180deg, #fca5a5 0%, #f87171 48%, #fbbf24 100%)",
    bannerBackground:
      "linear-gradient(135deg, rgba(56, 18, 18, 0.98) 0%, rgba(31, 20, 20, 0.97) 52%, rgba(46, 27, 10, 0.96) 100%)",
    cardBackground:
      "linear-gradient(135deg, rgba(54, 18, 18, 0.98) 0%, rgba(26, 18, 20, 0.98) 56%, rgba(42, 24, 8, 0.99) 100%)",
    cardBackgroundSoft:
      "linear-gradient(135deg, rgba(38, 18, 18, 0.94) 0%, rgba(28, 20, 18, 0.97) 100%)",
    glow: "rgba(248, 113, 113, 0.18)",
  },
};

export function getCourseVisualProfile(palierId: number): CourseVisualProfile {
  return profiles[palierId] ?? profiles[1];
}
