-- Badges obtenus par les joueurs. Rejouable sans dégât.
--
-- Les définitions (nom, condition, rang) vivent dans le code :
-- lib/profile/badges.ts. Une ligne = un badge obtenu, avec sa date.
-- Le serveur du site attribue les badges (clé service) ; le joueur peut
-- seulement lire les siens.

create table if not exists public.user_badges (
  user_id uuid not null references auth.users (id) on delete cascade,
  badge_key text not null check (char_length(badge_key) between 1 and 64),
  earned_at timestamptz not null default now(),
  primary key (user_id, badge_key)
);

create index if not exists user_badges_user_earned_idx
  on public.user_badges (user_id, earned_at desc);

alter table public.user_badges enable row level security;

drop policy if exists "user_badges_select_own" on public.user_badges;
create policy "user_badges_select_own"
  on public.user_badges for select
  to authenticated
  using ((select auth.uid()) = user_id);

-- Lecture de ses propres badges seulement ; aucune écriture depuis le navigateur.
revoke all on table public.user_badges from public, anon;
revoke insert, update, delete, truncate, references, trigger on table public.user_badges from authenticated;
grant select on table public.user_badges to authenticated;
