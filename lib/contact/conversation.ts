export type ContactEntry = {
  id: string;
  author: "team" | "sender";
  body: string;
  created_at: string;
};

export type ContactThread = {
  id: string;
  subject: string;
  message: string;
  created_at: string;
  reply: string | null;
  replied_at: string | null;
  replied: boolean;
  reply_notice: string | null;
  reply_acknowledged_at: string | null;
  contact_followups: ContactEntry[];
};

export const threadColumns = "id, subject, message, created_at, reply, replied_at, replied, reply_notice, reply_acknowledged_at, contact_followups(id, author, body, created_at)";

export function repliesInOrder(thread: ContactThread): ContactEntry[] {
  const followups = [...thread.contact_followups].sort((a, b) =>
    a.created_at.localeCompare(b.created_at) || a.id.localeCompare(b.id));
  return thread.reply ? [{
    id: thread.id, author: "team", body: thread.reply, created_at: thread.replied_at ?? thread.created_at,
  }, ...followups] : followups;
}

export function contactDate(value: string) {
  return new Date(value).toLocaleString("fr-FR", {
    dateStyle: "long", timeStyle: "short", timeZone: "Europe/Paris",
  });
}

export type ReplyResult = { success?: string; error?: string };
