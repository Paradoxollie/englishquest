-- La politique SELECT relisait profiles sous son propre RLS, provoquant 42P17
-- pour chaque profil authentifié. Réutiliser le contrôle administrateur existant
-- (is_admin_user), déjà lié à auth.uid(), sans changer les lignes ni les soldes.

drop policy if exists "Admins can list all profiles" on public.profiles;
create policy "Admins can list all profiles"
on public.profiles
for select
to authenticated
using ((select public.is_admin_user()));
