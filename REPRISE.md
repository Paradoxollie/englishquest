# Reprendre English Quest Omega

**Point arrêté le lundi 23 novembre 2026, heure de Paris.** Le site public dessert la révision `134c501` de `main`, vérifiée sur l’alias de production le 23. Ce dossier contient aussi les travaux historiques et les documents de reprise. Pour une nouvelle conversation, ouvrir ce fichier depuis la racine `D:\Englishquest\englishquest`. [English Quest Omega](https://englishquest-omega.vercel.app)

## Ce qu’un visiteur trouve aujourd’hui

| Entrée | Parcours réellement proposé |
| --- | --- |
| Accueil et Jeux | Le site se découvre sans inscription. Neuf jeux sur `/play`, un accès court via `/essayer`. Un compte permet notamment de conserver les scores, de gagner de l’or et de personnaliser son profil. |
| Cours | `/tous-les-cours` donne accès aux 50 cours individuellement. `/tous-les-cours/parcours` reprend leur carte de cinq chapitres, d’A1 à B1+. Un cours guidé se valide par lecture et quiz à 80 %. L’entraînement complémentaire donne une autre occasion de réutiliser la notion. Le positionnement permet de rejoindre le chapitre adapté. |
| Aventure | `/quest` ouvre encore la carte des 50 missions et invite à essayer la BD. `/quest/atlas` ouvre directement l’Atlas. Ses **15 escales** ont chacune une page, soit **92 étapes** en trois chapitres. Les 50 cours et les 15 escales se comptent séparément. |
| Collection | Quatre albums, 27 pièces au catalogue issu de la refonte, dont 12 personnages. Portrait pour le classement, silhouette pour l’essayage. Les achats historiques sont repris. Le vestiaire permet aussi de viser des vaisseaux, des décors et des titres. |
| Professeurs | `/profs` présente le fonctionnement, `/teachers` donne accès à l’espace autorisé. Un professeur crée ses classes et leurs codes, assigne des activités, suit ses élèves et peut projeter une séance. Les autres classes restent privées. Les élèves rejoignent leur classe avec un compte et le code de leur professeur depuis `/rejoindre`. |
| Administration et contact | Le gestionnaire garde l’administration. Le bouton **Admin** sur téléphone devient **Tableau de bord** sur un écran assez large. **Profs / Espace prof** ouvre les outils d’un professeur. Les réponses aux demandes arrivent dans **Messages** pour les comptes et sur un lien de suivi pour les invités. |

Les neuf jeux sont Enigma Scroll, Lexicon Blaster, Speed Verb Challenge, Wordfall, Flash Translation, Grammar Rush, Flashback, Spell Strike et Echo Signal. Lexicon Blaster conserve l’adresse historique `/play/space-lex`. Les deux derniers de la liste travaillent principalement l’écoute. [Catalogue des jeux](lib/games/config.ts)

## Les derniers changements vérifiés

| Date | Ce qui a été livré et essayé |
| --- | --- |
| 18–20 novembre | Révision des 50 cours et des neuf jeux, enregistrements américains de Spell Strike et Echo Signal, albums et personnages, reprise des acquis invités. La première vague de Lexicon Blaster explore sa famille de mots. Les mots manqués peuvent revenir plus tard. [Relecture pédagogique](RELECTURE-50-COURS-2026-11-18.md) |
| 21 novembre | Accès limités aux classes du professeur et séances synchronisées. Le professeur choisit l’ordre et la durée des jeux ou cours. Les appareils suivent la même horloge, le professeur voit les réponses, puis le podium révèle les places 3, 2, 1. Reconnexion et séance à trente élèves simulés testées. [Base et essais](supabase/README.md) |
| 22 novembre | Le cours 1 précise ce que la phrase à trous attend avec *has got*. La correction commune a été contrôlée en solo et en classe. Les 15 escales de l’Atlas ont été parcourues à 390 et 1 366 pixels. Reprise en invité après fermeture et entre deux navigateurs connectés vérifiée. L’Atlas est disponible au public à titre d’essai. |
| 22 novembre | Dans Lexicon Blaster, le clic et le toucher sélectionnent le mot visé, même près du bas de l’écran. Essai public au clavier, à la souris et en format téléphone. Le retour initial d’une enseignante est traité en `c27949f`. |
| 23 novembre | Les échanges privés accueillent plusieurs réponses successives. Les cinq anciennes réponses ont été conservées. La barre principale présente Accueil, Aventure, Cours, Jeux et Collection à partir de 320 pixels. Le gestionnaire a pu ouvrir le tableau de bord depuis le petit écran. Le jeu Wordfall rend l’espace au plateau pendant une partie puis restitue la navigation à la sortie. |

## Pédagogie et direction de l’Atlas

Les trois arcs publiés sont **Le premier itinéraire** (1–5), **Le courrier de l’île invisible** (6–10) et **Le musée après minuit** (11–15). Pour la suite, partir de l’escale 16. Le projet de **200 à 250 escales** est un objectif à long terme. Il reste à construire la progression linguistique des futurs chapitres et à la tester avec de vrais débutants. [Catalogue des escales](lib/adventure/catalog.ts)

- Garder **Découvrir**, **S’entraîner**, **Mission finale** comme repères. Partir d’une situation compréhensible, dévoiler une bulle ou une action à la fois, retirer l’explication pendant la question et offrir une aide après une erreur. La sortie et la reprise exacte doivent rester faciles à retrouver.
- Commencer en français pour les consignes, avec des activités en anglais. Passer peu à peu à des consignes anglaises. Introduire le sens et les exemples avant de demander un réemploi personnel. Faire revenir les bases, dont le sujet et le verbe, avant d’accroître la difficulté.
- Varier les gestes et les buts entre chapitres. Prévoir de la lecture, de l’écoute ciblée, de l’écriture, des essais avec correction et des quiz dont les questions et les réponses changent d’ordre. L’expression orale enregistrée reste une piste ultérieure.
- Garder Maya et Sam reconnaissables, avec des tenues adaptées à l’univers. Viser une BD de super-héros plaisante aussi aux adolescents et aux adultes, avec plusieurs images utiles par escale. Placer les clins d’œil à la pop culture dans l’action, les décors ou les dialogues, avec des créations originales. Examiner les mains, les reflets et les objets tenus dans le cadrage réellement affiché sur téléphone.
- La progression invitée reste sur l’appareil. À la connexion, le joueur peut reprendre ses étapes invitées. Le compte permet ensuite de continuer ailleurs. Tester aussi un changement de compte sur un appareil partagé. Les cours HTML complets conçus pour les professeurs dans le dossier de production de cours constituent un projet distinct.

## Ce qui mérite le prochain essai

1. **Une vraie classe en décembre.** Faire essayer un jeu, une leçon et une séance synchronisée sur les téléphones des élèves. Relever où ils hésitent, s’ils comprennent comment quitter et reprendre, et si le tir de Lexicon atteint le mot qu’ils pensent avoir choisi. Le test de trente participants simulés laisse ouverte la question du Wi-Fi, des appareils et du volume réel sur les offres gratuites.
2. **Écoute et compréhension.** Sur un iPhone physique et un téléphone Android, essayer une salutation de l’Atlas, puis une manche de Spell Strike et d’Echo Signal. Écouter le naturel des mots et dialogues américains. Sur WebKit Windows, la lecture intégrée de l’Atlas a parfois bloqué. L’accès à l’enregistrement original et le mode écrit ont été testés. Un changement de voix se juge d’abord sur un extrait court.
3. **Cours et aventure.** Poursuivre la relecture des réponses acceptables, des consignes et du contraste au fil des vrais retours. Les 1 150 exercices ont eu des contrôles automatiques, et les textes des 50 cours ont été relus. La validation éditoriale de chaque variante reste un travail distinct. Pour le prochain chapitre BD, essayer d’abord une nouvelle mécanique et observer si le joueur sait réutiliser l’anglais appris.
4. **Fréquentation.** Le compteur actuel renseigne sur les pages ouvertes. Le jeu en invité ne transmet aucun score au serveur. Si la question prioritaire devient « combien commencent et finissent une partie ? », étudier deux compteurs agrégés par jeu, sans identifiant de visiteur, avec les coûts et la durée de conservation prévus. [Comparaison et méthode](docs/FREQUENTATION-2026-11-23.md)
5. **Demandes d’accès prof.** Une invitation individuelle à créer un compte et à écrire une fois connectée a déjà été envoyée pour une demande concernant deux classes. L’envoi est confirmé, la lecture reste inconnue. À réception du retour, rattacher la bonne demande au bon compte et accorder le rôle professeur. Le site affiche les réponses dans Messages ou sur le suivi invité. Il n’envoie actuellement aucun e-mail automatique de réponse. L’autorisation exceptionnelle d’expédition personnelle concernait uniquement ce premier contact.
6. **Diffusion et confidentialité.** Des enseignants ont répondu favorablement dans les groupes Facebook. Présenter le site entier, gratuit, avec inscription facultative, et solliciter le retour des enseignants et des élèves. Les deux propositions aux médias éducatifs étaient destinées à la relecture. Les fichiers de diffusion et le crédit musical de *Hot Swing* se trouvent localement dans `output/diffusion/`. L’alias Omega possède une validation Search Console. La durée opérationnelle de conservation du journal de visites et la purge effective restent à vérifier.

Deux retours précis à garder pour le prochain essai : la présentation des aiguillages de l’escale 9, **Le rail des lucioles**, a déplu à Pierre, et il avait entendu une déformation de *hello* à la première escale. Rejouer le passage et réécouter le fichier sur téléphone aidera à localiser le défaut. Pour l’autre ancien fil invité, la remise initiale du lien reste à confirmer.

## Exploitation et dossiers

| Pour reprendre | Source |
| --- | --- |
| Lancer le site et retrouver les routes | [README](README.md), [scripts et essais](scripts/README.md) |
| Jeux, cours classiques et décisions éditoriales | [Audit des neuf jeux](AUDIT-JEUX-2026-11-16.md), [relecture des 50 cours](RELECTURE-50-COURS-2026-11-18.md), [idées de futurs jeux](IDEES-DE-JEUX-RETROUVEES.md) |
| Comprendre les décisions antérieures | [Audit du 15 novembre](AUDIT-2026-11-15.md), [bilan du 18](BILAN-2026-11-18.md), [bilan du 19](BILAN-2026-11-19.md), [plan de travail](PLAN-AMELIORATION.md) |
| Données, droits et messages | [Base et migrations](supabase/README.md), [règles de confidentialité](.cursor/rules/security-and-rgpd.md) |
| Historique des opérations anciennes | [Index des anciennes procédures](docs/archive/README.md), [audit du 13 octobre](AUDIT-JEUX-2026-10-13.md) |
| Sources des médias et essais | [Audio des jeux](public/audio/README.md), [illustrations de l’Atlas](public/art/passage), [tests automatisés](scripts/tests) |

Les captures de recette, les vidéos de diffusion, le journal détaillé `progress.md` et les sauvegardes sous `output/` restent consultables dans ce dossier de travail local. Une copie neuve du dépôt peut en être dépourvue. Le présent point de reprise contient les décisions nécessaires au prochain chat. Les URL de suivi privées, codes de classe, coordonnées et clés d’accès restent hors de ces notes. L’exploitation reste sur les offres gratuites.

Lors de la passation du 23, la suite locale `npm test` est passée, y compris les contrôles de droits, de séance à trente participants simulés et de podium. Le contrôle audio a retrouvé les 150 mots, 150 phrases et 40 messages attendus. Les deux requêtes du bilan ont été rejouées telles qu’elles sont écrites. Les 48 valeurs du tableau et les liens locaux des 37 documents du projet ont été vérifiés.

Quatre fichiers Markdown sous `output/` servent de pièces datées. Le dossier `backups/` garde l’état avant les migrations du 15. Sous `playwright/`, `audit-omega-20261119/jeux/bilan-jeux.md` et `polish-2026-11-18/jeux/progress.md` gardent les constats de recette d’origine. `lexicon-visee/next-generated-agent-rules.md` est une trace générée par l’outillage. Les consignes applicables au prochain chat sont dans le [guide de reprise du dépôt](AGENTS.md).
