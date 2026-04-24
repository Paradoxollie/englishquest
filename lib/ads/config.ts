export type AdRouteSettings = {
  loadScript: boolean;
  footer: boolean;
  sidebar: boolean;
};

export const ADSENSE_CLIENT =
  process.env.NEXT_PUBLIC_ADSENSE_CLIENT ?? "ca-pub-6094969027977372";

export const ADSENSE_SLOTS = {
  footer: process.env.NEXT_PUBLIC_ADSENSE_FOOTER_SLOT ?? "1844574488",
} as const;

const DEFAULT_AD_SETTINGS: AdRouteSettings = {
  loadScript: false,
  footer: false,
  sidebar: false,
};

const ADSENSE_ENABLED =
  process.env.NODE_ENV === "production" &&
  process.env.NEXT_PUBLIC_ADSENSE_ENABLED !== "false";

const EXACT_ROUTE_SETTINGS: Record<string, AdRouteSettings> = {
  "/": {
    loadScript: true,
    footer: true,
    sidebar: false,
  },
  "/about": {
    loadScript: true,
    footer: true,
    sidebar: false,
  },
  "/contact": {
    loadScript: true,
    footer: true,
    sidebar: false,
  },
};

export function getAdRouteSettings(pathname?: string | null): AdRouteSettings {
  if (!ADSENSE_ENABLED || !pathname) {
    return DEFAULT_AD_SETTINGS;
  }

  const normalizedPath =
    pathname.length > 1 && pathname.endsWith("/") ? pathname.slice(0, -1) : pathname;

  return EXACT_ROUTE_SETTINGS[normalizedPath] ?? DEFAULT_AD_SETTINGS;
}
