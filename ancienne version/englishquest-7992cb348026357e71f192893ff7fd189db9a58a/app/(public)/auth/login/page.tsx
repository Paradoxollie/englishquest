import { AuthCard } from "@/components/auth/auth-card";
import { LoginForm } from "@/components/auth/login-form";

export const metadata = {
  title: "Log in | EnglishQuest",
};

export default function LoginPage() {
  return (
    <AuthCard
      title="Welcome back"
      subtitle="Log in to continue your EnglishQuest adventure."
      footerHint="Need an account?"
      footerLinkLabel="Sign up"
      footerHref="/auth/signup"
    >
      <LoginForm />
    </AuthCard>
  );
}

