#!/usr/bin/env bash
# Génère UNE image avec Codex CLI (outil image intégré) à partir d'un style et d'un brief.
# usage : bash scripts/visuals/gen-image.sh <fichier-style.txt> <brief.txt> <sortie.png>
set -u
style="$1"; brief="$2"; out="$3"
outdir="$(cd "$(dirname "$out")" && pwd)"; name="$(basename "$out")"
prompt="$outdir/.${name%.png}.prompt"
{
  echo "Use your built-in image generation tool to create exactly ONE image from the brief below. Do not ask questions, do not write code to draw it."
  echo "When the image is generated, copy the resulting PNG (stored under ~/.codex/generated_images/) into the current working directory as ${name}, then reply with only the word DONE."
  echo
  cat "$style"
  echo
  echo "IMAGE BRIEF:"
  cat "$brief"
} > "$prompt"
cd "$outdir"
codex exec --skip-git-repo-check -s workspace-write -c model_reasoning_effort='"low"' -C "$(pwd -W 2>/dev/null || pwd)" - < "$prompt" > "$outdir/.${name%.png}.log" 2>&1
if [ -f "$outdir/$name" ]; then echo "OK $out"; else echo "FAILED $out (voir $outdir/.${name%.png}.log)"; fi
