# Tech Stack – EnglishQuest

Always use:

- Next.js (App Router) with TypeScript in the `app/` directory.
- Tailwind CSS for styling.
- Supabase for:
  - Postgres database
  - Authentication (email + password, but the main visible field is the pseudonym)
  - Row-Level Security on all tables

Hosting:
- Host the Next.js app on Vercel (Hobby / free plan).
- Use Supabase free tier for database and auth, with an EU region.

Environment variables:
- NEXT_PUBLIC_SUPABASE_URL
- NEXT_PUBLIC_SUPABASE_ANON_KEY
- SUPABASE_SERVICE_ROLE_KEY (server-side only, never in the browser)

Data model (at least):
- profiles (user id, username/pseudonym, role, xp, gold, level, avatar_id, created_at)
- levels and user_levels (locked/unlocked/completed, best_score)
- games and game_scores
- avatars and user_avatars
- achievements and user_achievements
- daily_challenges and user_daily_challenges
- teacher_resources

When generating code:
- Provide a `createClient` helper for Supabase in both server and client contexts.
- Use RLS-safe queries (filter on `auth.uid()` when appropriate).
- Keep the file structure clean: `app/(public)`, `app/(protected)`, `app/(admin)` if needed.
