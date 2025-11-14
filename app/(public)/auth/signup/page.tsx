import { AuthCard } from "@/components/auth/auth-card";
import { SignupForm } from "@/components/auth/signup-form";

export const metadata = {
  title: "Sign up | EnglishQuest",
};

export default function SignupPage() {
  return (
    <AuthCard
      title="Create your hero"
      subtitle="Pick a pseudonym, choose a password, and start earning XP."
      footerHint="Already have an account?"
      footerLinkLabel="Log in"
      footerHref="/auth/login"
    >
      <SignupForm />
    </AuthCard>
  );
}

