-- Keep the original reply and its dates intact. Existing answered accounts get
-- a notice on their next visit. Old guest conversations gain a private receipt.
alter table public.contact_messages
  add column guest_receipt_key uuid not null default gen_random_uuid(),
  add column guest_receipt_issued boolean not null default false,
  add column reply_acknowledged_at timestamptz,
  add column reply_notice uuid default gen_random_uuid();
alter table public.contact_messages alter column reply_notice drop default;
-- Keep the old RLS-protected columns readable as before. The signing key and
-- delivery state are only used by the server.
revoke select on public.contact_messages from public, anon, authenticated;
grant select (id, name, email, subject, message, read, replied, created_at,
  updated_at, user_id, reply, replied_by, replied_at)
  on public.contact_messages to anon, authenticated;

create table public.contact_followups (
  id uuid primary key,
  message_id uuid not null references public.contact_messages(id) on delete cascade,
  author text not null check (author in ('team', 'sender')),
  body text not null check (length(btrim(body)) between 1 and 3000),
  created_at timestamptz not null default clock_timestamp()
);
create index contact_followups_message_time on public.contact_followups(message_id, created_at);
create index contact_pending_notices on public.contact_messages(user_id)
  where replied and reply_notice is not null and user_id is not null;
alter table public.contact_followups enable row level security;
revoke all on public.contact_followups from public, anon, authenticated;
grant select, insert on public.contact_followups to service_role;

-- The web server supplies the authenticated identity or the previously verified
-- guest receipt. Serialize the reply and its inbox notice in one transaction.
create function public.append_contact_followup(
  p_message_id uuid, p_request_id uuid, p_body text, p_team boolean,
  p_actor uuid, p_guest_key uuid
) returns text language plpgsql security invoker set search_path = '' as $$
declare
  thread public.contact_messages%rowtype;
  prior public.contact_followups%rowtype;
  author_kind text := case when p_team then 'team' else 'sender' end;
  body_text text := btrim(p_body);
begin
  if p_request_id is null or body_text is null or length(body_text) not between 1 and 3000 then
    return 'invalid';
  end if;
  select * into thread from public.contact_messages where id = p_message_id for update;
  if not found then return 'unavailable'; end if;
  if p_team then
    if not exists(select 1 from public.profiles where id = p_actor and role = 'admin') then return 'unavailable'; end if;
  elsif thread.user_id is not null then
    if p_actor is distinct from thread.user_id then return 'unavailable'; end if;
  elsif p_guest_key is distinct from thread.guest_receipt_key then
    return 'unavailable';
  end if;

  select * into prior from public.contact_followups where id = p_request_id;
  if found then
    if prior.message_id = thread.id and prior.author = author_kind and prior.body = body_text then return 'ok'; end if;
    return 'invalid';
  end if;
  if not p_team and (select count(*) from public.contact_followups
      where message_id = thread.id and author = 'sender' and created_at >= now() - interval '1 hour') >= 3 then
    return 'rate_limited';
  end if;

  insert into public.contact_followups(id, message_id, author, body) values(p_request_id, thread.id, author_kind, body_text);
  update public.contact_messages
    set read = p_team, replied = replied or p_team,
        reply_notice = case when p_team then p_request_id else reply_notice end,
        reply_acknowledged_at = case when p_team then null else reply_acknowledged_at end
    where id = thread.id;
  return 'ok';
end;
$$;
revoke all on function public.append_contact_followup(uuid,uuid,text,boolean,uuid,uuid) from public, anon, authenticated;
grant execute on function public.append_contact_followup(uuid,uuid,text,boolean,uuid,uuid) to service_role;
notify pgrst, 'reload schema';
