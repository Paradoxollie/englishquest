-- Boutique de départ : un premier achat possible dès la première séance.
-- Les nouveaux comptes reçoivent 30 or (WELCOME_GOLD, lib/profile/economy.ts).
-- Mises à jour et ajouts seulement, aucune suppression. Rejouable sans dégât.

-- Objets existants rendus accessibles plus tôt.
update public.shop_items
set required_level = 1, updated_at = now()
where item_key = 'title_student';

update public.shop_items
set required_level = 1, price_gold = 20, updated_at = now()
where item_key in ('bg_forest', 'bg_ocean');

update public.shop_items
set required_level = 2, price_gold = 40, updated_at = now()
where item_key in ('avatar_warrior', 'avatar_mage');

-- Quatre titres en texte, peu chers, rangés après les titres existants.
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
