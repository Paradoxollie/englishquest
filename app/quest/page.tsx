import { AtlasCover } from "@/components/quest/atlas-cover";
import { AtlasBookmark } from "@/components/quest/atlas-bookmark";

export { metadata } from "./atlas/page";
export const dynamic = "force-dynamic";

export default function QuestPage() {
  return <><AtlasBookmark /><AtlasCover /></>;
}
