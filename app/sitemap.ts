import type { MetadataRoute } from "next";
import { paliers } from "@/lib/courses/data";
import { games } from "@/lib/games/config";
import { SITE_URL } from "@/lib/site/config";

export default function sitemap(): MetadataRoute.Sitemap {
  const paths = [
    "/", "/essayer", "/play", "/tous-les-cours", "/quest", "/test-de-niveau",
    "/collection", "/about", "/profs", "/contact", "/mentions-legales", "/confidentialite",
    ...paliers.flatMap((palier) => palier.courses.map((course) => `/cours/${course.id}`)),
    ...games.map((game) => `/play/${game.slug}`),
  ];

  return paths.map((path) => ({ url: new URL(path, SITE_URL).href }));
}
