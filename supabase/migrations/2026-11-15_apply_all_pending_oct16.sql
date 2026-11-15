-- Consolidated idempotent migration for EnglishQuest production Supabase
-- Combines unapplied migrations from 2026-10-16 (excluding teacher classes):
--   - 2026-10-16_01_cleanup.sql
--   - 2026-10-16_10_xp_events.sql
--   - 2026-10-16_11_badges.sql
--   - 2026-10-16_12_starter_shop.sql
--   - 2026-10-16_13_course_practice.sql
--   - 2026-10-16_20_game_sessions.sql
-- Safe to run in Supabase SQL Editor and safe to re-run.

-- 1. Ghost games cleanup (2025 placeholders not present in active catalog)
delete from public.game_scores
where game_id in (
  select id from public.games
  where slug in ('brew-your-words', 'echoes-of-lexicon', 'arcane-listening-trials')
);
delete from public.games
where slug in ('brew-your-words', 'echoes-of-lexicon', 'arcane-listening-trials');

-- 2. Legacy unrelated project tables cleanup
drop table if exists public.marvel_combat_logs cascade;
drop table if exists public.marvel_character_skills cascade;
drop table if exists public.marvel_character_inventory cascade;
drop table if exists public.marvel_character_progress cascade;
drop table if exists public.marvel_characters cascade;
drop table if exists public.marvel_skills cascade;
drop table if exists public.marvel_items cascade;
drop table if exists public.marvel_zones cascade;
drop table if exists public.ship_skins cascade;
drop function if exists public.update_ship_skins_updated_at() cascade;
drop function if exists public.ensure_single_default_ship_skin() cascade;

-- 3. Lock search_path on existing public helper functions if unset
do $$
declare
  fn record;
begin
  for fn in
    select p.oid::regprocedure as signature
    from pg_proc p
    join pg_namespace n on n.oid = p.pronamespace
    where n.nspname = 'public'
      and p.proname in (
        'update_shop_items_updated_at', 'update_user_equipped_items_updated_at', 'is_admin',
        'set_current_timestamp_updated_at', 'get_total_visits', 'get_visitor_stats',
        'set_contact_message_updated_at', 'get_total_unique_visitors'
      )
      and (p.proconfig is null or not exists (select 1 from unnest(p.proconfig) c where c like 'search_path=%'))
  loop
    execute format('alter function %s set search_path = public', fn.signature);
  end loop;
end;
$$;

-- 4. Clean synthetic headless/localhost test visits
delete from public.site_visits
where user_agent ilike '%headless%'
   or user_agent ilike '%playwright%'
   or referrer ilike '%localhost%'
   or referrer ilike '%127.0.0.1%';

-- 5. XP events history & weekly XP league
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

-- 6. User badges table
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

revoke all on table public.user_badges from public, anon;
revoke insert, update, delete, truncate, references, trigger on table public.user_badges from authenticated;
grant select on table public.user_badges to authenticated;

-- 7. Starter shop accessibility & titles
update public.shop_items
set required_level = 1, updated_at = now()
where item_key = 'title_student';

update public.shop_items
set required_level = 1, price_gold = 20, updated_at = now()
where item_key in ('bg_forest', 'bg_ocean');

update public.shop_items
set required_level = 2, price_gold = 40, updated_at = now()
where item_key in ('avatar_warrior', 'avatar_mage');

insert into public.shop_items (
  item_type, name, description, item_key, price_gold, required_level,
  display_order, image_url, color_theme, is_active, is_public
)
select
  'title',
  item.name,
  item.description,
  item.item_key,
  item.price_gold,
  item.required_level,
  last_title.display_order + item.position,
  null,
  null,
  true,
  true
from (
  values
    (1, 'title_apprentice', 'Apprenti', 'Tes premiers pas en anglais.', 10, 1),
    (2, 'title_explorer', 'Explorateur', 'Tu as pris la route de l''aventure.', 20, 2),
    (3, 'title_grammarian', 'Grammairien', 'Les règles n''ont plus de secret pour toi.', 40, 4),
    (4, 'title_polyglot', 'Polyglotte en herbe', 'L''anglais aujourd''hui, d''autres langues demain.', 60, 6)
) as item (position, item_key, name, description, price_gold, required_level)
cross join (
  select coalesce(max(display_order), 0) as display_order
  from public.shop_items
  where item_type = 'title'
) as last_title
on conflict (item_key) do nothing;

-- 8. Course targeted practice (3rd star)
create table if not exists public.course_practice (
  user_id uuid not null references auth.users (id) on delete cascade,
  course_id integer not null check (course_id between 1 and 500),
  best_focus_correct integer not null default 0 check (best_focus_correct >= 0),
  updated_at timestamptz not null default now(),
  primary key (user_id, course_id)
);

alter table public.course_practice enable row level security;

drop policy if exists "course_practice_select_own" on public.course_practice;
create policy "course_practice_select_own"
  on public.course_practice for select
  to authenticated
  using ((select auth.uid()) = user_id);

revoke all on table public.course_practice from public, anon;
revoke insert, update, delete, truncate, references, trigger on table public.course_practice from authenticated;
grant select on table public.course_practice to authenticated;

create or replace function public.record_course_practice(
  p_user_id uuid,
  p_course_id integer,
  p_focus_correct integer
)
returns jsonb
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_previous integer;
  v_best integer;
begin
  if p_user_id is null or p_course_id is null or p_focus_correct is null
    or p_course_id not between 1 and 500 or p_focus_correct < 0 or p_focus_correct > 60 then
    raise exception 'Invalid course practice result' using errcode = '22023';
  end if;

  select best_focus_correct into v_previous
  from public.course_practice
  where user_id = p_user_id and course_id = p_course_id
  for update;

  insert into public.course_practice (user_id, course_id, best_focus_correct, updated_at)
  values (p_user_id, p_course_id, p_focus_correct, now())
  on conflict (user_id, course_id) do update
    set best_focus_correct = greatest(public.course_practice.best_focus_correct, excluded.best_focus_correct),
        updated_at = case
          when excluded.best_focus_correct > public.course_practice.best_focus_correct then now()
          else public.course_practice.updated_at
        end
  returning best_focus_correct into v_best;

  return jsonb_build_object('previousBest', coalesce(v_previous, 0), 'best', v_best);
end;
$$;

revoke all on function public.record_course_practice(uuid, integer, integer) from public, anon, authenticated;
grant execute on function public.record_course_practice(uuid, integer, integer) to service_role;

-- 9. Server-validated game sessions
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

-- 10. Reload PostgREST schema cache immediately
notify pgrst, 'reload schema';
