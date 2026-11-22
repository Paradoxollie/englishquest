import { AtlasCover } from "@/components/quest/atlas-cover";
import { publicPageMetadata } from "@/lib/site/metadata";

export const metadata = publicPageMetadata({
  path: "/quest/atlas",
  title: "L’Atlas des passages · L’aventure BD en anglais",
  description: "Lis les bulles et relève les défis de Maya et Sam. Une aventure interactive pour débuter en anglais, jouable sans inscription.",
  image: "/art/passage/quai.webp",
  imageAlt: "Maya et Sam rejoignent le robot du quai 7 au port suspendu.",
});
export const dynamic = "force-dynamic";
export default function AtlasPage() {
  return <AtlasCover />;
}
