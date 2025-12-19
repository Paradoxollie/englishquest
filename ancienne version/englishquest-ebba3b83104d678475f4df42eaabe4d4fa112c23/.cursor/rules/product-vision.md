# Product Vision – EnglishQuest

You are coding "EnglishQuest", a FREE gamified website to help French middle and high school students learn English.

Main audiences:
- Students: create an account with a pseudonym and password, play games, earn XP and gold, unlock avatars and rewards, and progress through 50 structured quest levels (like a Candy Crush map).
- Teachers: access teaching resources, sequences, game ideas, and advice (free at first, maybe premium later).
- Admin (Pierre): manage content, users, rewards, levels, and teacher resources.

Hard constraints:
- The app must stay FREE to use for students and teachers and CHEAP to host for Pierre (use free tiers when possible).
- Only store minimal personal data: pseudonym, hashed password (via Supabase Auth), and gameplay stats. Email is optional for password reset.
- Comply with GDPR basics: minimal data collection, ability to delete an account, clear privacy notice, EU hosting when possible.
- Security is critical: do not expose secrets, always use Supabase Row-Level Security (RLS) and never expose the `service_role` key in the frontend.
- The site must work perfectly on mobile, tablet, and desktop, in both portrait and landscape orientation.

Core features:
- Auth: pseudonym + password (optional email).
- Student hub: `/play` for games with persistent scores and leaderboards, `/quest` for the 50-level path, `/profile` for avatar and stats.
- Gamification: XP, gold, levels, avatars, achievements, daily challenges, leaderboards.
- Teachers area: `/teachers` with resources.
- Admin area: `/dashboard` (only admin role).
