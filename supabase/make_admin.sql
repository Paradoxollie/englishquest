-- Script pour rendre un utilisateur admin
-- Remplacez 'ollie' par le username exact de votre compte

-- Option 1: Si vous connaissez le username exact
UPDATE public.profiles
SET role = 'admin'
WHERE username = 'ollie';

-- Option 2: Si vous connaissez l'email
-- UPDATE public.profiles
-- SET role = 'admin'
-- WHERE email = 'votre-email@example.com';

-- Option 3: Si vous connaissez l'ID utilisateur (UUID)
-- UPDATE public.profiles
-- SET role = 'admin'
-- WHERE id = 'votre-uuid-ici';

-- Vérifier que la mise à jour a fonctionné
SELECT id, username, email, role 
FROM public.profiles 
WHERE username = 'ollie';


