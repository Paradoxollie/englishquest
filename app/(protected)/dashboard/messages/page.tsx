import { redirect } from "next/navigation";
import { loginForCurrentPage } from "@/lib/navigation/login-return";
import { PageHead } from "@/components/comic/page-head";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { isAdmin } from "@/lib/auth/roles";
import { threadColumns } from "@/lib/contact/conversation";
import { DashboardNav } from "../dashboard-nav";
import { MessageList, type AdminContact } from "./message-list";

export const dynamic = "force-dynamic";

export default async function MessagesPage({ searchParams }: { searchParams: Promise<{ message?: string }> }) {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect(await loginForCurrentPage("/dashboard/messages"));
  if (!(await isAdmin())) redirect("/");
  const { message } = await searchParams;
  const { data, error } = await createSupabaseAdminClient().from("contact_messages")
    .select(`name, email, user_id, read, guest_receipt_issued, ${threadColumns}`).order("updated_at", { ascending: false });
  return <div>
    <PageHead caption="Administration" title="Messages de contact">Retrouve les demandes et poursuis chaque échange depuis le site.</PageHead>
    <div className="eq-container eq-section">
      <DashboardNav />
      {error ? <p className="eq-card p-5" role="alert">La boîte de réception est momentanément indisponible.</p>
        : <MessageList messages={(data ?? []) as AdminContact[]} initialId={message} />}
    </div>
  </div>;
}
