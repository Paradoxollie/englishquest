-- Ménage du 16 octobre 2026. Rejouable sans dégât.
-- Sauvegarde des lignes supprimées : output/sauvegarde-tables-supprimees-2026-10-16.json
-- (dossier local de Pierre, hors dépôt : il contient des identifiants de comptes).

-- 1. Les trois jeux fantômes de 2025 (aucun score), que la migration
--    2026-10-10_01 n'avait pas retirés en production.
delete from public.game_scores
where game_id in (select id from public.games where slug in ('brew-your-words', 'echoes-of-lexicon', 'arcane-listening-trials'));
delete from public.games
where slug in ('brew-your-words', 'echoes-of-lexicon', 'arcane-listening-trials');

-- 2. Tables d'un ancien projet, jamais utilisées par le site.
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

-- 3. Chemin de recherche figé pour les fonctions signalées par Supabase.
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

-- 4. Visites enregistrées par des navigateurs automatiques (tests) ou par le
--    site lancé en local : elles faussaient les statistiques.
delete from public.site_visits
where user_agent ilike '%headless%'
   or user_agent ilike '%playwright%'
   or referrer ilike '%localhost%'
   or referrer ilike '%127.0.0.1%';
