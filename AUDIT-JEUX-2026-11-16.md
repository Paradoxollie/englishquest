# English Quest : audit des 9 jeux (16 novembre 2026)

**Mise à jour du 23 novembre 2026.** Les deux jeux d’écoute ont depuis reçu un pack américain enregistré. Lexicon Blaster a reçu de nouvelles familles de mots et une correction de visée testée en public. Pour évaluer le naturel des voix et le tir sur les téléphones des élèves, reprendre les cas décrits dans le [suivi actuel](REPRISE.md). [Détail du pack audio](public/audio/README.md)

Audit fait en lecture seule sur le code au commit `7993b56`, identique au site en ligne. Rien n'a été modifié.

**Ce qui a été fait**
- **Contrôles automatiques** : `npm test` (tous verts, y compris les nouveaux tests de Spell Strike et Echo Signal), `tsc` (0 erreur), `lint` (0 erreur).
- **Audit navigateur** sur le site en ligne : 15 scénarios qui jouent les 9 jeux du début à la fin (pause, reprise, rejouer, mobile). Tous passent.
- **Les deux nouveaux jeux** : lecture complète du code et de tous les contenus (150 mots, 40 scénarios d'écoute), parties réelles en invité sur ordinateur et téléphone, en clair et en sombre, plus des cas limites (son coupé, navigateur sans synthèse vocale, voix uniquement françaises, toujours répondre la même chose).

Légende : **[vérifié]** = constaté dans le code, les données ou en jouant ; **[à vérifier]** = suspicion non confirmée.

---

## 1. Verdict

| Jeu | Fonctionne | Qualité pédagogique | À faire avant jeudi |
|---|---|---|---|
| Grammar Rush | Oui | Correcte | Rien de bloquant |
| Speed Verb Challenge | Oui | Bonne | Rien de bloquant |
| Enigma Scroll | Oui | Moyenne | Rien de bloquant |
| Lexicon Blaster | Oui | Moyenne | Rien de bloquant |
| Flash Translation | Oui | Faible (réflexe) | Rien de bloquant |
| Wordfall | Oui | Faible (copie) | Rien de bloquant |
| Flashback | Oui | Faible (hasard) | Rien de bloquant |
| **Spell Strike** (nouveau) | Oui | **Bonne idée, mal réalisée** | **Oui : 4 bloquants** |
| **Echo Signal** (nouveau) | Oui | **Bonne idée, mal réalisée** | **Oui : 4 bloquants** |

**En une phrase** : les 7 jeux d'origine sont solides techniquement ; les deux nouveaux tournent sans planter, mais on peut y réussir **sans écouter** et **sans savoir écrire**. Une inspectrice d'anglais s'en rendrait compte en deux minutes.

**Bonne nouvelle** : tout ce qui est bloquant se corrige en une journée.

---

## 2. Les 7 jeux d'origine

### Ce qui va [vérifié]
- **Fonctionnement** : les 7 jeux se jouent du début à la fin sur le site en ligne, sans erreur.
- **Correctifs du 15 novembre toujours en place** :
  - mots pour adultes filtrés dans Wordfall ;
  - vitesse de départ adaptée aux débutants ;
  - outils de triche coupés dans Lexicon Blaster ;
  - synonymes et connecteurs corrigés ;
  - réponses mélangées dans Grammar Rush ;
  - classements réservés aux connectés ;
  - sessions de partie liées au joueur.

### Ce qui reste à améliorer (non bloquant pour jeudi) [vérifié]
- **Grammar Rush** : 305 questions sur 500 n'ont que 2 choix (une chance sur deux au hasard), et il n'y a toujours pas d'explication après chaque réponse.
- **Speed Verb Challenge** : toujours pas de paliers de difficulté. Les 151 verbes tombent dans n'importe quel ordre : *forgo* ou *wring* peuvent sortir en « Facile ».
- **Enigma Scroll** : faux amis traduits tels quels (FLAIR = « flair », AMPLE = « ample »).
- **Wordfall** : ARGUE traduit « argumenter » au lieu de « se disputer » ; le mode Vocabulaire fait recopier le mot et sa traduction, ce n'est pas du rappel.
- **Flash Translation** : une pause pendant la réponse s'ajoute au temps de réaction (`flash-translation-game.tsx:226`).
- **Flashback** : le jeu porte sur la mémoire visuelle du mot, pas sur son sens.

---

## 3. Spell Strike (dictée et orthographe)

**L'idée** : on entend un mot anglais (seul ou dans une phrase), on lit un indice, on tape l'orthographe exacte. 10 manches, 150 mots (30 par niveau).

### Ce qui va [vérifié]
- **Technique** : jeu stable, 0 avertissement de lint, intégration identique aux autres jeux (sessions, XP, défi du jour, badge, classement).
- **Saisie robuste** : tolère majuscules, espaces et apostrophes typographiques ; accepte les variantes UK/US (favourite / favorite) ; résiste aux appuis répétés sur Entrée.
- **Affichage** : correct en 390 px et en mode sombre, mode concentration sur téléphone fonctionnel.

### Bloquant
1. **Couper le son coupe aussi la dictée, sans rien dire** [vérifié] (`audio.ts:250`). Le bouton s'appelle « Couper les effets sonores », mais il rend le jeu muet ; la préférence vaut pour tous les jeux. L'élève croit que le jeu est cassé.
2. **Rien n'est prévu sans voix anglaise** [vérifié]. Sans synthèse vocale : silence total, sans message. Avec seulement des voix françaises (Firefox sur un PC de collège, par exemple), le mot serait lu avec l'accent français [à vérifier]. Le « mode sans son » est à cocher soi-même, et il n'affiche que l'alphabet phonétique, que les élèves ne savent pas lire.
3. **La réponse est souvent écrite à l'écran** [vérifié] :
   - 27 mots sur 150 ont une traduction identique au mot (« Sens : orange », animal, question, restaurant, possible…) ;
   - environ 70 indices épellent le mot (« lis-ten », « Yester + day »), et l'indice tape en plus la première lettre.
4. **Une vingtaine d'erreurs de contenu** (section 3.1).

### Important
5. **La correction lettre par lettre est fausse** [vérifié] (`spellStrike.ts:301`). Elle compare position par position :
   - « liten » pour *listen* : E et N marqués faux alors qu'ils sont justes ;
   - « dinnerr » : tout en vert alors que la réponse est fausse ;
   - « favorite » (accepté) : 4 cases rouges alors que la réponse est juste.
6. **La correction disparaît au bout de 2,1 s** et la manche suivante démarre seule : on n'a pas le temps de comprendre son erreur.
7. **Bilan de fin trompeur** : le titre « Mots à revoir » liste les 10 mots, justes et faux s'affichent pareil, et ce que l'élève a tapé n'apparaît pas.
8. **Facile et Moyen ne diffèrent que par les points** ; même en Difficile, la traduction, le nombre de lettres et la phrase restent affichés, donc l'écoute est facultative.
9. **Majuscules non vérifiées** : « monday », « february » sont acceptés, alors que c'est justement l'erreur typique des francophones.
10. **Clavier qui se ferme sur téléphone** : le champ est désactivé entre deux mots. Sur iPhone, il faut sans doute retoucher le champ à chaque mot [à vérifier].
11. **Classement** : le niveau de vocabulaire n'est pas enregistré ; jouer en A1 et en « Difficile » rapporte le plus.

### Mineur
- **Voix** : une voix américaine est choisie quand il n'y a pas de voix britannique, alors que l'alphabet phonétique et les indices sont britanniques.
- **Anti-triche** : le contrôle du score est un peu large (temps minimum accepté 0,9 s par mot contre environ 1,5 s en réalité).
- **Fin de partie** : « Bien joué ! » s'affiche à 2/10.
- **Français** : « appuie sur le contexte » → « appuie-toi sur le contexte ».
- **Code** : barème recopié en double ; entrée de mission jamais utilisée.

### 3.1 Erreurs de contenu
- **little** : « Wait a little moment » est un calque du français → « My ____ brother is six. »
- **bicycle** : l'indice dit « deux syllabes », il y en a trois (bi-cy-cle).
- **separate** : traduit « séparer » (verbe) alors que la phrase utilise l'adjectif → « séparé(e)s ».
- **noticeable** : « remarquable » est un contresens → « visible, perceptible ».
- **superintendent** : traduction sans rapport avec la phrase, et mot de niveau C1 → remplacer (*receipt*).
- **pronounce** : « pronounce this silent letter » est illogique → « How do you ____ this word? »
- **possession** : « Keeping calm is his best possession » est un contresens.
- **Indices faux** :
  - *achieve* : « pas d'e muet » (il y en a un) ;
  - *beginning* : « un seul g » (il y en a deux) ;
  - *through* : « -ough muette » ;
  - *available* : « un seul l » ;
  - *February* : « r muet », contredit par la phonétique ;
  - *people*, *purple* : la position des lettres décrite est fausse.
- **Tournures peu naturelles** : *together* (« solve this mission »), *evening* (« revise together this »), *perseverance*, *appearance*.
- **Phonétique** : notation britannique et américaine mélangées (/ər/ d'un côté, r muet de l'autre).

---

## 4. Echo Signal (compréhension orale)

**L'idée** : 4 messages audio courts (annonces, dialogues) avec 2 questions chacun, choisis selon le niveau. 40 scénarios, 8 par niveau.

### Ce qui va [vérifié]
- **Technique** : jeu stable, 0 avertissement, tests verts, intégration complète (sessions, contrôle du score exact, classement, badge, missions).
- **Contenu** : 40 situations britanniques variées et vivantes (métro, ferry Douvres–Calais, Bletchley Park…), anglais globalement correct, chaque explication cite la phrase entendue.
- **Déroulement** : transcription affichée, raccourcis clavier 1-4, mode concentration, « mode sans son » qui affiche le texte (65 % des points).
- **Nettoyage** : l'audio s'arrête quand on quitte la page.

### Bloquant
1. **On gagne sans écouter** [vérifié]. La bonne réponse est l'option 2 dans 58 questions sur 81, et l'option 4 ne l'est jamais. Les options ne sont pas mélangées. En répondant toujours « 2 » sans écouter : 8/8, 8/8 et 7/8 au niveau B1.
2. **La bonne réponse est presque toujours la plus longue** [vérifié] : 65 questions sur 80.
3. **Le retour pédagogique est invisible** [vérifié]. Le jeu passe tout seul à la suite après 1,7 s ou 2,5 s ; l'explication et la transcription sont souvent sous le bas de l'écran (toujours sur téléphone). L'élève ne voit jamais ce qu'il a manqué.
4. **Son coupé ou synthèse absente : jeu muet sans avertissement** [vérifié], comme pour Spell Strike. Le bonus de « première écoute » est quand même accordé.

### Important
5. **Bug des voix** [vérifié] (`audio.ts:172`). Le motif qui cherche une voix d'homme (« male ») trouve aussi « Female » : sur Chrome, Sam et Maya peuvent avoir la même voix féminine. Un vendeur, un pharmacien ou un fondateur sont lus par une voix de femme.
6. **Accent** : sans voix britannique installée, tout est lu en américain, même les scènes à York ou Londres. Les voix sont lues sans attendre leur chargement (liste parfois vide au premier clic) [à vérifier].
7. **Lecture** : le bouton « Lecture en cours… » reste cliquable et consomme une écoute.
8. **« Difficile » est identique à « Moyen »** : 2 écoutes dans les deux cas, alors que les règles disent le contraire.
9. **Réponses données par l'écran** : le titre ou l'explication révèle la réponse dans 4 scénarios (section 4.1).
10. **Bilan final pauvre** : ni la question, ni la réponse de l'élève ; la transcription forme un bloc gris illisible ; le bouton « Réécouter » est déformé.
11. **Pédagogie** :
    - toutes les questions portent sur un détail explicite (heure, lieu, prix), aucune sur le sens général ;
    - en B1/B1+, un document fait une seule phrase d'environ 28 mots : c'est du A2 long.
12. **Classement et XP** : le niveau n'est pas enregistré ; l'XP est la même en A1 et en B1+, et la même en mode texte.

### Mineur
- **Partie** : pas de pause ni de gestion du changement d'onglet.
- **Fin de partie** : « Bien joué ! » s'affiche à 1/8.
- **Code** : bloc de lecture copié 3 fois, `actions.ts` identique à celui de Spell Strike, constantes en double.
- **Audio enregistré** : les fichiers MP3 prévus ne seraient peut-être jamais détectés sur Vercel [à vérifier avant d'enregistrer des fichiers].

### 4.1 Erreurs de contenu
- **Réponse donnée par l'écran** :
  - **l1-directions-park** : le titre « Trouver la librairie » donne la réponse ;
  - **l2-cinema-booking** : l'explication de Q1 donne la réponse de Q2 ;
  - **l5-sleep-study** : une option de Q1 donne la réponse de Q2 ;
  - **l5-news-urban-trees** : le titre donne la réponse, et Leeds n'est jamais cité dans l'audio.
- **Anglais non contracté et artificiel** (« it is Maya », « Let us meet », « Do not forget ») dans 5 scénarios de niveau A1-A2 → « it's », « Let's », « Don't ».
- **Erreurs d'anglais** :
  - *l3-lost-parcel* : « I tried delivering » → « I tried to deliver » ;
  - *l3-bike-repair* : « your bike brakes » → « your bike's brakes » ;
  - *l3-science-project* : « I already drew » → « I've already drawn » ;
  - *l2-sport-rain* : « outdoor pitch » pour du basket → « outdoor court ».
- **Contextes incohérents avec l'audio** : *l1-museum-ticket*, *l3-pharmacy-advice* (« pastilles » ≠ *tablet*), *l3-bike-repair* (« devis » sans prix), *l4-tech-announcement*, *l5-dialogue-misunderstanding* (« downstairs » ≠ « rez-de-chaussée »).
- **Distracteurs absurdes** : *l2-dentist-reschedule* (« 15 h 11 »), *l2-cooking-recipe*, *l3-hotel-booking*, *l5-museum-audio*, *l5-startup-pitch*.

---

## 5. Divers vus en passant
- **Accueil** : le site annonce encore « 7 jeux » (titre de section, chiffre clé, étape 3) alors qu'il y en a 9 (`app/page.tsx:27, 106, 195`).
- **Style** : ton nouveau style est propre et cohérent en clair et en sombre sur la page Jeux et les écrans de départ des deux nouveaux jeux.

---

## 6. Plan de correction pour jeudi (environ une journée)

| # | Correction | Jeu | Durée |
|---|---|---|---|
| 1 | Mélanger les 4 options à chaque partie + test « aucune position correcte à plus de 35 % » | Echo Signal | 30 min |
| 2 | Supprimer l'avance automatique : bouton « Continuer », défilement jusqu'à la correction, transcription visible | Echo Signal, Spell Strike | 1 h |
| 3 | Séparer « effets sonores » et « voix » ; sans voix anglaise : bandeau d'avertissement et passage automatique en mode texte | Les deux | 1 h |
| 4 | Corriger le choix des voix (homme/femme, voix différente par personnage, attendre le chargement) | Les deux | 1 h |
| 5 | Masquer la traduction quand elle est identique au mot, réécrire les indices sans épeler le mot | Spell Strike | 1 h 30 |
| 6 | Correction lettre par lettre avec alignement, et « Tu as écrit X → il fallait Y » | Spell Strike | 1 h |
| 7 | Corriger les erreurs de contenu listées (sections 3.1 et 4.1) | Les deux | 2 h |
| 8 | Bilans de fin : question, réponse de l'élève, bonne réponse ; « Bien joué » selon le score | Les deux | 1 h |
| 9 | Accueil : « 9 jeux » | Site | 5 min |

**Pour la démonstration de jeudi** : utiliser **Edge** plutôt que Chrome ou Firefox. Edge a des voix « Natural » britanniques de bonne qualité (Libby, Ryan) [à vérifier sur ton ordinateur], et le son des jeux doit être activé.
