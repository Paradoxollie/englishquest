import Link from "next/link";
import { redirect } from "next/navigation";
import { loginForCurrentPage } from "@/lib/navigation/login-return";
import { PageHead } from "@/components/comic/page-head";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { currentContactUser } from "@/lib/contact/server";
import { contactDate, threadColumns, type ContactThread } from "@/lib/contact/conversation";
import { ContactHistory } from "@/components/contact/thread";
import { ContactReplyForm } from "@/components/contact/reply-form";
import { ConfirmReading } from "@/components/contact/confirm-reading";
import { acknowledgeReply, replyFromAccount } from "./actions";

export const dynamic = "force-dynamic";

export default async function MyMessagesPage() {
  const userId = await currentContactUser();
  if (!userId) redirect(await loginForCurrentPage("/messages"));
  const { data, error } = await createSupabaseAdminClient().from("contact_messages")
    .select(threadColumns).eq("user_id", userId).order("updated_at", { ascending: false });
  const messages = (data ?? []) as ContactThread[];
  return <div>
    <PageHead caption="Support" title="Mes messages">Retrouve tes échanges avec l’équipe English Quest.</PageHead>
    <div className="eq-container eq-section grid gap-5">
      <Link href="/contact" className="eq-btn eq-btn-primary justify-self-start">Nouveau message</Link>
      {error ? <p role="alert" className="eq-card p-5">Ta boîte de réception est momentanément indisponible.</p>
        : !messages.length && <p className="eq-card p-5">Tu n’as pas encore envoyé de message depuis ce compte.</p>}
      {messages.map(thread => <article key={thread.id} className="eq-card grid min-w-0 gap-4 p-5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="eq-h3 break-words">{thread.subject}</h2>
          <span className="eq-chip">{thread.replied ? (thread.reply_notice ? "Réponse à consulter" : "Répondu") : "En attente"}</span>
        </div>
        <ContactHistory thread={thread} />
        {thread.reply_acknowledged_at && <p className="eq-muted text-sm">Tu as confirmé ta lecture le {contactDate(thread.reply_acknowledged_at)}.</p>}
        {thread.replied && thread.reply_notice && <ConfirmReading reference={thread.id} notice={thread.reply_notice} confirm={acknowledgeReply} />}
        <ContactReplyForm messageId={thread.id} send={replyFromAccount} />
      </article>)}
    </div>
  </div>;
}
