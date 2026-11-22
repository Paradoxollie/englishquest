"use server";

import type { Draft } from "@/lib/adventure/activities";
import { scenes } from "@/lib/adventure/scenes";
import { getServerUser } from "@/lib/supabase/auth-cache";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export async function saveAdventureDraft(id: number, version: number, draft: Draft) {
  const user = await getServerUser();
  if (!user || !Number.isInteger(id) || !scenes[id] || !Number.isSafeInteger(version) || version < 0 || !draft ||
      !Number.isInteger(draft.index) || !scenes[id][draft.index] || draft.replaying || typeof draft.choice !== "string" ||
      draft.choice.length > 250 || !Array.isArray(draft.tiles) || !Array.isArray(draft.gameAnswers) || !Array.isArray(draft.quiz?.answers) ||
      JSON.stringify(draft).length > 3500) return -1;
  const { data, error } = await createSupabaseAdminClient().rpc("save_adventure_draft", {
    p_user: user.id, p_mission: id, p_stage: draft.index, p_version: version,
    p_draft: { index: draft.index, opened: draft.opened, sheet: draft.sheet, choice: draft.choice, tiles: draft.tiles, gameAnswers: draft.gameAnswers,
      quiz: draft.quiz, shuffle: draft.shuffle, replaying: false },
  });
  if (error) throw new Error("Le brouillon reste sur cet appareil.");
  return Number(data);
}
