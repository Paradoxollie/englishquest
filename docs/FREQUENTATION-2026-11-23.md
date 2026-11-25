# Fréquentation d’English Quest Omega les 22 et 23 novembre 2026

**À 19 h 07, heure de Paris**, lundi comptait environ un tiers de pages ouvertes de moins que dimanche au même moment. Les pages individuelles de jeu ont été ouvertes **423 fois lundi, contre 411 dimanche**. Une partie de l’audience a exploré le site pendant plusieurs minutes. Le volume réel de parties jouées sans compte reste inconnu.

## Comparaison

Les deux premières colonnes couvrent chacune minuit à 19 h 07, fin exclue. La dernière donne le dimanche entier à titre de repère.

| Indicateur | Dim. 22 à 19 h 07 | Lun. 23 à 19 h 07 | Dim. 22 entier |
| --- | ---: | ---: | ---: |
| Ouvertures de pages enregistrées | 4 430 | 2 937 | 4 923 |
| Empreintes réseau distinctes toutes pages confondues | 246 | 163 | 292 |
| Ouvertures d’une page individuelle de jeu | 411 | 423 | 455 |
| Empreintes ayant ouvert au moins un jeu | 90 | 78 | 103 |
| Ouvertures d’une page individuelle de cours | 571 | 345 | 611 |
| Ouvertures de la carte Aventure ou de l’Atlas | 257 | 163 | 285 |
| Pages dont le site d’origine déclaré était Facebook | 83 | 9 | 94 |
| Visites reconstituées sans passage dans le tableau d’administration | 497 | 264 | 564 |
| Dont une seule page distincte observée | 146 | 67 | 172 |
| Dont plusieurs pages et des traces espacées d’au moins 2 min | 83 | 55 | 83 |
| Dont plusieurs pages et des traces espacées d’au moins 5 min | 39 | 33 | 39 |
| Dont au moins 5 min, plusieurs pages et une page de jeu | 19 | 29 | 19 |
| Scores de jeu enregistrés par des comptes hors administration | 1 | 0 | 1 |
| Cours achevés avec un quiz, comptes hors administration | 2 | 0 | 2 |
| Cours reconnus par le positionnement, comptes hors administration | 40 | 0 | 40 |
| Nouveaux comptes hors administration | 2 | 0 | 2 |

**Dimanche**, une partie de Speed Verb Challenge a produit un score après 1 min 48 s de jeu déclaré. Deux validations de cours portent la trace d’un quiz. Quarante autres cours ont été crédités par le test de niveau. **Lundi**, le seul score enregistré provient de l’administration. Les élèves et visiteurs en invité peuvent jouer toute une partie sur une seule page, sans apparaître dans les scores. Une visite comportant une page de jeu et cinq minutes entre sa première et sa dernière page peut aussi inclure du temps passé sur une autre page ou dans un onglet inactif.

Parmi les visites reconstituées sans passage dans l’administration et comportant une provenance Facebook identifiable, on en relève **80 dimanche et 9 lundi** à heure égale. Respectivement **14 et 3** incluaient une page de jeu, et **9 et 1** s’étendaient sur au moins cinq minutes avec plusieurs pages. Les liens copiés, certains navigateurs d’application et les partages privés peuvent masquer leur provenance. Le groupe d’origine et les parties jouées après son partage restent inconnus.

Une seule empreinte de réseau apparaît dans les deux fenêtres comparables. Le changement de réseau et les réseaux partagés empêchent de convertir ce chiffre en nombre d’élèves revenus le lendemain.

## Comment lire ces chiffres

- **Le journal de production** enregistre les requêtes de page. Le serveur écarte notamment les préchargements reconnus, les robots reconnus, les aperçus, le serveur local et les écrans de classe en direct. La déduplication rapproche une même page et une même empreinte sur 30 secondes. Une vérification technique avec un navigateur ordinaire peut être comptée. [Collecte](../proxy.ts) · [Enregistrement](../app/api/track-visit/route.ts)
- **Une visite reconstituée** regroupe les traces d’une même empreinte réseau et d’un même navigateur déclaré, dans la fenêtre du jour. Après une interruption supérieure à 30 minutes, une nouvelle visite commence. Les lignes de durée excluent toute visite qui a ouvert une page d’administration. Les totaux de pages du haut incluent ces pages. Plusieurs élèves peuvent partager le même réseau et le même type de téléphone. Changer de réseau ou de navigateur peut diviser une visite.
- **La durée observée** va de la première à la dernière requête enregistrée. L’heure de fermeture et la durée d’utilisation effective restent inconnues. Une visite d’une seule page peut être une partie entière. Une visite comptée à cinq minutes figure aussi dans le total à deux minutes.
- **Un score enregistré** atteste qu’un compte a soumis une partie. Pour les cours, la valeur conservée distingue quiz et positionnement. Les codes de progression et les lignes de sessions de jeu peuvent évoluer ou être nettoyés. Une relecture tardive des données existantes peut donner une valeur différente. [Enregistrement des jeux](../lib/games/game-session-server.ts) · [Codage des validations de cours](../lib/courses/mission-telemetry.ts)

