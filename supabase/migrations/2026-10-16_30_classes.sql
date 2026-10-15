-- Espace professeur : classes à code, élèves inscrits, devoirs.
-- Rejouable sans dégât (if not exists, drop policy if exists, create or replace).
--
-- Toutes les écritures passent par les actions serveur du site (clé service),
-- après contrôle du compte, du rôle et de la propriété de la classe. Le
-- navigateur ne peut que lire ce que les règles RLS ci-dessous lui montrent :
--   - un professeur voit ses classes, leurs élèves inscrits et leurs devoirs ;
--   - un élève voit les classes qu'il a rejointes, sa propre inscription et
--     les devoirs de ces classes (pas la liste des autres élèves) ;
--   - un administrateur voit tout.

-- ---------------------------------------------------------------- tables

create table if not exists public.classes (
  id uuid primary key default gen_random_uuid(),
  teacher_id uuid not null references auth.users (id) on delete cascade,
  name text not null check (char_length(btrim(name)) between 1 and 60),
  -- 6 caractères, majuscules et chiffres sans O/0, I/1 ni L.
  code text not null unique check (code ~ '^[ABCDEFGHJKMNPQRSTUVWXYZ23456789]{6}$'),
  created_at timestamptz not null default now(),
  archived_at timestamptz
);

create index if not exists classes_teacher_id_idx on public.classes (teacher_id);

comment on table public.classes is 'Classes créées par un professeur ; les élèves les rejoignent avec le code.';
comment on column public.classes.archived_at is 'Classe archivée : le code ne permet plus de la rejoindre, le suivi reste lisible.';

create table if not exists public.class_members (
  class_id uuid not null references public.classes (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  joined_at timestamptz not null default now(),
  primary key (class_id, user_id)
);

create index if not exists class_members_user_id_idx on public.class_members (user_id);

comment on table public.class_members is 'Élèves inscrits dans une classe (cinq classes au plus par élève, contrôlé par le serveur).';

create table if not exists public.class_assignments (
  id uuid primary key default gen_random_uuid(),
  class_id uuid not null references public.classes (id) on delete cascade,
  course_id integer not null check (course_id between 1 and 50),
  due_date date,
  note text check (note is null or char_length(note) <= 200),
  created_at timestamptz not null default now()
);

create index if not exists class_assignments_class_id_idx on public.class_assignments (class_id, created_at desc);

comment on table public.class_assignments is 'Devoirs : une mission (numéro de cours 1 à 50) donnée à une classe, avec date limite facultative.';
comment on column public.class_assignments.course_id is 'Numéro du cours (courses.course_number), pas l''identifiant uuid de la table courses.';

-- Codes de classe erronés, pour limiter les essais au hasard : au plus dix
-- échecs par compte sur une heure glissante. Une ligne = un échec, sans le
-- code tapé. Les lignes de plus d'un jour sont effacées par le serveur au fil
-- de l'eau ; rien n'est lisible depuis le navigateur.
create table if not exists public.class_join_attempts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  created_at timestamptz not null default now()
);

create index if not exists class_join_attempts_user_created_idx
  on public.class_join_attempts (user_id, created_at desc);

-- ---------------------------------------------------------------- fonctions d'aide RLS
-- « security definer » : elles lisent classes et class_members sans repasser
-- par leurs propres règles RLS (sinon les deux tables se renverraient l'une à
-- l'autre à l'infini, erreur 42P17). Elles ne répondent que pour auth.uid().

create or replace function public.is_class_teacher(p_class_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.classes c
    where c.id = p_class_id and c.teacher_id = (select auth.uid())
  );
$$;

create or replace function public.is_class_member(p_class_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.class_members m
    where m.class_id = p_class_id and m.user_id = (select auth.uid())
  );
$$;

-- Le professeur d'un élève (via une de ses classes) peut lire sa progression.
create or replace function public.is_teacher_of_pupil(p_user_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.class_members m
    join public.classes c on c.id = m.class_id
    where m.user_id = p_user_id and c.teacher_id = (select auth.uid())
  );
$$;

revoke all on function public.is_class_teacher(uuid) from public, anon;
revoke all on function public.is_class_member(uuid) from public, anon;
revoke all on function public.is_teacher_of_pupil(uuid) from public, anon;
grant execute on function public.is_class_teacher(uuid) to authenticated, service_role;
grant execute on function public.is_class_member(uuid) to authenticated, service_role;
grant execute on function public.is_teacher_of_pupil(uuid) to authenticated, service_role;

-- ---------------------------------------------------------------- RLS

alter table public.classes enable row level security;
alter table public.class_members enable row level security;
alter table public.class_assignments enable row level security;
alter table public.class_join_attempts enable row level security;

drop policy if exists "classes_select_teacher_member_admin" on public.classes;
create policy "classes_select_teacher_member_admin"
  on public.classes for select
  to authenticated
  using (
    teacher_id = (select auth.uid())
    or public.is_class_member(id)
    or (select public.is_admin_user())
  );

drop policy if exists "class_members_select_self_teacher_admin" on public.class_members;
create policy "class_members_select_self_teacher_admin"
  on public.class_members for select
  to authenticated
  using (
    user_id = (select auth.uid())
    or public.is_class_teacher(class_id)
    or (select public.is_admin_user())
  );

drop policy if exists "class_assignments_select_teacher_member_admin" on public.class_assignments;
create policy "class_assignments_select_teacher_member_admin"
  on public.class_assignments for select
  to authenticated
  using (
    public.is_class_teacher(class_id)
    or public.is_class_member(class_id)
    or (select public.is_admin_user())
  );

-- class_join_attempts : RLS active et aucune règle, donc illisible côté navigateur.

-- ---------------------------------------------------------------- droits
-- Pas d'écriture depuis le navigateur : tout passe par le serveur.

revoke all on public.classes, public.class_members, public.class_assignments, public.class_join_attempts
  from public, anon, authenticated;
grant select on public.classes, public.class_members, public.class_assignments to authenticated;
grant all on public.classes, public.class_members, public.class_assignments, public.class_join_attempts to service_role;

-- ---------------------------------------------------------------- progression lue par un professeur
-- L'ancienne règle laissait tout compte professeur lire la progression de
-- tous les joueurs. Elle est restreinte aux élèves de ses propres classes.
-- (Le site lit la progression avec la clé service ; cette règle ne sert qu'aux
-- lectures directes depuis le navigateur.)

drop policy if exists "Teachers can view their students' progress" on public.user_course_progress;
create policy "Teachers can view their students' progress"
  on public.user_course_progress for select
  to authenticated
  using (public.is_teacher_of_pupil(user_id));
