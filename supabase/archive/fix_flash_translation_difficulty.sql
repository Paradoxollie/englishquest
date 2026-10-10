-- Fix missing difficulty for flash-translation scores
UPDATE game_scores
SET difficulty = 'medium'
WHERE game_id = (SELECT id FROM games WHERE slug = 'flash-translation')
  AND difficulty IS NULL;
