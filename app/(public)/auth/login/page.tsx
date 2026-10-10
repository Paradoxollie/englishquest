import { AuthCard } from "@/components/auth/auth-card";
import { LoginForm } from "@/components/auth/login-form";

export const metadata = {
  title: "Se connecter",
};

export default function LoginPage() {
  return (
    <AuthCard
      title="Se connecter"
      subtitle="Retrouve ta carte, tes scores et ta progression."
      footerHint="Pas encore de compte ?"
      footerLinkLabel="Créer un compte"
      footerHref="/auth/signup"
    >
      <LoginForm />
    </AuthCard>
  );
}
