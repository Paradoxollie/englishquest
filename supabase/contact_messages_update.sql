-- Mise à jour de la table contact_messages pour RGPD et système de réponse
-- Run this script in the Supabase SQL Editor
-- 
-- Cette migration :
-- 1. Lie les messages aux utilisateurs (user_id)
-- 2. Rend email et name optionnels (remplis depuis le profil)
-- 3. Ajoute les champs pour les réponses (reply, replied_by, replied_at)

begin;

-- Ajouter la colonne user_id si elle n'existe pas
do $$
begin
  if not exists (
    select 1 
    from information_schema.columns 
    where table_schema = 'public' 
    and table_name = 'contact_messages' 
    and column_name = 'user_id'
  ) then
    alter table public.contact_messages 
    add column user_id uuid references auth.users (id) on delete cascade;
  end if;
end $$;

-- Ajouter les colonnes pour les réponses si elles n'existent pas
do $$
begin
  if not exists (
    select 1 
    from information_schema.columns 
    where table_schema = 'public' 
    and table_name = 'contact_messages' 
    and column_name = 'reply'
  ) then
    alter table public.contact_messages 
    add column reply text;
  end if;
  
  if not exists (
    select 1 
    from information_schema.columns 
    where table_schema = 'public' 
    and table_name = 'contact_messages' 
    and column_name = 'replied_by'
  ) then
    alter table public.contact_messages 
    add column replied_by uuid references auth.users (id) on delete set null;
  end if;
  
  if not exists (
    select 1 
    from information_schema.columns 
    where table_schema = 'public' 
    and table_name = 'contact_messages' 
    and column_name = 'replied_at'
  ) then
    alter table public.contact_messages 
    add column replied_at timestamptz;
  end if;
end $$;

-- Rendre name et email optionnels (pour compatibilité avec les anciens messages)
do $$
begin
  alter table public.contact_messages 
  alter column name drop not null;
  
  alter table public.contact_messages 
  alter column email drop not null;
exception
  when others then
    -- Colonnes déjà optionnelles, on continue
    null;
end $$;

-- Index pour améliorer les performances
create index if not exists idx_contact_messages_user_id on public.contact_messages(user_id);
create index if not exists idx_contact_messages_replied on public.contact_messages(replied);
create index if not exists idx_contact_messages_replied_by on public.contact_messages(replied_by);

-- Mettre à jour les politiques RLS

-- Policy : Les utilisateurs authentifiés peuvent insérer leurs propres messages
drop policy if exists "Anyone can insert contact messages" on public.contact_messages;
drop policy if exists "Users can insert their own contact messages" on public.contact_messages;
create policy "Users can insert their own contact messages"
on public.contact_messages
for insert
with check (auth.uid() = user_id);

-- Policy : Les utilisateurs peuvent voir leurs propres messages
drop policy if exists "Users can view their own messages" on public.contact_messages;
create policy "Users can view their own messages"
on public.contact_messages
for select
using (auth.uid() = user_id);

-- Policy : Les admins peuvent voir tous les messages (déjà existante, on la garde)
-- La politique existante "Admins can view contact messages" reste active

-- Policy : Les admins peuvent mettre à jour tous les messages (déjà existante)
-- La politique existante "Admins can update contact messages" reste active

-- Policy : Les admins peuvent supprimer tous les messages (déjà existante)
-- La politique existante "Admins can delete contact messages" reste active

commit;

