import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ART } from "@/lib/art";
import { resolveArt } from "@/lib/art-server";
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
  const onboardingArt = resolveArt(ART.onboarding);

  if (!user) {
    return (
      <div>
        <section className="eq-editorial-band">
          <div className="eq-container eq-split-hero">
            <div className="grid gap-4">
              <p className="eq-kicker">Placement rapide · Sans compte</p>
              <h1 className="eq-h1">Situez votre niveau d&apos;anglais en quelques minutes</h1>
              <p className="eq-lead">
                Six questions par palier, de A1 à C1. Tant que vous validez quatre réponses justes, le palier suivant
                s&apos;enchaîne automatiquement jusqu&apos;à trouver votre vrai point d&apos;ancrage.
              </p>
              <p className="text-xs font-semibold text-[var(--muted)]">
                Résultat conservé localement et appliqué dès que vous créez votre compte.
              </p>
            </div>
            {onboardingArt ? (
              <div className="eq-comic-panel">
                <div className="eq-comic-panel-media">
                  <Image
                    src={onboardingArt}
                    alt="Orientation dans la bibliothèque English Quest"
                    fill
                    priority
                    sizes="(max-width: 960px) 100vw, 45vw"
                    className="object-cover"
                  />
                </div>
                <div className="eq-comic-panel-bar">
                  <span><strong>2 à 8 min</strong> · Adaptatif</span>
                  <span>Paliers A1 → C1</span>
                </div>
              </div>
            ) : null}
          </div>
        </section>

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
