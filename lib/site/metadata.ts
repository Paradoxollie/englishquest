import type { Metadata } from "next";
import { ART } from "@/lib/art";
import { getGamePresentation } from "@/lib/games/presentation";

type PublicPage = {
  path: string;
  title: string;
  description: string;
  image?: string;
  imageAlt?: string;
};

export function publicPageMetadata({
  path, title, description, image = ART.heroHome, imageAlt = "Maya et Sam, les héros d’English Quest, au-dessus de Londres.",
}: PublicPage): Metadata {
  const images = [{ url: image, alt: imageAlt }];
  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: { type: "website", locale: "fr_FR", siteName: "English Quest", url: path, title, description, images },
    twitter: { card: "summary_large_image", title, description, images },
  };
}

export function gameMetadata(slug: string, title: string, description: string): Metadata {
  const art = getGamePresentation({ slug, name: title });
  return publicPageMetadata({ path: `/play/${slug}`, title, description, image: art.artworkSrc, imageAlt: art.imageAlt });
}
