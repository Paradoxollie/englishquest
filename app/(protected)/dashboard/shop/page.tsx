import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { isAdmin } from "@/lib/auth/roles";
import Link from "next/link";
import { ShopItemsManager } from "./shop-items-manager";

export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';

export default async function ShopManagementPage() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  if (!(await isAdmin())) {
    redirect("/");
  }

  return (
    <section className="space-y-6 text-slate-200">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-white">Gestion de la Boutique</h2>
          <p className="text-sm text-slate-400">
            Gérez les avatars, titres et backgrounds disponibles dans la boutique
          </p>
        </div>
        <Link
          href="/dashboard"
          className="comic-button bg-slate-700 text-white px-4 py-2 font-bold hover:bg-slate-600"
        >
          Retour au Dashboard
        </Link>
      </div>

      <ShopItemsManager />
    </section>
  );
}

