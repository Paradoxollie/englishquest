# English Quest : bilan et plan d'amélioration

Bilan du 15 octobre 2026, mis à jour au fil du travail.

À lire en premier par toute nouvelle session. Mettre à jour la colonne « État » au fil du travail.
Version illustrée et cochable : artefact « Bilan English Quest » (claude.ai).

## Où en est le site

- Code : dépôt GitHub `Paradoxollie/englishquest`, commit `4c202b3` du 13 octobre 2026, identique au dossier local. Déployé sur https://englishquest-omega.vercel.app (pas de domaine propre).
- Contrôles du 15 octobre : `npm test` passe, TypeScript 0 erreur, lint 0 erreur (189 avertissements). 22 pages en ligne testées sur ordinateur et téléphone : HTTP 200, aucune erreur JavaScript, aucun débordement. Les 13 scénarios de jeu du script `browser-games-audit.cjs` passent en production (le 14e échoue seulement sur la page 404 qu'il provoque).
- Audience réelle (Supabase, lecture seule) : 26 comptes, tous créés en nov. (19) et déc. 2025 (7). Aucune inscription depuis. En 2026, 2 comptes connectés seulement. 58 parties en tout (35 sur Speed Verb par 24 élèves fin 2025). 5 cours validés, 0 examen, 0 test de niveau. Depuis l'ouverture : 6 visiteurs venus de Google, 11 d'École Directe.

## Décisions de fond proposées

- Ne pas abandonner. Abandonner pour l'instant l'objectif « rentabiliser par la pub » (3 pages concernées, une vingtaine de visiteurs par mois, public mineur, bandeau de consentement requis).
- Priorité : relier chaque mission à sa notion, récompenser dès la première séance, puis espace classe pour tester avec les classes de Pierre. Grand public seulement après.
- Images : ne pas les remettre maintenant. Les générer en une série quand le style des cours sera unifié (phase 4).

## Problèmes constatés (preuves)

- Missions : aucun jeu de mission ne travaille la notion du cours. Répartition des 50 missions : Flash Translation 16, Flashback 9, Wordfall 8, Speed Verb 7, Enigma 5, Lexicon Blaster 5, Grammar Rush 0 (`lib/courses/metadata.ts`, `lib/courses/campaign.ts`).
- Mission 1 (« Être et avoir ») = Flash Translation en 24 s ; la liste commence par des phrasal verbs B1-B2 (`lib/games/flashTranslation.ts`, 144 mots sans niveau).
- `&apos;` affiché tel quel : 20 chaînes dans les cours 21, 22, 26, 27 et 6 dans `lib/placement/questions.json` (corrigé le 15/10).
- Fautes : « se passé » ×4 (`lib/courses/data.ts`, `lib/courses/metadata.ts` ×2, `course2.tsx`), « avances » ×2 (`data.ts`, `course47.tsx`), « faux amis » du cours 1 (c'est un calque), « Welcome to the Sector 7 » (`lib/games/spaceLexShooter.ts`). Page À propos : « depuis dix ans » à vérifier.
- Cours courts (175 à 610 mots, médiane ~310) alors que la carte annonce 12 à 14 min ; B1-B2 les plus courts. Quiz : 10 QCM fixes, réponses jamais mélangées, score envoyé par le navigateur et cru par le serveur (`app/cours/actions.ts`).
- Économie (`lib/profile/economy.ts`) : ~2 or par partie, avatar à 117 or en moyenne, titre jusqu'à 500 : premier achat après une dizaine de jours. Pas de badges ni de ligue. Boutique : 6 avatars sur 12 et 7 fonds sur 8 sans image.
- Scores de jeu crus dans de larges bornes (Enigma jusqu'à 1 000 000).
- Classements visibles sans connexion, alors que la page Confidentialité dit l'inverse.
- Contact : pas de limite de longueur, pas d'anti-robot, pas de notification.
- E-mails Supabase (mot de passe oublié) : vérifier le SMTP, l'envoi par défaut est limité à l'équipe du projet.
- Supabase : 3 jeux fantômes encore en base (migration `2026-10-10_01` non appliquée), 9 tables `marvel_*` et `ship_skins` mortes, 10 fonctions sans `search_path`, `is_admin` appelable sans connexion, protection mots de passe compromis désactivée.
- Le site lancé en local écrit dans la base de production (2 568 visites depuis `localhost:3000`).
- Compteur de visites (`proxy.ts` + `app/api/track-visit`) : compte les navigateurs automatiques (HeadlessChrome non filtré) et probablement les préchargements.
- Enigma Scroll : 150 mots cibles sans traduction, 61 000 mots de validation envoyés au navigateur (950 Ko).
- Dossier local : `cleanup.ps1` jamais lancé (dossier « ancienne version », ~30 fichiers vides « obsolète », `english-words.json` 13 Mo, `grammar_dump.txt`, `lessons.tsx.bak`).
- Connecteur Vercel : refus d'accès (403) au projet le 15 octobre, à reconnecter.

## Plan

Qui : C = Claude, P = Pierre. Taille : S petit, M moyen, L grand.

### Phase 0 : réparer ce qui se voit (1 à 2 soirées)

| # | Tâche | Qui | Taille | État |
|---|---|---|---|---|
| 0.1 | Corriger les `&apos;` + test qui les interdit | C | S | fait 15/10 |
| 0.2 | Corriger les fautes listées ci-dessus | C | S | fait 15/10 (+ une soixantaine d'accents dans les cours 41-50) |
| 0.3 | Relire les 50 cours (surtout 41-50, écrits sans accents à l'origine) et la page À propos | P | M | à faire |
| 0.4 | Classements réservés aux connectés ; « pas de vrai nom » sous le champ pseudo | C | S | fait 15/10 |
| 0.5 | Accueil : supprimer « Un test de niveau arrivera », cacher l'emplacement pub vide, retirer « Profs » du menu visiteur | C | S | fait 15/10 (pub coupée par défaut : `NEXT_PUBLIC_ADSENSE_ENABLED=true` pour la rallumer) |
| 0.6 | Contact : limites (120 / 3 000), champ piège, 3 messages/heure | C | S | fait 15/10 (le tableau de bord compte déjà les non lus) |
| 0.7 | Ménage Supabase (migration fantômes, tables mortes après sauvegarde, `search_path`, `is_admin`), accord de Pierre avant chaque suppression | C | S | en attente d'accord |
| 0.8 | Réglages comptes : Supabase (mots de passe compromis, SMTP), reconnecter Vercel, couper AdSense | P | S | à faire |
| 0.9 | Lancer `cleanup.ps1` depuis `D:\Englishquest\englishquest` | P | S | à faire |
| 0.10 | Statistiques fiables : Vercel Web Analytics ou filtrage du compteur | C | S | en partie 15/10 : préchargements, navigateurs automatiques et localhost exclus |
| 0.11 | Base de test séparée (branche Supabase ou second projet gratuit) | C | S | à décider avec Pierre |

### Phase 1 : relier le jeu à ce qu'on apprend (1 à 2 semaines)

| # | Tâche | Qui | Taille | État |
|---|---|---|---|---|
| 1.1 | Mission = Grammar Rush centré sur le cours ; autres jeux en entraînement libre | C | M | fait 15/10 : `?cours=N` sur Grammar Rush, bouton « S'entraîner sur la notion » |
| 1.2 | Quiz ≥ 80 % valide la mission ; le jeu donne 1 à 3 étoiles, jamais bloquant | C | M | fait 16/10 (code) : 1 étoile mission validée, 1 quiz à 10/10, 1 pour 5 bonnes réponses ciblées dans Grammar Rush (`?cours=N`) ; carte, barre de cours, accueil ; migration 13 à appliquer |
| 1.3 | Banque de 20 à 30 questions par cours (brouillons Claude, validation Pierre), tirage de 10, réponses mélangées | P + C | L | en partie 15/10 : questions et réponses mélangées ; banque élargie à faire |
| 1.4 | Quiz corrigé côté serveur | C | S | fait 15/10 (`lib/courses/quiz-grading.ts`) |
| 1.5 | Exercices de production : phrase à compléter, mots à remettre en ordre, erreur à repérer | C | M | à faire |
| 1.6 | Bouton écouter sur chaque exemple (synthèse vocale du navigateur, en-GB) | C | S | fait 15/10 : sélectionner une phrase fait apparaître « Écouter » |
| 1.7 | Niveau A1 à C1 pour chaque mot des jeux (proposition Claude, correction Pierre) ; jeux filtrés par niveau | P + C | M | à faire |
| 1.8 | Test de niveau sans compte, résultat et parties invité rattachés à l'inscription | C | M | en partie 15/10 : test ouvert sans compte, résultat signé appliqué à l'inscription, bouton principal de l'accueil ; parties invité à faire |

### Phase 2 : donner envie de revenir (1 à 2 semaines)

| # | Tâche | Qui | Taille | État |
|---|---|---|---|---|
| 2.1 | Coffre de bienvenue + 4 ou 5 objets entre 10 et 30 or | C | S | fait 16/10 (code) : 30 or à l'inscription (`WELCOME_GOLD`), avis sur l'accueil, 4 titres de 10 à 60 or, 5 objets rendus accessibles plus tôt ; migration 12 à appliquer |
| 2.2 | 25 badges, visibles sur le profil et les classements | C | M | fait 16/10 (code) : 28 badges (`lib/profile/badges.ts`), profil et accueil ; pas encore dans les classements ; migration 11 à appliquer |
| 2.3 | Examen de chapitre mis en scène comme un boss, coffre et décor débloqués | C | M | à faire (badge « Boss vaincu » seulement) |
| 2.4 | Ligue de la semaine (remise à zéro le lundi, par classe ensuite) | C | M | fait 16/10 (code) : historique `xp_events`, ligue sur Classements, carte « Ta semaine » ; par classe à faire ; migration 10 à appliquer |
| 2.5 | Animations de récompense (framer-motion déjà installé) | C | M | fait 16/10 : notifications de gain, badges, étoiles, fenêtre de niveau (événement `eq:reward`) |
| 2.6 | Anti-triche : session de partie côté serveur, contrôle score/durée, réponses vérifiées pour Grammar Rush et Flash Translation | C | M | à faire |

### Phase 3 : espace prof et mode classe (2 à 3 semaines)

| # | Tâche | Qui | Taille | État |
|---|---|---|---|---|
| 3.1 | Codes de classe (6 caractères, sans e-mail) | C | M | à faire |
| 3.2 | Tableau de suivi par classe (activité, missions, notions ratées) | C | M | à faire |
| 3.3 | Devoirs : mission assignée avec date limite | C | S | à faire |
| 3.4 | Mode projection hors ligne (site installable, jeux en équipe au tableau) | C | L | à faire |
| 3.5 | Page publique « Pour les profs » | C | S | à faire |
| 3.6 | Trois semaines d'essai avec les classes ; mesure : élèves qui reviennent chaque semaine | P | L | à faire |

### Phase 4 : identité visuelle (en parallèle)

| # | Tâche | Qui | Taille | État |
|---|---|---|---|---|
| 4.1 | Cours transformés en données + 6 à 8 composants communs, un seul style | C | L | à faire |
| 4.2 | Trace écrite par cours | C | S | à faire |
| 4.3 | Carte d'aventure : chapitre en cours en grand, autres repliés | C | M | à faire |
| 4.4 | Mode jeu plein écran sur téléphone | C | M | à faire |
| 4.5 | Générer les 14 visuels + 13 objets de boutique en une série (consignes écrites par Claude) | P | M | à faire |

Emplacements d'images (dans `public/art/`, JPG) : `hero-home.jpg` 2400×1350 sujet à droite ; `hero-games.jpg` 2400×1000 ; `act-1.jpg` à `act-5.jpg` 1200×1600, le haut compte ; `game-<jeu>.jpg` ×7 en 1500×1000 (enigma-scroll, space-lex, speed-verb-challenge, wordfall, flash-translation, grammar-rush, flashback) ; avatars boutique 512×512.

### Phase 5 : vers 50 jeux (après les phases 1 à 3)

| # | Tâche | Qui | Taille | État |
|---|---|---|---|---|
| 5.1 | Moteur « mécanique × paquet de contenu » (une dizaine de mécaniques) | C | L | à faire |
| 5.2 | Enigma Scroll : 600 mots par niveau, traduction finale, validation chargée à la demande | C | M | à faire |
| 5.3 | Flashback repensé (« déjà vu, et ça veut dire quoi ? ») | C | M | à faire |
| 5.4 | Lexicon Blaster : consignes en français pour A1-A2 | C | S | à faire |

### Phase 6 : audience (quand les classes l'utilisent)

| # | Tâche | Qui | Taille | État |
|---|---|---|---|---|
| 6.1 | Nom de domaine | P | S | à faire |
| 6.2 | Search Console, titres de cours orientés recherche, exercices visibles sans compte | C | M | à faire |
| 6.3 | Présentation aux collègues, puis groupes de profs d'anglais | P | M | à faire |
| 6.4 | Revoir la publicité au-delà de quelques milliers de visiteurs par mois (ou page de dons) | P | S | à faire |

## Journal

- 2026-10-15 : bilan complet (code, tests, site en ligne, Supabase). Rien modifié sur le site ni dans la base. Environ 330 visites de test ajoutées au compteur ce jour-là (HeadlessChrome).
- 2026-10-15 (soir) : phase 0 (code) et cœur de la phase 1 faits et poussés. Détail : entités et accents corrigés (banque de questions resynchronisée), classements réservés aux connectés, pub coupée par défaut, menu Profs réservé aux profs, contact protégé, compteur de visites filtré, mission validée par le quiz, quiz mélangé et corrigé par le serveur, Grammar Rush ciblé (`?cours=N`), bouton Écouter, test de niveau sans compte, durées de cours réalistes, un seul repère `main` par page de jeu. Tests ajoutés : entités HTML, correction serveur du quiz, mélange du quiz, jeton du test de niveau, test de niveau invité sans écriture.
- 2026-10-15 (soir) : vérifié en production après déploiement : 13 scénarios de jeu passent ; parcours réel complet avec un compte de test (test de niveau sans compte placé au chapitre 2, inscription, carte ouverte au chapitre 2, quiz du cours 11 à 10/10, mission validée +100 XP +8 or), puis compte supprimé par le profil ; base vérifiée : 26 comptes, aucune ligne orpheline.
- 2026-10-16 : récompenses (phase 2.1, 2.2, 2.4, 2.5 et étoiles du 1.2). Code seulement, rien appliqué en base : migrations `2026-10-16_10` à `13` à passer dans l'ordre. Sans elles, le site tourne, mais ligue, badges et étoiles d'entraînement restent vides. Test ajouté : `scripts/tests/rewards-regression.cjs`.
