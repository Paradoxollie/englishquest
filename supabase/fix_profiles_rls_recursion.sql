-- Fix profiles RLS recursion without touching data.
-- Run in the Supabase SQL Editor, or with the Supabase CLI against the linked project.

begin;

create or replace function public.is_admin(user_id uuid)
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select exists (
    select 1
    from public.profiles
    where id = $1
      and role = 'admin'
      and id = auth.uid()
  );
$$;

revoke all on function public.is_admin(uuid) from public;
grant execute on function public.is_admin(uuid) to anon, authenticated, service_role;

drop policy if exists "Admins can update any profile" on public.profiles;
create policy "Admins can update any profile"
on public.profiles
for update
using (public.is_admin(auth.uid()))
with check (public.is_admin(auth.uid()));

drop policy if exists "Admins can list all profiles" on public.profiles;
create policy "Admins can list all profiles"
on public.profiles
for select
using (public.is_admin(auth.uid()));

commit;

select
  policyname,
  cmd,
  qual,
  with_check
from pg_policies
where schemaname = 'public'
  and tablename = 'profiles'
  and policyname in ('Admins can update any profile', 'Admins can list all profiles')
order by policyname;
