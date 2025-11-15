-- ============================================================================
-- STORAGE SETUP - Configuration du bucket pour les images personnalisées
-- ============================================================================
-- Exécutez ce script dans le SQL Editor de Supabase
-- ============================================================================

-- Créer le bucket pour les images personnalisées
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'custom-images',
  'custom-images',
  true,
  5242880, -- 5MB
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif']
)
on conflict (id) do nothing;

-- Politique RLS : Les utilisateurs peuvent uploader leurs propres images
create policy "Users can upload own images"
on storage.objects
for insert
with check (
  bucket_id = 'custom-images' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Politique RLS : Les utilisateurs peuvent lire toutes les images publiques
create policy "Public images are viewable by everyone"
on storage.objects
for select
using (
  bucket_id = 'custom-images'
);

-- Politique RLS : Les utilisateurs peuvent supprimer leurs propres images
create policy "Users can delete own images"
on storage.objects
for delete
using (
  bucket_id = 'custom-images' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

