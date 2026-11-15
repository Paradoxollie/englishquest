import type { Metadata } from "next";
import Link from "next/link";
import { getUserCourseRoadmap } from "@/lib/courses/progress";
import { buildPlacementStep, getPlacementStatus } from "@/lib/placement/placement";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { PlacementTest } from "./placement-test";

export const metadata: Metadata = {
  title: "Test de niveau",
  description: "Teste ton niveau d'anglais en quelques minutes, gratuitement et sans compte : six questions par chapitre, de A1 à C1.",
};

export const dynamic = "force-dynamic";

export default async function PlacementPage() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const firstStep = buildPlacementStep(1);

  if (!user) {
    return (
      <div className="eq-container eq-section">
        <div className="mx-auto max-w-3xl">
          <p className="eq-kicker">Gratuit, sans compte</p>
          <h1 className="eq-h1">Quel est ton niveau d&apos;anglais ?</h1>
          <p className="eq-lead mt-4 max-w-none">
            Six questions par chapitre, tirées des cours. Quatre bonnes réponses et le chapitre est acquis : on passe
            au suivant. Au premier chapitre qui résiste, tu t&apos;arrêtes et c&apos;est là que tu commences. Entre
            deux et huit minutes.
          </p>
          <p className="mt-3 text-sm text-[var(--muted)]">
            Sans compte, ton résultat est gardé sur cet appareil et appliqué à ta carte quand tu crées ton compte.
          </p>
          {firstStep ? (
            <div className="mt-8">
              <PlacementTest firstStep={firstStep} guest />
            </div>
          ) : null}
        </div>
      </div>
    );
  }

  const [status, roadmap] = await Promise.all([getPlacementStatus(user.id), getUserCourseRoadmap(user.id)]);
  const alreadyStarted = roadmap.completedCount > 0 || status.taken;

  return (
    <div className="eq-container eq-section">
      <div className="mx-auto max-w-3xl">
        <p className="eq-kicker">Avant de partir</p>
        <h1 className="eq-h1">Test de niveau</h1>
        <p className="eq-lead mt-4 max-w-none">
          Six questions par chapitre, tirées des cours. Quatre bonnes réponses et le chapitre est acquis : on passe
          au suivant. Au premier chapitre qui résiste, tu t&apos;arrêtes et c&apos;est là que tu commences. Entre
          deux et huit minutes.
        </p>

        {alreadyStarted ? (
          <div className="eq-card mt-8">
            <p className="eq-kicker">Déjà en route</p>
            <p className="mt-2">
              {status.taken
                ? `Tu as déjà passé le test : tu as été placé au chapitre ${status.chapter ?? 1}.`
                : "Tu as déjà validé des missions sur la carte."}{" "}
              Le test ne peut pas te faire reculer, mais tu peux le repasser pour sauter des chapitres que tu
              maîtrises déjà.
            </p>
            <div className="eq-home-actions mt-4">
              <Link href="/quest" className="eq-btn eq-btn-primary">
                Voir la carte
              </Link>
            </div>
            <div className="mt-6">{firstStep ? <PlacementTest firstStep={firstStep} compact /> : null}</div>
          </div>
        ) : firstStep ? (
          <div className="mt-8">
            <PlacementTest firstStep={firstStep} />
          </div>
        ) : null}
      </div>
    </div>
  );
}
