-- Entraînement ciblé : troisième étoile d'une mission. Rejouable sans dégât.
--
-- Meilleur nombre de bonnes réponses sur les questions d'un cours, dans une
-- même partie de Grammar Rush ouverte sur ce cours (/play/grammar-rush?cours=N).
-- Cinq bonnes réponses donnent l'étoile (lib/courses/stars.ts).
-- course_id est le numéro du cours (1 à 50), comme dans l'adresse de la page.

create table if not exists public.course_practice (
  user_id uuid not null references auth.users (id) on delete cascade,
  course_id integer not null check (course_id between 1 and 500),
  best_focus_correct integer not null default 0 check (best_focus_correct >= 0),
  updated_at timestamptz not null default now(),
  primary key (user_id, course_id)
);

alter table public.course_practice enable row level security;

drop policy if exists "course_practice_select_own" on public.course_practice;
create policy "course_practice_select_own"
  on public.course_practice for select
  to authenticated
  using ((select auth.uid()) = user_id);

revoke all on table public.course_practice from public, anon;
revoke insert, update, delete, truncate, references, trigger on table public.course_practice from authenticated;
grant select on table public.course_practice to authenticated;

-- Garde le meilleur résultat, même si deux parties arrivent en même temps.
-- Renvoie le meilleur résultat d'avant et celui d'après.
create or replace function public.record_course_practice(
  p_user_id uuid,
  p_course_id integer,
  p_focus_correct integer
)
returns jsonb
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_previous integer;
  v_best integer;
begin
  if p_user_id is null or p_course_id is null or p_focus_correct is null
    or p_course_id not between 1 and 500 or p_focus_correct < 0 or p_focus_correct > 60 then
    raise exception 'Invalid course practice result' using errcode = '22023';
  end if;

  select best_focus_correct into v_previous
  from public.course_practice
  where user_id = p_user_id and course_id = p_course_id
  for update;

  insert into public.course_practice (user_id, course_id, best_focus_correct, updated_at)
  values (p_user_id, p_course_id, p_focus_correct, now())
  on conflict (user_id, course_id) do update
    set best_focus_correct = greatest(public.course_practice.best_focus_correct, excluded.best_focus_correct),
        updated_at = case
          when excluded.best_focus_correct > public.course_practice.best_focus_correct then now()
          else public.course_practice.updated_at
        end
  returning best_focus_correct into v_best;

  return jsonb_build_object('previousBest', coalesce(v_previous, 0), 'best', v_best);
end;
$$;

revoke all on function public.record_course_practice(uuid, integer, integer) from public, anon, authenticated;
grant execute on function public.record_course_practice(uuid, integer, integer) to service_role;
