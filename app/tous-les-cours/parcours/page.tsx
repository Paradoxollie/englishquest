import { CourseRoadmap } from "@/components/quest/course-roadmap";
import { publicPageMetadata } from "@/lib/site/metadata";

export const metadata = publicPageMetadata({
  path: "/tous-les-cours/parcours",
  title: "Mon parcours dans les 50 cours d’anglais",
  description: "Retrouve tes cours, tes quiz et les examens de chapitre sur la carte de tes cinquante missions.",
});
export const dynamic = "force-dynamic";

export default CourseRoadmap;
