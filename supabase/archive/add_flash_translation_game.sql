-- Script pour ajouter le jeu Flash Translation dans la table games
-- Exécutez ce script dans le SQL Editor de Supabase

-- Ajouter le jeu (on conflict évite les duplications)
insert into public.games (slug, name, description, difficulty)
values
  (
    'flash-translation',
    'Flash Translation',
    'Testez vos réflexes ! Trouvez la bonne traduction le plus vite possible dans ce défi de vitesse ultime.',
    'medium'
  )
on conflict (slug) do nothing;

-- Vérifier que le jeu a été ajouté
select id, slug, name, difficulty
from public.games
where slug = 'flash-translation';
