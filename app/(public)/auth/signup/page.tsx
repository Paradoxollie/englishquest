import { AuthCard } from "@/components/auth/auth-card";
import { SignupForm } from "@/components/auth/signup-form";

export const metadata = {
  title: "Sign up | EnglishQuest",
};

export default function SignupPage() {
  return (
    <AuthCard
      title="Cree ton profil"
      subtitle="Choisis un pseudo, definis ton mot de passe et entre dans l'univers English Quest."
      footerHint="Tu as deja un compte ?"
      footerLinkLabel="Se connecter"
      footerHref="/auth/login"
    >
      <SignupForm />
    </AuthCard>
  );
}
