-- Script pour ajouter le jeu Wordfall dans la table games
-- Exécutez ce script dans le SQL Editor de Supabase si le jeu n'existe pas encore

-- Vérifier si le jeu existe déjà, sinon l'ajouter
insert into public.games (slug, name, description, difficulty)
values
  (
    'wordfall',
    'Wordfall',
    'Type falling words before they hit the ground. In free mode, invent as many valid words as you can!',
    'easy'
  )
on conflict (slug) do nothing;

-- Vérifier que le jeu a été ajouté
select id, slug, name, difficulty
from public.games
where slug = 'wordfall';

