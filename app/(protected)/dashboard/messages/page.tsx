import { redirect } from "next/navigation";
import { PageHead } from "@/components/comic/page-head";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { isAdmin } from "@/lib/auth/roles";
import { DashboardNav } from "../dashboard-nav";
import { MessageList } from "./message-list";

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";

export default async function MessagesPage() {
  try {
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

    const adminClient = createSupabaseAdminClient();
    let messages: any[] = [];

    try {
      const { data, error } = await adminClient
        .from("contact_messages")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        const errorCode = error.code || error.message || "";
        const errorMessage = error.message || "";

        if (
          errorCode === "42P01" ||
          errorCode === "PGRST116" ||
          errorMessage.includes("does not exist") ||
          errorMessage.includes("relation") ||
          errorMessage.includes("not found") ||
          Object.keys(error).length === 0
        ) {
          // Table absente en environnement vierge : tableau vide
        } else {
          console.error("Error fetching messages:", error);
        }
      } else {
        messages = data || [];

        if (messages.length > 0) {
          const repliedByUserIds = messages
            .map((m: any) => m.replied_by)
            .filter((id: string | null) => id !== null && id !== undefined);

          if (repliedByUserIds.length > 0) {
            const { data: profiles } = await adminClient
              .from("profiles")
              .select("id, username")
              .in("id", repliedByUserIds);

            const profilesMap = new Map(
              (profiles || []).map((p: any) => [p.id, p.username])
            );

            messages = messages.map((m: any) => ({
              ...m,
              profiles: m.replied_by
                ? { username: profilesMap.get(m.replied_by) || null }
                : null,
            }));
          }
        }
      }
    } catch (error) {
      console.error("Error in messages page:", error);
    }

    return (
      <div>
        <PageHead caption="Administration" title="Messages de contact">
          Consultez les messages reçus via le formulaire de contact et envoyez vos réponses directement.
        </PageHead>

        <div className="eq-container eq-section">
          <DashboardNav />
          <MessageList messages={messages || []} />
        </div>
      </div>
    );
  } catch (error) {
    if (error instanceof Error && error.message.includes("Supabase environment variables")) {
      return (
        <div>
          <PageHead caption="Administration" title="Messages de contact">
            Consultez les messages reçus via le formulaire de contact.
          </PageHead>
          <div className="eq-container eq-section">
            <DashboardNav />
            <MessageList messages={[]} />
          </div>
        </div>
      );
    }
    throw error;
  }
}
