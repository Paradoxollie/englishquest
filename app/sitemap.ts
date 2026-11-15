import { MetadataRoute } from "next";
import { paliers } from "@/lib/courses/data";
import { games } from "@/lib/games/config";
import { SITE_URL } from "@/lib/site/config";

const BASE_URL = SITE_URL;
const LAST_MODIFIED = new Date("2026-10-10T00:00:00.000Z");

export default function sitemap(): MetadataRoute.Sitemap {
  const staticPages = [
    "",
    "/about",
    "/contact",
    "/auth/login",
    "/auth/signup",
    "/play",
    "/quest",
    "/tous-les-cours",
    "/test-de-niveau",
    "/mentions-legales",
    "/confidentialite",
  ].map((route) => {
    const changeFrequency: "weekly" | "monthly" = route === "" ? "weekly" : "monthly";
    const priority =
      route === ""
        ? 1
        : route === "/quest" || route === "/tous-les-cours"
          ? 0.9
          : route.startsWith("/mentions") || route.startsWith("/confidentialite")
            ? 0.3
            : 0.8;

    return {
      url: `${BASE_URL}${route}`,
      lastModified: LAST_MODIFIED,
      changeFrequency,
      priority,
    };
  });

  const coursePages = paliers.flatMap((palier) =>
    palier.courses.map((course) => ({
      url: `${BASE_URL}/cours/${course.id}`,
      lastModified: LAST_MODIFIED,
      changeFrequency: "weekly" as const,
      priority: 0.8,
    }))
  );

  const gamePages = games.map((game) => ({
    url: `${BASE_URL}/play/${game.slug}`,
    lastModified: LAST_MODIFIED,
    changeFrequency: "monthly" as const,
    priority: 0.7,
  }));

  return [...staticPages, ...coursePages, ...gamePages];
}
