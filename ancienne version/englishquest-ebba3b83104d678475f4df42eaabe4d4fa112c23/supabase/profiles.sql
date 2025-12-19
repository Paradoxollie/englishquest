-- Run this script in the Supabase SQL Editor or by using the CLI:
--   supabase db push --file supabase/profiles.sql
-- The CLI command runs all statements inside your linked Supabase project.

begin;

create extension if not exists "uuid-ossp";
create extension if not exists "citext";
create extension if not exists "pgcrypto";

-- Créer la table profiles si elle n'existe pas
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  username citext not null unique,
  role text not null default 'student' check (role in ('student', 'teacher', 'admin')),
  xp integer not null default 0,
  gold integer not null default 0,
  level integer not null default 1,
  avatar_id uuid null,
  email text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

-- Migration : Ajouter la colonne email si elle n'existe pas déjà
do $$
begin
  if not exists (
    select 1 
    from information_schema.columns 
    where table_schema = 'public' 
    and table_name = 'profiles' 
    and column_name = 'email'
  ) then
    alter table public.profiles add column email text;
  end if;
end $$;

create or replace function public.set_current_timestamp_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

drop trigger if exists set_updated_at on public.profiles;
create trigger set_updated_at
before update on public.profiles
for each row
execute procedure public.set_current_timestamp_updated_at();

alter table public.profiles enable row level security;

drop policy if exists "Users can view own profile" on public.profiles;
create policy "Users can view own profile"
on public.profiles
for select
using (auth.uid() = id);

drop policy if exists "Users can update own profile" on public.profiles;
create policy "Users can update own profile"
on public.profiles
for update
using (auth.uid() = id)
with check (auth.uid() = id);

drop policy if exists "Admins can update any profile" on public.profiles;
create policy "Admins can update any profile"
on public.profiles
for update
using (
  exists (
    select 1 from public.profiles me
    where me.id = auth.uid()
      and me.role = 'admin'
  )
)
with check (
  exists (
    select 1 from public.profiles me
    where me.id = auth.uid()
      and me.role = 'admin'
  )
);

drop policy if exists "Admins can list all profiles" on public.profiles;
create policy "Admins can list all profiles"
on public.profiles
for select
using (
  exists (
    select 1 from public.profiles me
    where me.id = auth.uid()
      and me.role = 'admin'
  )
);

-- Policy pour permettre aux utilisateurs d'insérer leur propre profil
-- (utile si le trigger échoue ou pour les migrations)
drop policy if exists "Users can insert own profile" on public.profiles;
create policy "Users can insert own profile"
on public.profiles
for insert
with check (auth.uid() = id);

-- Fonction handle_new_user pour créer automatiquement un profil lors de l'inscription
-- Cette fonction gère la normalisation des usernames et les conflits
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public, auth
as $$
declare
  v_username citext;
begin
  -- Récupère le username depuis les metadata ou génère-en un depuis l'email
  v_username := coalesce(
    new.raw_user_meta_data ->> 'username',
    split_part(new.email, '@', 1)
  );
  
  -- Nettoie le username : lowercase, remplace les caractères invalides par _
  v_username := lower(regexp_replace(v_username, '[^a-z0-9_]', '_', 'g'));
  
  -- Limite la longueur à 50 caractères
  v_username := substring(v_username from 1 for 50);
  
  -- Si le username est vide après nettoyage, génère un username par défaut
  if v_username is null or length(v_username) = 0 then
    v_username := 'user_' || substring(new.id::text from 1 for 8);
  end if;
  
  -- Insère le profil
  insert into public.profiles (id, username, role, email)
  values (
    new.id,
    v_username,
    coalesce(new.raw_user_meta_data ->> 'role', 'student'),
    new.email
  )
  on conflict (id) do update
  set email = excluded.email,
      username = excluded.username;
  return new;
exception
  when others then
    -- En cas d'erreur (ex: username déjà pris), génère un username unique
    v_username := 'user_' || substring(new.id::text from 1 for 8) || '_' || substring(gen_random_uuid()::text from 1 for 4);
    insert into public.profiles (id, username, role, email)
    values (
      new.id,
      v_username,
      coalesce(new.raw_user_meta_data ->> 'role', 'student'),
      new.email
    )
    on conflict (id) do update
    set email = excluded.email,
        username = excluded.username;
    return new;
end;
$$;

-- Créer le trigger qui appelle la fonction lors de la création d'un utilisateur
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute procedure public.handle_new_user();

commit;

