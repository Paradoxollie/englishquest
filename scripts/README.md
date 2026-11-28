# Scripts

## Essais utilisés pour la version Omega de novembre 2026

Exécuter les commandes depuis la racine du dépôt. `npm test` lance les régressions locales, y compris les contrôles PostgreSQL en mémoire. `npm run lint`, `npx tsc --noEmit` et `npm run build` vérifient le code et sa compilation. Pour tester le parcours visible, démarrer le serveur local puis lancer les essais navigateur qui correspondent à la modification. [Guide de démarrage](../README.md)

| Sujet | Essai ou point d’entrée |
| --- | --- |
| Pages proposées aux moteurs de recherche | `node scripts/tests/public-search.cjs http://127.0.0.1:3000` vérifie les titres, les descriptions, les adresses publiques et les liens vers les activités. Ajouter `--sample` pour un contrôle court sur Omega. |
| Neuf jeux, écrans de jeu et validation des scores | `npm run test:browser -- http://127.0.0.1:3000`, [règles des jeux de chute et de tir](tests/falling-games-regression.cjs), [validation des scores](tests/score-plausibility-regression.cjs) |
| Variété des parties | Le scénario navigateur `six-games-fresh-openings-same-phone` vérifie les cinq listes de Grammar Rush et deux départs par jeu dans le même onglet. Les [contrôles de vocabulaire](tests/round-games-regression.cjs) vérifient les niveaux, les choix proposés et les équivalents admis. |
| Exercices et quiz | [Vérification des corrigés](tests/exercise-invariants.cjs), [questions des cours](tests/course-question-invariants.cjs), [interactions du quiz](tests/quiz-interaction-regression.cjs) |
| Atlas et positionnement en invité | [Règles des escales](tests/atlas-regression.cjs), [parcours de la carte](tests/atlas-trial-browser.cjs), [reprise du positionnement](tests/guest-placement-browser.cjs) |
| Professeurs et podium | [Isolation des classes](tests/class-visibility-postgres.cjs), [séance synchronisée](tests/live-class-postgres.cjs), [podium](tests/live-ceremony.cjs), [activités dans le navigateur](tests/live-activities-browser.cjs) |
| Participation temporaire et fréquentation | [Expiration à quatre heures, effacement à dix jours, conservation des comptes et des totaux quotidiens](tests/guest-retention-postgres.cjs). Le test de séance ci-dessus couvre aussi un invité, ses devoirs et le renouvellement du code. |
| Messages, or et inventaire | [Fil privé et accusés](tests/contact-followups-postgres.cjs), [albums](tests/collection-shop-postgres.cjs), [personnages](tests/character-roster-postgres.cjs) |
| Voix de jeu | `node scripts/audit-audio-coverage.cjs --check`, puis écoute d’un mot, d’une phrase et d’un dialogue sur les appareils visés. [Enregistrements](../public/audio/README.md) |

Les captures et journaux du poste sont dans `output/playwright/`, en particulier `navigation-omega`, `atlas-omega`, `lexicon-visee` et `suivi-contact`. Les essais automatisés de classe utilisent des données fictives. L’écoute en salle, le tactile sur iPhone physique et le comportement d’un groupe réel sont des essais humains à part. [État des essais](../REPRISE.md)

## update-word-lists.js

Script pour télécharger et mettre à jour automatiquement les listes de mots depuis des sources libres de droits.

### Sources utilisées (toutes libres de droits)

1. **dwyl/english-words** (Public Domain)
   - Grande liste de mots anglais
   - URL: https://github.com/dwyl/english-words

2. **google-10000-english** (MIT License)
   - Top 10,000 mots anglais les plus communs
   - Déjà filtré pour exclure les gros mots
   - URL: https://github.com/first20hours/google-10000-english

3. **SCOWL** (Public Domain)
   - Listes de mots orientées correcteur orthographique
   - URL: https://github.com/en-wl/wordlist

### Utilisation

```bash
npm run update-word-lists
```

ou

```bash
node scripts/update-word-lists.js
```

### Fonctionnement

1. **Télécharge** les listes depuis les sources GitHub (fichiers texte bruts)
2. **Filtre** les mots :
   - Longueur entre 4 et 6 lettres
   - Uniquement des lettres (A-Z)
   - Exclut les mots inappropriés (depuis `inappropriate-words.txt`)
3. Regroupe les propositions par longueur, puis y ajoute chaque cible du [catalogue pédagogique relu](../lib/games/enigma-scroll-targets.ts). Le mot secret, sa traduction et son niveau se choisissent dans ce catalogue.
4. Écrit trois tableaux de mots dans `public/data/enigma-guesses-4.json`, `enigma-guesses-5.json` et `enigma-guesses-6.json`. Le jeu charge celui de la longueur en cours.

### Personnalisation

#### Ajouter des sources

Éditez `scripts/update-word-lists.js` et ajoutez dans `WORD_LIST_SOURCES` :

```javascript
{
  name: 'ma-source',
  url: 'https://example.com/words.txt',
  description: 'Description de la source'
}
```

#### Filtrer des mots inappropriés

Éditez `lib/games/words/inappropriate-words.txt` et ajoutez un mot par ligne :

```
WORD1
WORD2
...
```

#### Changer les longueurs de mots

Le générateur, le chargeur du jeu et le catalogue prévoient 4, 5 et 6 lettres. Une nouvelle longueur implique d’adapter ces trois endroits et de vérifier une partie de bout en bout.

### Mise à jour automatique

Pour automatiser les mises à jour, vous pouvez :

1. **Ajouter un cron job** (Linux/Mac) :
   ```bash
   # Mettre à jour tous les lundis à 2h du matin
   0 2 * * 1 cd /path/to/project && npm run update-word-lists
   ```

2. **GitHub Actions** : Créer un workflow qui met à jour les listes périodiquement

3. **Script de build** : Intégrer dans votre processus de déploiement

### Notes

- Les listes sont téléchargées depuis GitHub (fichiers bruts)
- Tous les mots sont normalisés en MAJUSCULES
- Les doublons sont automatiquement supprimés
- Les mots sont triés alphabétiquement
- Le script affiche les nombres de cibles et de propositions dans le terminal. Les fichiers JSON contiennent les mots.

