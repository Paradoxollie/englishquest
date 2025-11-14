-- Script pour rendre le compte "Ollie" admin
-- Exécutez ce script dans le Supabase SQL Editor

UPDATE public.profiles
SET role = 'admin'
WHERE LOWER(username) = 'ollie';

-- Vérifier que la mise à jour a fonctionné
SELECT id, username, email, role, level, xp
FROM public.profiles 
WHERE LOWER(username) = 'ollie';


