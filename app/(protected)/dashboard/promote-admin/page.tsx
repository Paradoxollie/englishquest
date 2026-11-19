import { redirect } from "next/navigation";
import { loginForCurrentPage } from "@/lib/navigation/login-return";
import { PageHead } from "@/components/comic/page-head";
import { isAdmin } from "@/lib/auth/roles";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { DashboardNav } from "../dashboard-nav";
import { PromoteAdminForm } from "./promote-admin-form";

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";

export default async function PromoteAdminPage() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(await loginForCurrentPage("/dashboard/promote-admin"));
  }

  const canManageAdmins = await isAdmin();

  if (!canManageAdmins) {
    redirect("/dashboard");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("username, role")
    .eq("id", user.id)
    .maybeSingle();

  return (
    <div>
      <PageHead caption="Administration" title="Promouvoir en admin">
        Page réservée aux administrateurs. Promouvoir un compte accorde immédiatement les droits complets sur le back-office.
      </PageHead>

      <div className="eq-container eq-section">
        <DashboardNav />

        <div className="eq-card max-w-2xl p-6 space-y-5">
          <div className="eq-inset p-4 text-sm space-y-1">
            <p>
              Votre compte actuel : <b>{profile?.username}</b>
            </p>
            <p className="eq-muted">
              Rôle actuel : <span className="eq-chip eq-chip-gold-soft">{profile?.role}</span>
            </p>
          </div>

          <PromoteAdminForm />
        </div>
      </div>
    </div>
  );
}
