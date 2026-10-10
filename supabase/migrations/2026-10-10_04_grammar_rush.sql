-- Septième jeu : Grammar Rush. Rejouable sans dégât.

insert into public.games (slug, name, description, difficulty)
values (
  'grammar-rush',
  'Grammar Rush',
  'Les questions des cours, sous chrono. Soixante secondes, quatre propositions, une série à tenir.',
  'medium'
)
on conflict (slug) do nothing;