## Refaire le calcul

Requête en lecture seule. Pour une prochaine comparaison, changer les trois fenêtres en gardant le même fuseau et la même heure d’arrêt pour les deux jours. Elle renvoie exclusivement des totaux.

```sql
WITH periods(label, debut, fin) AS (
  VALUES
    ('Dimanche à 19 h 07', TIMESTAMPTZ '2026-11-22 00:00 Europe/Paris', TIMESTAMPTZ '2026-11-22 19:07 Europe/Paris'),
    ('Lundi à 19 h 07', TIMESTAMPTZ '2026-11-23 00:00 Europe/Paris', TIMESTAMPTZ '2026-11-23 19:07 Europe/Paris'),
    ('Dimanche entier', TIMESTAMPTZ '2026-11-22 00:00 Europe/Paris', TIMESTAMPTZ '2026-11-23 00:00 Europe/Paris')
), traces AS (
  SELECT p.label, v.id, v.visitor_hash, coalesce(v.user_agent, '') AS navigateur,
         v.visited_at, split_part(v.path, '?', 1) AS page,
         coalesce(v.referrer, '') ~* '^https?://([a-z0-9-]+\.)*(facebook\.com|fb\.com|fb\.me)([:/?#]|$)' AS facebook
  FROM periods p JOIN public.site_visits v ON v.visited_at >= p.debut AND v.visited_at < p.fin
), trafic AS (
  SELECT label, count(*) AS pages, count(DISTINCT visitor_hash) AS reseaux,
         count(*) FILTER (WHERE page ~ '^/play/[^/]+/?$') AS ouvertures_jeu,
         count(DISTINCT visitor_hash) FILTER (WHERE page ~ '^/play/[^/]+/?$') AS reseaux_jeu,
         count(*) FILTER (WHERE page ~ '^/cours/[0-9]+/?$') AS ouvertures_cours,
         count(*) FILTER (WHERE page = '/quest' OR page LIKE '/quest/%') AS ouvertures_aventure,
         count(*) FILTER (WHERE facebook) AS referents_fb
  FROM traces GROUP BY label
), ecarts AS (
  SELECT t.*, lag(visited_at) OVER (PARTITION BY label, visitor_hash, navigateur ORDER BY visited_at, id) AS precedente
  FROM traces t WHERE visitor_hash IS NOT NULL
), decoupage AS (
  SELECT e.*, sum(CASE WHEN precedente IS NULL OR visited_at - precedente > interval '30 minutes' THEN 1 ELSE 0 END)
    OVER (PARTITION BY label, visitor_hash, navigateur ORDER BY visited_at, id ROWS UNBOUNDED PRECEDING) AS numero
  FROM ecarts e
), visites AS (
  SELECT label, visitor_hash, navigateur, numero, max(visited_at) - min(visited_at) AS duree_observee,
         count(DISTINCT page) AS pages_distinctes, bool_or(page ~ '^/play/[^/]+/?$') AS contient_jeu, bool_or(facebook) AS contient_fb
  FROM decoupage GROUP BY label, visitor_hash, navigateur, numero
  HAVING NOT bool_or(page = '/dashboard' OR page LIKE '/dashboard/%')
), lecture AS (
  SELECT label, count(*) AS visites_hors_dashboard,
         count(*) FILTER (WHERE contient_fb) AS visites_fb,
         count(*) FILTER (WHERE contient_fb AND contient_jeu) AS visites_fb_avec_jeu,
         count(*) FILTER (WHERE contient_fb AND pages_distinctes >= 2 AND duree_observee >= interval '5 minutes') AS visites_fb_cinq_minutes,
         count(*) FILTER (WHERE pages_distinctes = 1) AS une_page_distincte,
         count(*) FILTER (WHERE pages_distinctes >= 2 AND duree_observee >= interval '2 minutes') AS deux_minutes,
         count(*) FILTER (WHERE pages_distinctes >= 2 AND duree_observee >= interval '5 minutes') AS cinq_minutes,
         count(*) FILTER (WHERE pages_distinctes >= 2 AND duree_observee >= interval '5 minutes' AND contient_jeu) AS cinq_minutes_avec_jeu
  FROM visites GROUP BY label
), acquis AS (
  SELECT w.label,
         count(c.id) FILTER (WHERE p.role <> 'admin' AND (c.best_score = 8000000 OR c.best_score >= 19000000)) AS acquis_positionnement,
         count(c.id) FILTER (WHERE p.role <> 'admin' AND c.best_score >= 9000000 AND c.best_score < 19000000
           AND ((c.best_score - 9000000) % 1000000) / 1000 > 0) AS acquis_avec_quiz
  FROM periods w LEFT JOIN public.user_course_progress c ON c.status = 'completed'
    AND c.completed_at >= w.debut AND c.completed_at < w.fin
  LEFT JOIN public.profiles p ON p.id = c.user_id GROUP BY w.label
)
SELECT w.label, coalesce(t.pages, 0) AS pages, coalesce(t.reseaux, 0) AS reseaux,
       coalesce(t.ouvertures_jeu, 0) AS ouvertures_jeu, coalesce(t.reseaux_jeu, 0) AS reseaux_jeu,
       coalesce(t.ouvertures_cours, 0) AS ouvertures_cours, coalesce(t.ouvertures_aventure, 0) AS ouvertures_aventure,
       coalesce(t.referents_fb, 0) AS referents_fb, coalesce(l.visites_hors_dashboard, 0) AS visites_hors_dashboard,
       coalesce(l.une_page_distincte, 0) AS une_page_distincte, coalesce(l.deux_minutes, 0) AS deux_minutes,
       coalesce(l.cinq_minutes, 0) AS cinq_minutes, coalesce(l.cinq_minutes_avec_jeu, 0) AS cinq_minutes_avec_jeu,
       coalesce(l.visites_fb, 0) AS visites_fb, coalesce(l.visites_fb_avec_jeu, 0) AS visites_fb_avec_jeu,
       coalesce(l.visites_fb_cinq_minutes, 0) AS visites_fb_cinq_minutes, a.acquis_avec_quiz, a.acquis_positionnement,
       (SELECT count(*) FROM public.game_scores s JOIN public.profiles p ON p.id = s.user_id
        WHERE s.created_at >= w.debut AND s.created_at < w.fin AND p.role <> 'admin') AS scores_hors_admin,
       (SELECT count(*) FROM public.profiles p WHERE p.created_at >= w.debut AND p.created_at < w.fin
        AND p.role <> 'admin') AS inscriptions
FROM periods w LEFT JOIN trafic t USING (label) LEFT JOIN lecture l USING (label) JOIN acquis a USING (label)
ORDER BY w.debut, w.fin;
```

