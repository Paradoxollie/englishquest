# Audit du site et des jeux

Audit du 13 octobre 2026. Les sept jeux ont été examinés et plusieurs bugs
reproduits puis corrigés. Les vérifications couvrent les moteurs, les interfaces,
les scores, les récompenses, les missions et les cinq niveaux du parcours.

Les fichiers existants ont été conservés. La version récente de GitHub
(`origin/main`, commit `0a8c9e4` du 10 octobre) a servi de référence. Les
corrections du code sont regroupées dans cette version pour publication sur
GitHub et Vercel. Les quatre migrations Supabase du 13 octobre sont appliquées
et vérifiées.

## Corrections des jeux

| Jeu | Bugs corrigés | Vérifications |
| --- | --- | --- |
| Enigma Scroll | Mots de mauvaise longueur dans la liste de six lettres, compteur de série trop élevé, réponse acceptée après expiration, saisie tactile fragile. | Listes de 4, 5 et 6 lettres, lettres répétées, saisie incomplète, fin du chrono, clavier tactile. |
| Wordfall | Réutilisation possible d'un ancien mot en mode libre ; lettres encore proposées alors que tous leurs mots avaient été utilisés. | Réponse complète anglais/français, accents et expressions, mode libre, répétition, pause, perte des vies et relance. |
| Lexicon Blaster | Une cible pouvait compter plusieurs fois ; tirs traversant les mots ; bonus de vague répété ; cibles du boss incohérentes ; ancien aperçu conservé ; reprise par Échap et déplacement tactile incorrects. | Collisions et transitions dans le moteur, classification des mots, boss, contrôles clavier, pause et règles de déplacement tactile. |
| Flash Translation | Protection des réponses et touches répétées, temporisations et retours de sauvegarde après relance. | Partie de dix mots, une erreur et sa pénalité de cinq secondes, temps final, fin et relance. |
| Flashback | Mot oublié après une erreur, premier mot compté deux fois, réponses multiples et résultat d'une ancienne partie. | Mémoire après erreur, trois erreurs, vocabulaire de fin, relance ; simulation de 500 manches. |
| Speed Verb Challenge | Passer un verbe conservait la série et ne comptait pas comme tentative ; réponses tardives ou multiples ; traductions exigeant les parenthèses explicatives. | Trois difficultés, formes alternatives, traduction ordinaire, série, passage, expiration et statistiques. |
| Grammar Rush | Retour de correction affiché sur la question suivante ; dernière question disparaissant trop tôt ; doubles réponses et sauvegarde d'une ancienne partie. | Question maintenue pendant la correction, transition, limites du score, chrono et relance. |

Les classements et records personnels sont actualisés après une sauvegarde.
La recherche des records ne s'arrête plus arbitrairement aux premières
1 000 ou 2 000 lignes.

## Progression et comptes

Les mises à jour concurrentes des gains ne doivent plus écraser les XP ou l'or
d'une autre partie. Le défi quotidien conserve les jeux joués simultanément,
verse son bonus une seule fois et affiche le montant réellement gagné. Le
changement de journée utilise l'heure de Paris, y compris aux changements d'heure.

Une mission de cours et un examen enregistrent leur réussite et leur récompense
dans une transaction. Une panne annule l'ensemble ; une seconde demande ne
verse pas une seconde récompense. Ces fonctions sont exécutables seulement par
le serveur.

La règle Supabase qui provoquait une récursion lors de la lecture des profils
est corrigée. Après accord explicite, les écritures directes des rôles, soldes,
scores et progressions ont été réservées au serveur. Les métadonnées d'inscription
ne peuvent plus créer un administrateur. Les utilisateurs existants et leurs
données ont été conservés.

La recherche des anciens comptes par pseudo parcourt désormais toutes les
pages nécessaires. Les constantes de navigation et la règle de réussite d'un
quiz sont séparées des modules serveur ; l'accès administrateur Supabase est
protégé par `server-only`.

## Cours et niveaux

Les 50 cours et leurs 500 questions ont été comparés à la banque utilisée par
Grammar Rush et le test de niveau. Le doublon « Heavyer » du cours 18 a été
remplacé par « Heaviest », sans changer la bonne réponse « Heavier ».

Les files de questions ont été contrôlées sur les cinq chapitres, d'A1 à C1,
avec 300 scénarios de tirage. Les examens et le test de niveau rejettent les
réponses partielles, les questions d'un autre chapitre et les choix inexistants.
Les quiz ne comptent plus deux réponses ni ne sautent une question lors de clics
très rapides ; une ancienne sauvegarde ne remplace plus le résultat d'une reprise.

## Preuves de test

- `npm test` : contrôles hors ligne des sept moteurs, des récompenses concurrentes,
  des quiz, des niveaux et des connexions, sans écriture distante ni e-mail.
- Navigateur : ordinateur et largeur mobile de 390 pixels, captures inspectées,
  démarrage des sept jeux, difficultés, saisie, pause, expiration, fin et relance.
  Les 14 scénarios finaux passent sur la version de production locale Next.js
  16.4, sans erreur de console. Les bibliothèques installées correspondent
  maintenant au fichier de versions. Compilation, TypeScript et lint réussis ;
  les avertissements de lint restants sont conservés dans le rapport JSON.
- Supabase réel : les sept fonctions de sauvegarde ont enregistré les scores,
  difficultés, durées et gains attendus pour un compte temporaire authentifié.
  Les bonus quotidiens et missions étaient simulés dans ce contrôle de sauvegarde.
- PostgreSQL réel : des transactions entièrement annulées ont vérifié les
  missions et examens atomiques, le versement unique, l'échec sans progression
  prématurée et l'inscription au rôle étudiant.
- Connexion par le formulaire, accueil protégé et profil : vérifiés dans un
  navigateur avec un autre compte temporaire. Le chargement complet de la
  boutique n'est pas couvert par ce contrôle.
  La connexion et ces pages ont aussi été revérifiées après l'alignement sur
  Next.js 16.4 ; les quatre compteurs de données de ce compte sont revenus à zéro.
- Nettoyage : les comptes temporaires ont été supprimés par leur identifiant
  exact. La vérification finale confirme zéro compte de test et zéro score,
  progression ou examen orphelin. Aucun e-mail n'a été envoyé.

Les preuves détaillées sont dans `output/audit-2026-10-13/` et
`output/playwright/audit-2026-10-13/`. Les échecs intermédiaires restent dans les
artefacts historiques ; les rapports finaux identifient les contrôles réussis.

## Portée du résultat

Les contrôles automatisés ne remplacent pas une partie prolongée sur chaque
modèle de téléphone ni une utilisation en classe. Les boss et vagues avancées
ont des tests de moteur ; le navigateur vérifie les contrôles et les transitions
ciblées. Les annonces de sept jeux et les exclusions des anciennes copies du
projet ont également été corrigées.

La publication sur GitHub déclenche le déploiement Vercel de la branche `main`.
Les fonctions transactionnelles nécessaires sont déjà présentes dans Supabase ;
la disponibilité en ligne doit être vérifiée après compilation du déploiement.
