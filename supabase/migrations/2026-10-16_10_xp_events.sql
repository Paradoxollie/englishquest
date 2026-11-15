-- Historique de l'XP et ligue de la semaine. Rejouable sans dégât.
--
-- Chaque hausse de profiles.xp (partie, mission, examen, défi du jour) laisse
-- une ligne dans xp_events. La ligue additionne les lignes depuis lundi 00:00
-- (heure de Paris, calculée par le serveur du site). Les baisses ne sont pas
-- enregistrées. Aucun accès depuis le navigateur : le serveur lit avec la clé
-- service.

create table if not exists public.xp_events (
  id bigserial primary key,
  user_id uuid not null references auth.users (id) on delete cascade,
  delta integer not null check (delta > 0),
  created_at timestamptz not null default now()
);

create index if not exists xp_events_created_at_user_id_idx
  on public.xp_events (created_at, user_id);

alter table public.xp_events enable row level security;
revoke all on table public.xp_events from public, anon, authenticated;
revoke all on sequence public.xp_events_id_seq from public, anon, authenticated;

-- Un échec d'historique ne doit jamais annuler une récompense : l'erreur est
-- signalée dans les journaux et la mise à jour du profil continue.
create or replace function public.record_xp_event()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if coalesce(new.xp, 0) > coalesce(old.xp, 0) then
    begin
      insert into public.xp_events (user_id, delta)
      values (new.id, coalesce(new.xp, 0) - coalesce(old.xp, 0));
    exception when others then
      raise warning 'record_xp_event: % (%)', sqlerrm, sqlstate;
    end;
  end if;
  return null;
end;
$$;

revoke all on function public.record_xp_event() from public, anon, authenticated;

drop trigger if exists profiles_record_xp_event on public.profiles;
create trigger profiles_record_xp_event
  after update of xp on public.profiles
  for each row
  when (new.xp is distinct from old.xp)
  execute function public.record_xp_event();

-- Classement de la semaine : les p_limit premiers, plus le joueur demandé
-- s'il est plus loin. À égalité, le premier arrivé à ce total passe devant.
create or replace function public.get_weekly_xp_league(
  p_since timestamptz,
  p_user_id uuid,
  p_limit integer default 20
)
returns table (user_id uuid, xp bigint, rank bigint, total_players bigint)
language sql
stable
security invoker
set search_path = ''
as $$
  with totals as (
    select e.user_id, sum(e.delta)::bigint as xp, max(e.created_at) as reached_at
    from public.xp_events e
    where e.created_at >= p_since
    group by e.user_id
  ),
  ranked as (
    select
      t.user_id,
      t.xp,
      row_number() over (order by t.xp desc, t.reached_at asc, t.user_id) as rank,
      count(*) over () as total_players
    from totals t
  )
  select r.user_id, r.xp, r.rank, r.total_players
  from ranked r
  where r.rank <= greatest(0, least(coalesce(p_limit, 20), 100))
     or r.user_id = p_user_id
  order by r.rank;
$$;

revoke all on function public.get_weekly_xp_league(timestamptz, uuid, integer) from public, anon, authenticated;
grant execute on function public.get_weekly_xp_league(timestamptz, uuid, integer) to service_role;
