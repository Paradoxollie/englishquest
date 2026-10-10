-- Run this in Supabase SQL Editor to update the live game description
UPDATE public.games
SET description = 'Testez vos réflexes ! Trouvez la bonne traduction le plus vite possible dans ce défi de vitesse ultime.'
WHERE slug = 'flash-translation';
