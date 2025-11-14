import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { PromoteAdminForm } from "./promote-admin-form";

// Force dynamic rendering - this page requires authentication
export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';

export default async function PromoteAdminPage() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  // Vérifier le rôle actuel
  const { data: profile } = await supabase
    .from("profiles")
    .select("username, role")
    .eq("id", user.id)
    .maybeSingle();

  return (
    <section className="space-y-6 text-slate-200">
      <div>
        <h2 className="text-2xl font-semibold text-white">Promouvoir en Admin</h2>
        <p className="text-sm text-slate-400">
          Utilisez cette page pour promouvoir un utilisateur en admin. 
          <br />
          <strong className="text-amber-300">Attention :</strong> Cette fonctionnalité est temporaire et devrait être supprimée après la première promotion.
        </p>
      </div>

      <div className="rounded-2xl border border-white/10 bg-black/20 p-6">
        <div className="mb-4">
          <p className="text-sm text-slate-300">
            Votre compte actuel : <span className="font-semibold text-white">{profile?.username}</span>
            <br />
            Rôle actuel : <span className="font-semibold text-amber-300">{profile?.role}</span>
          </p>
        </div>

        <PromoteAdminForm />
      </div>
    </section>
  );
}

