import Link from "next/link";
import { AuthCard } from "@/components/auth/auth-card";
import { ResetPasswordForm } from "@/components/auth/reset-password-form";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const metadata = {
  title: "Nouveau mot de passe",
};

export const dynamic = "force-dynamic";

export default async function ResetPasswordPage() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <AuthCard
      title="Nouveau mot de passe"
      subtitle={user ? "Choisis un mot de passe d'au moins 8 caractères." : "Le lien n'est plus valide."}
      footerHint="Besoin d'aide ?"
      footerLinkLabel="Nous écrire"
      footerHref="/contact"
    >
      {user ? (
        <ResetPasswordForm />
      ) : (
        <div className="grid gap-4">
          <p className="text-[var(--muted)]">
            Les liens de réinitialisation expirent vite et ne servent qu&apos;une fois. Demande-en un nouveau.
          </p>
          <Link href="/auth/forgot" className="eq-btn eq-btn-primary">
            Nouveau lien
          </Link>
        </div>
      )}
    </AuthCard>
  );
}
