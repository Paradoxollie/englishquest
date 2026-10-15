-- Sessions de partie (anti-triche de base). Rejouable sans dégât.
--
-- Chaque partie d'un joueur connecté ouvre une session côté serveur
-- (lib/games/game-session-server.ts). Un score n'est enregistré qu'avec une
-- session de ce joueur et de ce jeu, encore inutilisée, dont l'âge mesuré par
-- le serveur est compatible avec la durée annoncée ; la session est alors
-- marquée utilisée en une seule requête (update ... where used_at is null).
--
-- Aucun accès client : seules les actions serveur (rôle service) lisent et
-- écrivent cette table.

create table if not exists public.game_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  game_slug text not null,
  started_at timestamptz not null default now(),
  used_at timestamptz
);

create index if not exists game_sessions_user_started_idx
  on public.game_sessions (user_id, started_at);

alter table public.game_sessions enable row level security;

revoke all on table public.game_sessions from public, anon, authenticated;
