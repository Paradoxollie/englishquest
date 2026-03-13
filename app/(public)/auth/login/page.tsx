import { AuthCard } from "@/components/auth/auth-card";
import { LoginForm } from "@/components/auth/login-form";

export const metadata = {
  title: "Log in | EnglishQuest",
};

export default function LoginPage() {
  return (
    <AuthCard
      title="Reprends ton aventure"
      subtitle="Connecte-toi pour retrouver ton parcours, tes jeux et ta progression."
      footerHint="Pas encore de compte ?"
      footerLinkLabel="S'inscrire"
      footerHref="/auth/signup"
    >
      <LoginForm />
    </AuthCard>
  );
}
