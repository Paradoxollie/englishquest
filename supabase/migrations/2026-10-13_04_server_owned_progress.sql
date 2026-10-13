-- Scores, soldes, rôles et progression sont validés par les actions serveur.
-- Les règles SELECT et les droits service_role sont conservés.
revoke insert, update, delete, truncate on public.profiles, public.game_scores, public.user_course_progress
from public, anon, authenticated;

-- Les métadonnées utilisateur sont modifiables par leur propriétaire : elles
-- ne peuvent donc pas choisir un rôle administrateur lors de l'inscription.
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = ''
as $$
begin
  insert into public.profiles (id, username, role, email)
  values (new.id, coalesce(new.raw_user_meta_data ->> 'username', split_part(new.email, '@', 1)), 'student', new.email)
  on conflict (id) do update set email = excluded.email, username = excluded.username;
  return new;
end;
$$;
revoke all on function public.handle_new_user() from public, anon, authenticated;
