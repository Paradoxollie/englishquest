# Security and GDPR – EnglishQuest

Security rules:
- Never commit secrets (Supabase service_role key, API keys) to the frontend or to the public repo.
- Use only NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in the browser.
- Use the SUPABASE_SERVICE_ROLE_KEY only in secure server-side contexts (API routes, edge functions) if absolutely necessary.
- Always enable Row-Level Security (RLS) on Supabase tables that store user data.
- RLS policies must enforce that users can only read and write their own records (for example, `auth.uid() = user_id`).

GDPR rules:
- Store minimal user data: a pseudonym, hashed password (via Supabase Auth), and gameplay stats.
- Email is optional and only used for password reset and account-related communication.
- Provide an endpoint or page to delete a user account; when an account is deleted, anonymize or delete related gameplay data.
- Host data in an EU region when possible.

General:
- Avoid logging sensitive data.
- Prefer server-side checks for authorisation (role: admin, teacher, student).
