-- Script pour ajouter le jeu Echo Lex dans la table games
-- Exécutez ce script dans le SQL Editor de Supabase

-- Ajouter le jeu (on conflict évite les duplications)
insert into public.games (slug, name, description, difficulty)
values
  (
    'echo-lex',
    'Echo Lex',
    'Mémorisez les mots et testez votre capacité à reconnaître ceux que vous avez déjà vus. Attention au chrono !',
    'medium'
  )
on conflict (slug) do nothing;

-- Vérifier que le jeu a été ajouté
select id, slug, name, difficulty
from public.games
where slug = 'echo-lex';
