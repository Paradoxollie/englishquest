-- Add Lexicon Blaster (Space Lex) to the games table
-- This enables the leaderboard system for this game

-- First, check if the game already exists
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM games WHERE slug = 'space-lex') THEN
    INSERT INTO games (slug, name, description) 
    VALUES (
      'space-lex', 
      'Lexicon Blaster', 
      'Tire sur les mots correspondant à la mission pour marquer des points ! Un jeu de shoot éducatif pour apprendre le vocabulaire anglais.'
    );
    RAISE NOTICE 'Game "Lexicon Blaster" added successfully!';
  ELSE
    RAISE NOTICE 'Game "Lexicon Blaster" already exists.';
  END IF;
END $$;

-- Verify the game was added
SELECT id, slug, name, description FROM games WHERE slug = 'space-lex';
