import { AtlasCover } from "@/components/quest/atlas-cover";
import { OldChapterLink } from "@/components/quest/old-chapter-link";
import { publicPageMetadata } from "@/lib/site/metadata";

export const metadata = publicPageMetadata({
  path: "/quest",
  title: "L’aventure en anglais avec Maya et Sam",
  description: "Embarque avec Maya et Sam dans une bande dessinée interactive pour faire tes premiers pas en anglais.",
});
export const dynamic = "force-dynamic";

export default function QuestPage() {
  return <><OldChapterLink /><AtlasCover /></>;
}
