"use server";

import { getAdventureProgress, keepCheckpoint } from "@/lib/adventure/progress";
import { gradeActivity } from "@/lib/adventure/grading";
import { scenes } from "@/lib/adventure/scenes";
import { quizForm, quizRetryIds } from "@/lib/adventure/quiz";
import { cookies } from "next/headers";
import { receiptName } from "@/lib/adventure/receipts";

export async function importGuestAtlas() {
  const { stages, guestStages, userId, synced } = await getAdventureProgress();
  if (!userId || !synced) return false;
  const jar = await cookies();
  for (let id = 1; id <= guestStages.length; id++) {
    const stage = guestStages[id - 1];
    if (!stage) continue;
    if (stage > stages[id - 1] && !await keepCheckpoint(id, stage, userId)) return false;
    for (let n = 1; n <= stage; n++) {
      const key = receiptName(id, n, false);
      if (jar.has(key)) jar.set(key, "", { path: "/quest", maxAge: 0 });
    }
  }
  return true;
}

export async function openAtlasQuiz(id: number, ticket?: string) {
  if (!Number.isInteger(id) || !scenes[id]) throw new Error("Escale inconnue.");
  const { stages, userId } = await getAdventureProgress();
  if (stages[id - 1] < scenes[id].length - 1) throw new Error("Termine les scènes avant d’ouvrir le carnet.");
  return quizForm(id, userId ?? "guest", ticket);
}

export async function checkPassage(id: number, index: number, answer: unknown) {
  const rows = Number.isInteger(id) && id >= 1 && id <= 5 ? scenes[id] : null;
  if (!rows || !Number.isInteger(index) || index < 0 || index >= rows.length) throw new Error("Étape inconnue.");
  const progress = await getAdventureProgress();
  if ((id > 1 && progress.stages[id - 2] < scenes[id - 1].length) || index > progress.stages[id - 1]) {
    return { ok: false, message: "Termine d’abord l’étape précédente.", synced: progress.synced };
  }
  const step = rows[index];
  const retryIds = step.mode === "quiz" ? quizRetryIds(id, progress.userId ?? "guest", answer) : null;
  const correct = step.mode === "quiz" ? retryIds?.length === 0 : gradeActivity(step, answer);
  if (!correct) return { ok: false, message: step.hint, synced: progress.synced, retryIds: retryIds ?? undefined };
  const synced = progress.stages[id - 1] > index ? progress.synced : await keepCheckpoint(id, index + 1, progress.userId);
  return { ok: true, message: step.explain, synced };
}
