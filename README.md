# English Quest

Site gratuit d'apprentissage de l'anglais par le jeu, créé par Pierre Marienne, professeur
d'anglais. Parcours de cours avec quiz, sept mini-jeux, progression par XP et or, boutique
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

Les contrôles de régression des jeux, des récompenses, des quiz et des niveaux :

```bash
npm test
npm run test:browser -- http://127.0.0.1:3000
```

`npm test` fonctionne hors ligne, sans toucher aux comptes ni envoyer d'e-mail.
Le contrôle navigateur utilise Playwright installé localement (ou son cache npm),
avec `PLAYWRIGHT_MODULE` et `PLAYWRIGHT_EXECUTABLE_PATH` si nécessaire. Il joue
en invité et enregistre ses captures dans `output/playwright/audit-2026-10-13/`.

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

Chaque mot porte un niveau : 1 = A1 (chapitre 1) à 5 = C1 (chapitre 5), voir
`lib/games/levels.ts`. Un joueur connecté joue au niveau de son chapitre en cours ; un
invité choisit son niveau (Débutant par défaut). Les jeux tirent environ 70 % des mots au
niveau du joueur et 30 % au niveau inférieur.

- Flash Translation et Flashback : `lib/games/flashTranslation.ts` (`VOCABULARY` : mot
  français, réponse anglaise, trois distracteurs jamais acceptables, niveau)
- Wordfall : `lib/games/words/wordfall-words.json` (`manualWords.translations`,
  `manualWords.levels`, `expressions`)
- Enigma Scroll : `lib/games/enigma-scroll-targets.ts` (mots à deviner avec traduction et
  niveau) ; les propositions acceptées sont dans `public/data/enigma-guesses-4.json`, `-5`,
  `-6`, chargées à la demande (`node scripts/update-word-lists.js` pour les régénérer)
- Lexicon Blaster : `lib/games/spaceLexShooter.ts` (thèmes, connecteurs, synonymes, et leurs
  versions simplifiées pour les niveaux 1 et 2)
- Speed Verb Challenge : `lib/games/speed-verb-challenge.ts` (`VERBS`)

## Sessions de partie et scores

Un joueur connecté ouvre une session côté serveur au lancement de chaque partie
(`lib/games/game-session-server.ts`, table `game_sessions`). L'action de score exige cette
session, une seule fois, avec une durée compatible avec l'horloge du serveur, et un score
plausible pour cette durée (`lib/games/score-plausibility.ts`). Les invités n'envoient
aucun score.

## Règles du projet

- Les cours et jeux restent gratuits et sans publicité ; la publicité n'apparaît qu'en pied
  de page des pages d'information (accueil, à propos, contact).
- Aucune image envoyée par un utilisateur n'est affichée sans validation.
- Toute modification de la base passe par un fichier dans `supabase/migrations/`.
- Le texte du site est en français, avec ses accents.
