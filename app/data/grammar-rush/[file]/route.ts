import { chapters } from "@/lib/courses/chapters";
import { buildRushPool } from "@/lib/games/grammar-rush-server";

export const dynamic = "force-static";
export const dynamicParams = false;

export function generateStaticParams() {
  return chapters.map(chapter => ({ file: `${chapter.id}.json` }));
}

export async function GET(_request: Request, { params }: { params: Promise<{ file: string }> }) {
  const { file } = await params;
  const chapter = chapters.find(item => file === `${item.id}.json`);
  if (!chapter) return new Response(null, { status: 404 });
  return Response.json(buildRushPool({ maxChapter: chapter.id }), { headers: { "X-Robots-Tag": "noindex" } });
}
