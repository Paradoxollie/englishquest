-- Sauvegarder les titres déjà gagnés avant que les albums accueillent les recrues.
select public.grant_completed_shop_titles(p.id)
from public.profiles p
where exists (
  select 1 from public.user_items ui join public.shop_items s on s.id = ui.shop_item_id
  where ui.user_id = p.id and s.collection_key in ('enquete','studio','aurore')
);

-- Les clés restent stables pour les achats, l’équipement et les favoris existants.
-- Trois héros reprennent l’identifiant et les conditions d’obtention de leur édition historique.
insert into public.shop_items as existing
  (item_key, item_type, name, description, image_url, color_theme, price_gold, required_level,
   display_order, collection_key, is_public, is_active, is_collection_reward)
select key, 'avatar', label, story, '/art/personnages/' || slug || '-visage.webp', tone,
       gold, lvl, display, album, true, true, false
from (values
  ('eq_depart_maya','maya','Maya, la capitaine','Maya ouvre la marche. Depuis les quais, elle rassemble l’équipage pour sa première aventure.','amber',0,1,100,'depart'),
  ('eq_depart_sam','sam','Sam, le cartographe','Sam dessine les itinéraires de l’équipage. Il connaît déjà un raccourci pour traverser Londres.','blue',0,1,101,'depart'),
  ('eq_enquete_maya','alma','Alma, la messagère','Les courriers urgents du bureau voyagent dans sa besace. Demande-lui une adresse, elle déplie la ville entière.','green',25,1,110,'enquete'),
  ('eq_enquete_sam','basile','Basile, le limier','Ce détective aux longues oreilles écoute les témoins, sort sa loupe et retrouve le détail que tout le monde a manqué.','amber',40,3,111,'enquete'),
  ('avatar_warrior','brune','Brune, la gardienne des archives','Brune porte les clés des archives à la ceinture et leur porte blindée au bras. Un seul coup suffit pour annoncer son arrivée.','gold',40,2,115,'enquete'),
  ('eq_studio_maya','juno','Juno, la batteuse','Elle donne le départ à coups de baguettes. Au studio, même la pendule finit par suivre son rythme.','purple',60,5,120,'studio'),
  ('eq_studio_sam','k7','K7, le robot du son','Cet automate à cassettes capture les bruits de la rue et en tire des morceaux que personne d’autre ne pourrait jouer.','red',65,6,121,'studio'),
  ('avatar_ranger','rowan','Rowan, le pirate des ondes','Éclaireur des toits, Rowan déploie son aile entre les antennes pour porter le signal de Studio Minuit au-delà de Londres.','blue',50,5,126,'studio'),
  ('eq_aurore_maya','iona','Iona, la tisseuse d’aurores','D’un geste, Iona replie la lumière du nord comme un long ruban et en dessine un chemin sur la glace.','cyan',100,11,130,'aurore'),
  ('eq_aurore_sam','atlas','Atlas, le colosse polaire','Cet ours veille sur les passages du glacier. Les guides reconnaissent de loin ses épaules de cristal et sa corde orange.','cyan',120,13,131,'aurore'),
  ('avatar_dragon_warrior','silex','Silex, le dragon de cuivre','Ses cornes portent les marques des anciennes expéditions. Sous ses écailles de cuivre, une braise veille sur la banquise.','gold',100,10,136,'aurore'),
  ('eq_aurore_zenith','zenith','Zénith, la chimère astrale','Au dernier palier paraît Zénith. Quand ses ailes de papillon se déploient, on peut y lire la carte du ciel polaire.','purple',220,20,137,'aurore')
) as heroes(key,slug,label,story,tone,gold,lvl,display,album)
on conflict (item_key) do update set
  name = excluded.name, description = excluded.description, image_url = excluded.image_url,
  color_theme = excluded.color_theme, display_order = excluded.display_order, collection_key = excluded.collection_key,
  is_public = true, is_active = true, updated_at = now()
where existing.item_type = 'avatar' and existing.owner_user_id is null and
  (existing.name,existing.description,existing.image_url,existing.color_theme,existing.display_order,existing.collection_key,existing.is_public,existing.is_active)
    is distinct from (excluded.name,excluded.description,excluded.image_url,excluded.color_theme,excluded.display_order,excluded.collection_key,true,true);

-- Remplacer seulement les deux anciens choix gratuits. La bourse et les autres emplacements restent indépendants.
with replacements as (
  select old.id as old_id, starter.id as new_id, starter.image_url as new_face
  from (values ('avatar_default','eq_depart_sam'),('avatar_d_faut_femme_1763206735902','eq_depart_maya')) as pair(old_key,new_key)
  join public.shop_items old on old.item_key = pair.old_key and old.owner_user_id is null and old.item_type = 'avatar'
  join public.shop_items starter on starter.item_key = pair.new_key
), grant_starters as (
  insert into public.user_items(user_id,shop_item_id,price_paid)
    select ui.user_id,r.new_id,0 from public.user_items ui join replacements r on r.old_id=ui.shop_item_id
    union
    select worn.user_id,r.new_id,0 from public.user_equipped_items worn join replacements r on r.old_id=worn.equipped_avatar_id
    on conflict (user_id,shop_item_id) do nothing
), equip_starters as (
  update public.user_equipped_items worn set equipped_avatar_id=r.new_id
    from replacements r where worn.equipped_avatar_id=r.old_id
)
update public.shop_items old set image_url=r.new_face, updated_at=now()
  from replacements r where old.id=r.old_id and old.image_url is distinct from r.new_face;
