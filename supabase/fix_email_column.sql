-- Script de correction rapide : Ajouter la colonne email à la table profiles
-- Exécutez ce script dans Supabase SQL Editor si vous avez l'erreur "column email does not exist"

begin;

-- Ajouter la colonne email si elle n'existe pas
do $$
begin
  if not exists (
    select 1 
    from information_schema.columns 
    where table_schema = 'public' 
    and table_name = 'profiles' 
    and column_name = 'email'
  ) then
    alter table public.profiles add column email text;
    raise notice 'Colonne email ajoutée avec succès';
  else
    raise notice 'Colonne email existe déjà';
  end if;
end $$;

commit;


