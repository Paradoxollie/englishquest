-- Une ancienne inscription élève ne donne pas de droits supplémentaires à un professeur.
create or replace function public.is_class_member(p_class_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.class_members m
    join public.profiles p on p.id = m.user_id
    where m.class_id = p_class_id
      and m.user_id = (select auth.uid())
      and p.role in ('student', 'admin')
  );
$$;

alter policy "class_members_select_self_teacher_admin" on public.class_members
  using (
    public.is_class_teacher(class_id)
    or (user_id = (select auth.uid()) and public.is_class_member(class_id))
    or (select public.is_admin_user())
  );
