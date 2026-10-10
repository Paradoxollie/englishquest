-- Test de niveau : mémorise le chapitre de départ choisi par le test.
-- Rejouable sans dégât.

alter table public.profiles
  add column if not exists placement_chapter smallint,
  add column if not exists placement_at timestamptz;

comment on column public.profiles.placement_chapter is 'Chapitre de départ attribué par le test de niveau (1 à 5).';
comment on column public.profiles.placement_at is 'Date du dernier test de niveau.';
