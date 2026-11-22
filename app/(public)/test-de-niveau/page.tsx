import { publicPageMetadata } from "@/lib/site/metadata";
import { PageHead } from "@/components/comic/page-head";
import Link from "next/link";
import { getUserCourseRoadmap } from "@/lib/courses/progress";
import { buildPlacementStep, getPlacementStatus } from "@/lib/placement/placement";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { PlacementTest } from "./placement-test";

export const metadata = publicPageMetadata({
  path: "/test-de-niveau",
  title: "Test de niveau d’anglais gratuit",
  description: "Teste ton niveau d'anglais en quelques minutes, gratuitement et sans compte : six questions par chapitre, de A1 à B1.",
});

export const dynamic = "force-dynamic";

export default async function PlacementPage() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const firstStep = buildPlacementStep(1);

  if (!user) {
    return (
      <div>
        <PageHead
          caption="Test de niveau"
          title="Où en es-tu en anglais ?"
        >
          Six questions par chapitre, de A1 à B1. Quatre bonnes réponses et le chapitre suivant s&apos;enchaîne ; au
          premier qui résiste, c&apos;est là que tu commences. Entre deux et huit minutes, sans compte.
        </PageHead>

        <div className="eq-container eq-section">
          <div className="mx-auto max-w-3xl">
            {firstStep ? <PlacementTest firstStep={firstStep} guest /> : null}
          </div>
        </div>
      </div>
    );
  }

  const [status, roadmap] = await Promise.all([getPlacementStatus(user.id), getUserCourseRoadmap(user.id)]);
  const alreadyStarted = roadmap.completedCount > 0 || status.taken;

  return (
    <div>
      <PageHead caption="Test de niveau" title="Où en es-tu en anglais ?">
        Six questions par chapitre, tirées des cours. Quatre bonnes réponses et le chapitre est acquis : on passe au
        suivant. Au premier chapitre qui résiste, tu t&apos;arrêtes et c&apos;est là que tu commences. Entre deux et huit
        minutes.
      </PageHead>

      <div className="eq-container eq-section">
        <div className="mx-auto max-w-3xl">
          {alreadyStarted ? (
            <div className="eq-card p-6 space-y-4">
              <span className="eq-caption">Déjà en route</span>
              <p>
                {status.taken
                  ? `Tu as déjà passé le test : tu as été placé au chapitre ${status.chapter ?? 1}.`
                  : "Tu as déjà validé des missions sur la carte."}{" "}
                Le test ne peut pas te faire reculer, mais tu peux le repasser pour sauter des chapitres que tu
                maîtrises déjà.
              </p>
              <div className="eq-home-actions">
                <Link href="/tous-les-cours/parcours" className="eq-btn eq-btn-primary">
                  Voir la carte
                </Link>
              </div>
              <div className="pt-2">{firstStep ? <PlacementTest firstStep={firstStep} compact /> : null}</div>
            </div>
          ) : firstStep ? (
            <PlacementTest firstStep={firstStep} />
          ) : null}
        </div>
      </div>
    </div>
  );
}
