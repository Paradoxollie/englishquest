import { AtlasCover } from "@/components/quest/atlas-cover";
import { publicPageMetadata } from "@/lib/site/metadata";

export const metadata = publicPageMetadata({
  path: "/quest/atlas",
  title: "Une BD interactive pour débuter en anglais · L’Atlas des passages",
  description: "Apprends à saluer, te présenter et poser tes premières questions en anglais avec Maya et Sam. Lis les bulles, réponds aux personnages et poursuis l’aventure sans compte.",
  image: "/art/passage/quai.webp",
  imageAlt: "Maya et Sam rejoignent le robot du quai 7 au port suspendu.",
});
export const dynamic = "force-dynamic";
export default function AtlasPage() {
  return <AtlasCover />;
}
