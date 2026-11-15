import { AuthCard } from "@/components/auth/auth-card";
import { SignupForm } from "@/components/auth/signup-form";
import { getSafeNextPath, withNextParam } from "@/lib/navigation/safe-next";

export const metadata = {
  title: "Créer un compte",
};

export default async function SignupPage({ searchParams }: { searchParams: Promise<{ next?: string | string[] }> }) {
  const params = await searchParams;
  // Retour prévu après l'inscription (par exemple /rejoindre?code=... pour une classe).
  const next = getSafeNextPath(Array.isArray(params.next) ? params.next[0] : params.next);

  return (
    <AuthCard
      title="Créer un compte"
      subtitle={
        next?.startsWith("/rejoindre")
          ? "Crée ton compte, puis tu rejoins ta classe. Tu as déjà un compte ? Connecte-toi en bas."
          : "Gratuit. Un pseudo, un mot de passe, et la carte s'ouvre."
      }
      footerHint="Tu as déjà un compte ?"
      footerLinkLabel="Se connecter"
      footerHref={withNextParam("/auth/login", next)}
    >
      <SignupForm next={next} />
    </AuthCard>
  );
}
