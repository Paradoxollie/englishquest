import { AuthCard } from "@/components/auth/auth-card";
import { SignupForm } from "@/components/auth/signup-form";
import { getGuestProgress } from "@/lib/courses/guest-progress-server";
import { getSafeNextPath, withNextParam } from "@/lib/navigation/safe-next";

export const metadata = {
  title: "Créer un compte",
};

export default async function SignupPage({ searchParams }: { searchParams: Promise<{ next?: string | string[] }> }) {
  const params = await searchParams;
  const { placementChapter } = await getGuestProgress();
  // Retour prévu après l'inscription (par exemple /rejoindre?code=... pour une classe).
  const next = getSafeNextPath(Array.isArray(params.next) ? params.next[0] : params.next);

  return (
    <AuthCard
      title="Créer un compte"
      subtitle={
        next?.startsWith("/rejoindre")
          ? "Crée ton compte, puis tu rejoins ta classe. Tu as déjà un compte ? Connecte-toi en bas."
          : next?.startsWith("/profile")
            ? "Choisis un pseudo pour retrouver ton vestiaire et tes 30 pièces d’or de bienvenue."
            : "Gratuit. Un pseudo, un mot de passe, et la carte s'ouvre."
      }
      footerHint="Tu as déjà un compte ?"
      footerLinkLabel="Se connecter"
      footerHref={withNextParam("/auth/login", next)}
    >
      <SignupForm next={next} placementChapter={placementChapter} />
    </AuthCard>
  );
}
