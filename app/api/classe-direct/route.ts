import { NextResponse } from "next/server";
import { isUuid } from "@/lib/classes/classes";
import { gradeLiveAnswers } from "@/lib/classes/live-grading";
import { validateLiveRounds, type LiveSnapshot } from "@/lib/classes/live-shared";
import { getCourseQuizPool } from "@/lib/courses/exercises-server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { guestCredential } from "@/lib/classes/guests";
import { isSiteOrigin } from "@/lib/navigation/request-origin";

export const dynamic = "force-dynamic";
const headers = { "Cache-Control": "private, no-store, max-age=0", Vary: "Cookie" };
function failure(message: string, status: number) {
  return NextResponse.json({ error: message }, { status, headers });
}
function record(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}
function validCount(value: unknown): value is number {
  return typeof value === "number" && Number.isSafeInteger(value) && value >= 0 && value <= 100_000;
}

async function respond(input: Record<string, unknown>, write: boolean) {
  if (!isUuid(input.classId) || (input.sessionId != null && !isUuid(input.sessionId))) {
    return failure("Cette classe est introuvable.", 404);
  }
  const client = await createSupabaseServerClient();
  const { data, error: authError } = await client.auth.getClaims();
  const userId = authError ? null : data?.claims?.sub;
  const guestHash = userId ? null : await guestCredential();
  if (!userId && !guestHash) return failure("Entre ton code de classe pour participer.", 401);
  const action = write ? input.action : "state";
  if (guestHash && action !== "state" && action !== "pulse") return failure("Cette commande est réservée au professeur.", 403);
  const args: Record<string, unknown> = { p_class: input.classId, p_action: action, p_session: input.sessionId ?? null };
  if (write) {
    if (action === "prepare") {
      const rounds = validateLiveRounds(input.rounds);
      if (!rounds || input.sessionId != null) return failure("Vérifiez les activités et leur durée.", 400);
      args.p_rounds = rounds;
    } else if (!isUuid(input.sessionId) || (action !== "start" && action !== "stop" && action !== "pulse")) {
      return failure("Cette commande de séance est invalide.", 400);
    } else if (action === "pulse" && input.progress !== undefined) {
      const progress = input.progress;
      if (!record(progress) || !validCount(input.roundIndex) || input.roundIndex > 11) return failure("Relevé de manche invalide.", 400);
      args.p_index = input.roundIndex;
      if (progress.answers !== undefined) {
        if (!validCount(progress.courseId) || progress.courseId < 1 || progress.courseId > 50 || !Array.isArray(progress.answers) || progress.answers.length > 40) {
          return failure("Réponses de cours invalides.", 400);
        }
        args.p_progress = { courseId: progress.courseId, marks: gradeLiveAnswers(getCourseQuizPool(progress.courseId), progress.answers) };
      } else {
        if (!validCount(progress.answered) || !validCount(progress.correct) || progress.correct > progress.answered) return failure("Relevé de jeu invalide.", 400);
        args.p_progress = { answered: progress.answered, correct: progress.correct };
      }
    }
  }
  const admin = createSupabaseAdminClient();
  const result = guestHash
    ? await admin.rpc("class_participant_request", { ...args, p_user: null, p_guest_hash: guestHash })
    : await admin.rpc("class_live_request", { ...args, p_user: userId });
  if (result.error) {
    switch (result.error.message) {
      case "live_unavailable": return failure("Cette classe est introuvable pour ce compte.", 404);
      case "live_archived": return failure("Cette classe est archivée.", 409);
      case "live_in_progress": return failure("Une séance est déjà ouverte dans cette classe.", 409);
      case "live_closed": return failure("Cette séance est terminée.", 409);
      case "live_invalid": return failure("Vérifiez les paramètres de la séance.", 400);
      default:
        console.error("class_live_request", result.error.code);
        return failure("La séance est momentanément indisponible.", 503);
    }
  }
  const snapshot = result.data as LiveSnapshot;
  if (snapshot.teacher) return NextResponse.json(snapshot, { headers });
  const podium = snapshot.people.map(({ name, rank, points }) => ({ name, rank, points }));
  return NextResponse.json({ ...snapshot, people: podium }, { headers });
}

export async function GET(request: Request) {
  const params = new URL(request.url).searchParams;
  return respond({ classId: params.get("classId"), sessionId: params.get("sessionId") }, false);
}
export async function POST(request: Request) {
  const origin = request.headers.get("origin");
  if (origin && !isSiteOrigin(request, origin)) return failure("Origine de la demande invalide.", 403);
  if (!request.headers.get("content-type")?.toLowerCase().startsWith("application/json")) return failure("Format invalide.", 415);
  if (Number(request.headers.get("content-length")) > 24_576) return failure("Relevé trop volumineux.", 413);
  const body = await request.text();
  if (body.length > 24_576) return failure("Relevé trop volumineux.", 413);
  let input: unknown;
  try { input = JSON.parse(body); } catch { return failure("Format invalide.", 400); }
  if (!record(input)) return failure("Format invalide.", 400);
  return respond(input, true);
}
