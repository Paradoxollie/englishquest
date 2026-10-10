-- Fonctions « security definer » appelables depuis le navigateur : fermées.
-- Elles ne sont utilisées que par le serveur du site (clé service).
-- Appliquée en production le 10 octobre 2026.

revoke execute on function public.purchase_shop_item(uuid, uuid) from anon, authenticated, public;
revoke execute on function public.handle_new_user() from anon, authenticated, public;
revoke execute on function public.get_total_visits() from anon, authenticated, public;
revoke execute on function public.get_total_unique_visitors() from anon, authenticated, public;
revoke execute on function public.get_visitor_stats(date, date) from anon, authenticated, public;
