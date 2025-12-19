-- ============================================================================
-- STORAGE ADMIN POLICIES - Politiques RLS pour permettre aux admins d'uploader
-- ============================================================================
-- Exécutez ce script dans le SQL Editor de Supabase
-- ============================================================================

-- Supprimer les anciennes politiques si elles existent
drop policy if exists "Admins can upload any image" on storage.objects;
drop policy if exists "Admins can delete any image" on storage.objects;
drop policy if exists "Admins can update any image" on storage.objects;
drop policy if exists "Users can upload own images" on storage.objects;
drop policy if exists "Users can delete own images" on storage.objects;

-- Créer une fonction helper pour vérifier si l'utilisateur est admin
-- Cette fonction évite la récursion en utilisant SECURITY DEFINER
-- Elle s'exécute avec les privilèges du créateur, contournant RLS
create or replace function public.is_admin_user()
returns boolean
language plpgsql
security definer
set search_path = public
stable
as $$
declare
  user_role text;
begin
  -- Récupérer le rôle directement depuis profiles sans déclencher RLS
  select role into user_role
  from public.profiles
  where id = auth.uid();
  
  return user_role = 'admin';
end;
$$;

-- Donner les permissions nécessaires
grant execute on function public.is_admin_user() to authenticated;
grant execute on function public.is_admin_user() to anon;

-- Politique : Les admins peuvent uploader n'importe quelle image dans custom-images
-- Les utilisateurs peuvent uploader dans leur propre dossier
create policy "Admins can upload any image"
on storage.objects
for insert
with check (
  bucket_id = 'custom-images' AND
  (
    -- Admins can upload anywhere (using function to avoid recursion)
    public.is_admin_user()
    OR
    -- Users can upload in their own folder (custom folder only)
    (storage.foldername(name))[1] = 'custom' AND auth.uid()::text = (storage.foldername(name))[2]
  )
);

-- Politique : Les admins peuvent supprimer n'importe quelle image
create policy "Admins can delete any image"
on storage.objects
for delete
using (
  bucket_id = 'custom-images' AND
  (
    public.is_admin_user()
    OR
    auth.uid()::text = (storage.foldername(name))[1]
  )
);

-- Politique : Les admins peuvent mettre à jour n'importe quelle image
create policy "Admins can update any image"
on storage.objects
for update
using (
  bucket_id = 'custom-images' AND
  (
    public.is_admin_user()
    OR
    auth.uid()::text = (storage.foldername(name))[1]
  )
);

-- Vérifier que le bucket existe
do $$
begin
  if not exists (
    select 1 from storage.buckets where id = 'custom-images'
  ) then
    raise exception 'Le bucket custom-images n''existe pas. Exécutez d''abord storage_setup.sql';
  end if;
end $$;

