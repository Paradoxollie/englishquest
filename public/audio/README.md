# Audio Statique English Quest (Optionnel)

Le site détecte automatiquement au chargement côté serveur (`lib/games/audio-manifest-server.ts`) les fichiers `.mp3` présents dans ces dossiers. Tant qu'un fichier est absent, le navigateur bascule sans erreur réseau sur la synthèse vocale anglaise intégrée (`Web Speech API`).

## Arborescence attendue

- `public/audio/spell-strike/<id>.mp3` : prononciation du mot (et éventuellement de sa phrase d'exemple) pour **Spell Strike**.
- `public/audio/echo-signal/<id>.mp3` : enregistrement complet de la transmission radio ou du dialogue pour **Echo Signal**.

Lancez `node scripts/audit-audio-coverage.cjs` pour afficher la liste complète des identifiants et des scripts exacts à enregistrer ou générer.
