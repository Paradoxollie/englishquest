-- Rename "Echo Lex" to "Flashback" in the database so the Leaderboard displays it correctly
UPDATE public.games
SET name = 'Flashback'
WHERE slug = 'echo-lex';

-- Verify the change
SELECT * FROM public.games WHERE slug = 'echo-lex';
