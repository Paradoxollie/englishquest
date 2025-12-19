-- Table pour les messages de contact
-- Run this script in the Supabase SQL Editor

begin;

-- Table des messages de contact
create table if not exists public.contact_messages (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  subject text not null,
  message text not null,
  read boolean not null default false,
  replied boolean not null default false,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

-- Index pour améliorer les performances
create index if not exists idx_contact_messages_read on public.contact_messages(read);
create index if not exists idx_contact_messages_created_at on public.contact_messages(created_at desc);

-- Fonction pour mettre à jour updated_at
create or replace function public.set_contact_message_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

-- Trigger pour updated_at
drop trigger if exists set_updated_at_contact_messages on public.contact_messages;
create trigger set_updated_at_contact_messages
before update on public.contact_messages
for each row
execute procedure public.set_contact_message_updated_at();

-- RLS : Seuls les admins peuvent voir les messages
alter table public.contact_messages enable row level security;

-- Policy : Tout le monde peut insérer des messages
drop policy if exists "Anyone can insert contact messages" on public.contact_messages;
create policy "Anyone can insert contact messages"
on public.contact_messages
for insert
with check (true);

-- Policy : Seuls les admins peuvent voir les messages
drop policy if exists "Admins can view contact messages" on public.contact_messages;
create policy "Admins can view contact messages"
on public.contact_messages
for select
using (
  exists (
    select 1 from public.profiles
    where id = auth.uid()
      and role = 'admin'
  )
);

-- Policy : Seuls les admins peuvent mettre à jour les messages
drop policy if exists "Admins can update contact messages" on public.contact_messages;
create policy "Admins can update contact messages"
on public.contact_messages
for update
using (
  exists (
    select 1 from public.profiles
    where id = auth.uid()
      and role = 'admin'
  )
)
with check (
  exists (
    select 1 from public.profiles
    where id = auth.uid()
      and role = 'admin'
  )
);

-- Policy : Seuls les admins peuvent supprimer les messages
drop policy if exists "Admins can delete contact messages" on public.contact_messages;
create policy "Admins can delete contact messages"
on public.contact_messages
for delete
using (
  exists (
    select 1 from public.profiles
    where id = auth.uid()
      and role = 'admin'
  )
);

commit;


