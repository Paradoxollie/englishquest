import { MetadataRoute } from "next";

// URL de base du site
const BASE_URL = "https://englishquest.fr";

export default function sitemap(): MetadataRoute.Sitemap {
    // Pages statiques principales
    const staticPages = [
        "",
        "/about",
        "/contact",
        "/auth/login",
        "/auth/signup",
        "/tous-les-cours",
    ].map((route) => ({
        url: `${BASE_URL}${route}`,
        lastModified: new Date(),
        changeFrequency: "monthly" as const,
        priority: route === "" ? 1 : 0.8,
    }));

    // Génération des URLs pour les 50 cours
    const coursePages = Array.from({ length: 50 }, (_, i) => i + 1).map((id) => ({
        url: `${BASE_URL}/cours/${id}`,
        lastModified: new Date(),
        changeFrequency: "weekly" as const,
        priority: 0.7,
    }));

    return [...staticPages, ...coursePages];
}
