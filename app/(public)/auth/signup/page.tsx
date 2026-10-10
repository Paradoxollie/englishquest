import { AuthCard } from "@/components/auth/auth-card";
import { SignupForm } from "@/components/auth/signup-form";

export const metadata = {
  title: "Créer un compte",
};

export default function SignupPage() {
  return (
    <AuthCard
      title="Créer un compte"
      subtitle="Gratuit. Un pseudo, un mot de passe, et la carte s'ouvre."
      footerHint="Tu as déjà un compte ?"
      footerLinkLabel="Se connecter"
      footerHref="/auth/login"
    >
      <SignupForm />
    </AuthCard>
  );
}
