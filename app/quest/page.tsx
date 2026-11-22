import { CourseRoadmap } from "@/components/quest/course-roadmap";
import { AtlasBookmark } from "@/components/quest/atlas-bookmark";
import { publicPageMetadata } from "@/lib/site/metadata";

export const metadata = publicPageMetadata({
  path: "/quest",
  title: "L’aventure en anglais en 50 missions",
  description: "Retrouve ta mission sur la carte des cinq chapitres ou essaie la bande dessinée interactive de Maya et Sam.",
});
export const dynamic = "force-dynamic";

export default function QuestPage() {
  return <><AtlasBookmark /><CourseRoadmap /></>;
}
