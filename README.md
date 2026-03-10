# English Quest

Plateforme d'apprentissage de l'anglais orientee gamification, parcours progressif et jeux educatifs.

## Produit

- `50` cours structures, organises en `5` paliers (`A1` a `C1`)
- parcours principal sur `/quest`
- bibliotheque complete sur `/tous-les-cours`
- mini-jeux sur `/play`
- espace connecte avec progression, profil, shop et classement

## Stack

- Next.js `16`
- React `19`
- TypeScript
- Supabase (auth, data, storage)
- Tailwind CSS `4`

## Scripts

```bash
npm run dev
npm run build
npm run start
npm run lint
npm run test-supabase
```

## Structure utile

- `app/` : pages App Router
- `components/` : UI, layout, ads, auth, cours
- `lib/courses/` : source de verite des 50 cours
- `lib/games/` : configuration des jeux
- `lib/supabase/` : clients navigateur, serveur et admin
- `supabase/` : scripts SQL d'installation et de maintenance

## Base de donnees

Les scripts SQL principaux sont dans `supabase/` :

- `games_and_progress.sql` : jeux, cours, progression
- `shop_system.sql` : boutique, items possedes, items equipes
- `profiles.sql` et `gamification.sql` : profils et progression joueur

Le durcissement recent du shop est documente dans :

- `supabase/shop_hardening.sql`

## Principes produit

- `/quest` et `/tous-les-cours` doivent toujours refleter le meme corpus de cours
- les uploads personnalises ne doivent jamais devenir visibles ou equipables par d'autres utilisateurs
- les zones d'apprentissage ne doivent pas etre degradees par des distractions ou des incoherences produit

## Verification recommandee

Avant mise en production :

```bash
npm install
npm run lint
npm run build
```
