import { AuthCard } from "@/components/auth/auth-card";
import { ForgotPasswordForm } from "@/components/auth/forgot-password-form";

export const metadata = {
  title: "Mot de passe oublié",
};

export default async function ForgotPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ erreur?: string }>;
}) {
  const params = await searchParams;
  return (
    <AuthCard
      title="Mot de passe oublié"
      subtitle="On t'envoie un lien pour en choisir un nouveau."
      footerHint="Tu t'en souviens finalement ?"
      footerLinkLabel="Se connecter"
      footerHref="/auth/login"
    >
      <ForgotPasswordForm expiredLink={params.erreur === "lien"} />
    </AuthCard>
  );
}
