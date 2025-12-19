-- Script pour ajouter le jeu Lexicon Blaster (Space Lex) dans la table games
-- Exécutez ce script dans le SQL Editor de Supabase

-- Ajouter le jeu (on conflict évite les duplications)
insert into public.games (slug, name, description, difficulty)
values
  (
    'space-lex',
    'Lexicon Blaster',
    'Tire sur les mots correspondant à la mission pour marquer des points ! Un jeu de shoot éducatif pour apprendre le vocabulaire anglais.',
    'medium'
  )
on conflict (slug) do nothing;

-- Vérifier que le jeu a été ajouté
select id, slug, name, difficulty
from public.games
where slug = 'space-lex';
