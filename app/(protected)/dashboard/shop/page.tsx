import { redirect } from "next/navigation";
import { PageHead } from "@/components/comic/page-head";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { isAdmin } from "@/lib/auth/roles";
import { DashboardNav } from "../dashboard-nav";
import { ShopItemsManager } from "./shop-items-manager";

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";

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
    <div>
      <PageHead caption="Administration" title="Gestion de la boutique">
        Gérez les avatars, titres, arrière-plans et skins de vaisseau disponibles dans la boutique.
      </PageHead>

      <div className="eq-container eq-section">
        <DashboardNav />
        <ShopItemsManager />
      </div>
    </div>
  );
}
