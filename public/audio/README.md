# Les voix de Spell Strike et Echo Signal

Les deux jeux diffusent des MP3 préparés pour English Quest. Le pack américain emploie Heart pour la dictée et répartit les répliques entre Heart et Michael selon le personnage. Les 340 enregistrements représentent environ 7,2 Mo. Le navigateur télécharge les extraits au fil de la partie.

| Contenu | Chemin depuis ce dossier | Nombre |
| --- | --- | ---: |
| Mot isolé | `spell-strike/<id>.mp3` | 150 |
| Même mot dans sa phrase | `spell-strike/<id>-sentence.mp3` | 150 |
| Message ou dialogue complet | `echo-signal/<id>.mp3` | 40 |

`recordings.json` associe chaque message aux instants précis où changent les interlocuteurs. Sa révision identifie les pistes mises en cache. L’empreinte des scripts permet de détecter un changement de texte ou de distribution avant la publication.

Si un enregistrement échoue, le jeu essaie une voix anglaise disponible sur l’appareil. En dernier recours, Spell Strike affiche la phonétique et la phrase à compléter, et Echo Signal ouvre la transcription du message. Dans Echo Signal, seule une lecture achevée consomme une écoute. Une bonne réponse en mode lecture rapporte les points de base ainsi que le bonus de série. Le bonus de première écoute récompense une réponse après une seule écoute complète. Le réglage des effets sonores concerne les bips du jeu.

## Régénérer les enregistrements

La génération s’effectue hors ligne sur la machine de préparation. Il faut Python avec `kokoro-onnx==0.5.0`, ONNX Runtime et NumPy, ainsi que Node.js avec les dépendances du projet et FFmpeg. Placer `kokoro-v1.0.onnx` et `voices-v1.0.bin` dans le même dossier. Le site distribue uniquement les MP3. Le modèle Kokoro-82M v1.0 est publié sous Apache 2.0 et le moteur kokoro-onnx sous MIT. [Modèle et voix](https://huggingface.co/hexgrad/Kokoro-82M) · [Moteur et fichiers ONNX](https://github.com/thewh1teagle/kokoro-onnx/releases/tag/model-files-v1.1)

```sh
python scripts/generate-game-audio.py --model-dir chemin/vers/les-modeles
node scripts/audit-audio-coverage.cjs --check
```

Le générateur reprend les mots, phrases et dialogues des banques du jeu et exporte des MP3 mono de 24 kHz à 64 kbit/s. Pour comparer les accents sur un même extrait avant un changement, lancer la commande ci-dessous.

```sh
python scripts/generate-game-audio.py --model-dir chemin/vers/les-modeles --samples-only --output output/audio-comparaison
```
