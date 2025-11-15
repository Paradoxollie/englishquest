import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { isAdmin } from "@/lib/auth/roles";
import { markMessageAsReadAction, deleteMessageAction } from "./actions";
import { MessageList } from "./message-list";

// Force dynamic rendering - this page requires authentication and admin role
export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';

export default async function MessagesPage() {
  // During build, Next.js may try to collect page data even for dynamic pages
  // We need to handle the case where Supabase env vars are not available
  try {
    const supabase = await createSupabaseServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      redirect("/auth/login");
    }

    // Vérifier que l'utilisateur est admin
    if (!(await isAdmin())) {
      redirect("/");
    }

    // Récupérer tous les messages avec le client admin
    const adminClient = createSupabaseAdminClient();
    let messages = [];
    
    try {
      const { data, error } = await adminClient
        .from("contact_messages")
        .select("*, profiles!contact_messages_replied_by_fkey(username)")
        .order("created_at", { ascending: false });

      if (error) {
        // Si la table n'existe pas encore, on ignore l'erreur
        const errorCode = error.code || error.message || "";
        const errorMessage = error.message || "";
        
        if (
          errorCode === "42P01" || 
          errorMessage.includes("does not exist") ||
          errorMessage.includes("relation") ||
          Object.keys(error).length === 0 // Objet vide = probablement table inexistante
        ) {
          // Table n'existe pas encore, on continue avec un tableau vide
          // Pas besoin de logger
        } else {
          console.error("Error fetching messages:", error);
        }
      } else {
        messages = data || [];
      }
    } catch (error) {
      // Table n'existe pas encore ou autre erreur, on continue avec un tableau vide
      // Pas besoin de logger
    }

    return (
      <section className="space-y-6 text-slate-200">
        <div>
          <h2 className="text-2xl font-bold text-white">Messages de Contact</h2>
          <p className="text-sm text-slate-400 font-semibold">
            Gérez les messages envoyés par les utilisateurs via le formulaire de contact
          </p>
        </div>

        <MessageList messages={messages || []} />
      </section>
    );
  } catch (error) {
    // During build, Supabase env vars may not be available
    // This is expected for dynamic pages - they will be rendered at request time
    if (error instanceof Error && error.message.includes("Supabase environment variables")) {
      // Return a minimal page structure that will be replaced at request time
      return (
        <section className="space-y-6 text-slate-200">
          <div>
            <h2 className="text-2xl font-bold text-white">Messages de Contact</h2>
            <p className="text-sm text-slate-400 font-semibold">
              Gérez les messages envoyés par les utilisateurs via le formulaire de contact
            </p>
          </div>
          <MessageList messages={[]} />
        </section>
      );
    }
    // Re-throw other errors
    throw error;
  }
}

