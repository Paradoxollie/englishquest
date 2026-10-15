import { AuthCard } from "@/components/auth/auth-card";
import { LoginForm } from "@/components/auth/login-form";
import { getSafeNextPath, withNextParam } from "@/lib/navigation/safe-next";

export const metadata = {
  title: "Se connecter",
};

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ next?: string | string[] }> }) {
  const params = await searchParams;
  const next = getSafeNextPath(Array.isArray(params.next) ? params.next[0] : params.next);

  return (
    <AuthCard
      title="Se connecter"
      subtitle={
        next?.startsWith("/rejoindre")
          ? "Connecte-toi, puis tu rejoins ta classe."
          : "Retrouve ta carte, tes scores et ta progression."
      }
      footerHint="Pas encore de compte ?"
      footerLinkLabel="Créer un compte"
      footerHref={withNextParam("/auth/signup", next)}
    >
      <LoginForm next={next} />
    </AuthCard>
  );
}