Le recoupement des réseaux utilise les deux jours arrêtés à 19 h 07.

```sql
WITH jours AS (
  SELECT visitor_hash, (visited_at AT TIME ZONE 'Europe/Paris')::date AS jour
  FROM public.site_visits
  WHERE visited_at >= TIMESTAMPTZ '2026-11-22 00:00 Europe/Paris'
    AND visited_at < TIMESTAMPTZ '2026-11-23 19:07 Europe/Paris'
    AND (visited_at AT TIME ZONE 'Europe/Paris')::time < time '19:07'
    AND visitor_hash IS NOT NULL
  GROUP BY visitor_hash, (visited_at AT TIME ZONE 'Europe/Paris')::date
)
SELECT count(*) AS reseaux_presents_les_deux_jours FROM
  (SELECT visitor_hash FROM jours GROUP BY visitor_hash HAVING count(*) = 2) AS communs;
```

## Évolution des mesures le 25 novembre 2026

Ce bilan reste celui des 22 et 23 novembre. À partir du 25, le tableau de bord compte aussi les parties libres lancées et terminées par les invités dans les neuf jeux, par jour de Paris. Il garde les ouvertures par jeu, les pages vues et les réseaux distincts quotidiens après le retrait des traces de plus de dix journées complètes. Les anciens lancements et fins de partie en invité ne peuvent pas être reconstitués. Les requêtes de reconstitution individuelle ci-dessus s’appliquent uniquement aux journées dont les détails existent encore.

[Retour au point de reprise](../REPRISE.md)
