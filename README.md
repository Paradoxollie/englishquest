# English Quest

Site gratuit d'apprentissage de l'anglais par le jeu, créé par Pierre Marienne, professeur
d'anglais. Parcours de cours avec quiz, six mini-jeux, progression par XP et or, boutique
d'avatars, classements.

Production : https://englishquest-omega.vercel.app

## Pile technique

- Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS 4
- Supabase : authentification, base Postgres, stockage
- Hébergement Vercel

## Démarrer en local

```bash
npm install
cp .env.example .env.local   # puis renseigner les clés Supabase
npm run dev                  # http://localhost:3000
```

Variables attendues dans `.env.local` :

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY` (serveur uniquement, jamais exposée au navigateur)
- `NEXT_PUBLIC_SITE_URL` (optionnelle, URL publique du site)

## Vérifier avant de déployer

```bash
npm run lint
npx tsc --noEmit
npm run build
```

## Structure

| Dossier | Contenu |
| --- | --- |
| `app/` | Pages et actions serveur (App Router). `(public)` = accès libre, `(protected)` = connexion requise |
| `app/play/<jeu>/` | Interface de chaque jeu, soumission des scores, classements |
| `app/cours/[id]/` | Affichage d'un cours et validation de mission |
| `components/` | Interface : en-tête, cours, quiz, carte Aventure, pub, composants de base |
| `lib/courses/` | Les 50 cours (`list/course1..50.tsx`), catalogue, métadonnées, progression, missions |
| `lib/games/` | Moteurs de jeu (logique pure, testable) et listes de mots |
| `lib/profile/` | XP, niveaux, récompenses, défi du jour |
| `lib/supabase/` | Clients Supabase navigateur, serveur et admin |
| `supabase/migrations/` | Scripts SQL à exécuter, dans l'ordre |
| `supabase/archive/` | Scripts historiques, déjà exécutés, à ne pas relancer |
| `docs/archive/` | Anciennes notes de dépannage |
| `scripts/` | Outils de maintenance des listes de mots et des visuels |

## Ajouter un cours

1. Créer `lib/courses/list/courseN.tsx` sur le modèle d'un cours existant (titre, objectif,
   sections, quiz de 10 questions).
2. L'enregistrer dans `lib/courses/lessons.tsx` et dans le catalogue `lib/courses/data.ts`.

## Ajouter du vocabulaire

- Flash Translation et Flashback : `lib/games/flashTranslation.ts` (`VOCABULARY`)
- Wordfall : `lib/games/words/wordfall-words.json` (`manualWords`, mots de 4 à 6 lettres avec
  traduction, et `expressions`)
- Lexicon Blaster : `lib/games/spaceLexShooter.ts` (familles de mots, connecteurs, synonymes)
- Speed Verb Challenge : `lib/games/speed-verb-challenge.ts` (`VERBS`)

## Règles du projet

- Les cours et jeux restent gratuits et sans publicité ; la publicité n'apparaît qu'en pied
  de page des pages d'information (accueil, à propos, contact).
- Aucune image envoyée par un utilisateur n'est affichée sans validation.
- Toute modification de la base passe par un fichier dans `supabase/migrations/`.
- Le texte du site est en français, avec ses accents.
