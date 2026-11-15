-- Appliquée en production le 15/11/2026.
-- Le site n'écrit jamais depuis le navigateur : toutes les écritures passent par des actions
-- serveur (clé service). On retire donc aux rôles publics les droits d'écriture qui permettaient,
-- par l'API REST et la clé publique, de s'offrir des objets de la boutique, de s'équiper d'objets
-- non achetés, de contourner les limites du formulaire de contact ou de remplir les visites.
revoke insert, update, delete, truncate on table
  public.user_items,
  public.user_equipped_items,
  public.contact_messages,
  public.site_visits,
  public.shop_items,
  public.games,
  public.chapter_exams,
  public.courses
from anon, authenticated;

-- Tables d'anciens prototypes (non utilisées), si elles existent encore.
do $$
declare
  t text;
begin
  foreach t in array array['ship_skins', 'marvel_characters', 'marvel_character_progress',
    'marvel_character_inventory', 'marvel_character_skills', 'marvel_combat_logs',
    'marvel_items', 'marvel_skills', 'marvel_zones']
  loop
    if to_regclass('public.' || t) is not null then
      execute format('revoke insert, update, delete, truncate on table public.%I from anon, authenticated', t);
    end if;
  end loop;
end;
$$;

-- Les scores des élèves (mineurs) ne sont plus lisibles par tout le monde : chacun lit les siens,
-- les classements sont calculés côté serveur et réservés aux joueurs connectés.
drop policy if exists "Leaderboard scores are viewable by everyone" on public.game_scores;

notify pgrst, 'reload schema';
