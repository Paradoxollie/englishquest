-- Script pour ajouter le jeu Speed Verb Challenge dans la table games
-- Exécutez ce script dans le SQL Editor de Supabase si le jeu n'existe pas encore

-- Vérifier si le jeu existe déjà, sinon l'ajouter
insert into public.games (slug, name, description, difficulty)
values
  (
    'speed-verb-challenge',
    'Speed Verb Challenge',
    'Conjuguez les verbes irréguliers anglais le plus rapidement possible. Testez votre vitesse et votre mémoire avec ce défi chronométré.',
    'medium'
  )
on conflict (slug) do nothing;

-- Vérifier que le jeu a été ajouté
select id, slug, name, difficulty
from public.games
where slug = 'speed-verb-challenge';

