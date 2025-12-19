-- Table pour le tracking des visiteurs du site
-- Run this script in the Supabase SQL Editor
-- 
-- Cette table enregistre toutes les visites sur le site pour permettre
-- l'analyse des statistiques de trafic (visiteurs uniques, totaux, par jour)

begin;

-- Table des visites du site
create table if not exists public.site_visits (
  id uuid primary key default gen_random_uuid(),
  -- Hash de l'IP pour identifier les visiteurs uniques (privacy-friendly)
  visitor_hash text not null,
  -- User-Agent pour identifier les navigateurs
  user_agent text,
  -- URL visitée
  path text not null,
  -- Date de la visite (normalisée à minuit UTC pour le regroupement par jour)
  visit_date date not null default timezone('utc', now())::date,
  -- Timestamp exact de la visite
  visited_at timestamptz not null default timezone('utc', now()),
  -- ID utilisateur si connecté (peut être null pour les visiteurs anonymes)
  user_id uuid references auth.users (id) on delete set null,
  -- Pays (optionnel, peut être ajouté plus tard via Vercel Analytics)
  country text,
  -- Référent (d'où vient le visiteur)
  referrer text
);

-- Index pour améliorer les performances des requêtes
create index if not exists idx_site_visits_visit_date on public.site_visits(visit_date desc);
create index if not exists idx_site_visits_visitor_hash on public.site_visits(visitor_hash);
create index if not exists idx_site_visits_visited_at on public.site_visits(visited_at desc);
create index if not exists idx_site_visits_user_id on public.site_visits(user_id) where user_id is not null;
create index if not exists idx_site_visits_path on public.site_visits(path);

-- Index composite pour les requêtes de visiteurs uniques par jour
create index if not exists idx_site_visits_unique_daily on public.site_visits(visit_date, visitor_hash);

-- RLS : Seuls les admins peuvent voir les statistiques
alter table public.site_visits enable row level security;

-- Policy : Tout le monde peut insérer des visites (pour le tracking)
drop policy if exists "Anyone can insert site visits" on public.site_visits;
create policy "Anyone can insert site visits"
on public.site_visits
for insert
with check (true);

-- Policy : Seuls les admins peuvent voir les visites
drop policy if exists "Admins can view site visits" on public.site_visits;
create policy "Admins can view site visits"
on public.site_visits
for select
using (
  exists (
    select 1 from public.profiles
    where id = auth.uid()
      and role = 'admin'
  )
);

-- Fonction pour obtenir les statistiques de visiteurs
-- Cette fonction peut être utilisée pour des requêtes optimisées
create or replace function public.get_visitor_stats(
  start_date date default null,
  end_date date default null
)
returns table (
  visit_date date,
  unique_visitors bigint,
  total_visits bigint
)
language plpgsql
security definer
as $$
begin
  return query
  select 
    sv.visit_date,
    count(distinct sv.visitor_hash) as unique_visitors,
    count(*) as total_visits
  from public.site_visits sv
  where 
    (start_date is null or sv.visit_date >= start_date)
    and (end_date is null or sv.visit_date <= end_date)
  group by sv.visit_date
  order by sv.visit_date desc;
end;
$$;

-- Fonction pour obtenir le total de visiteurs uniques
create or replace function public.get_total_unique_visitors()
returns bigint
language plpgsql
security definer
as $$
declare
  result bigint;
begin
  select count(distinct visitor_hash) into result
  from public.site_visits;
  return result;
end;
$$;

-- Fonction pour obtenir le total de visites
create or replace function public.get_total_visits()
returns bigint
language plpgsql
security definer
as $$
declare
  result bigint;
begin
  select count(*) into result
  from public.site_visits;
  return result;
end;
$$;

commit;

