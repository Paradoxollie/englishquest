import "server-only";
import { createHash, createHmac, randomBytes, timingSafeEqual } from "node:crypto";
import { quizBank } from "./quiz-bank";
import type { QuizForm } from "./activities";

function seal(id: number, owner: string, nonce: string) {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!key) throw new Error("Adventure signing key unavailable");
  return createHmac("sha256", key).update(`atlas-quiz-v1|${id}|${owner}|${nonce}`).digest("hex");
}

function valid(id: number, owner: string, token: unknown): token is string {
  if (typeof token !== "string" || !/^[0-9a-f]{32}\.[0-9a-f]{64}$/.test(token)) return false;
  const [nonce, mac] = token.split(".");
  return timingSafeEqual(Buffer.from(mac), Buffer.from(seal(id, owner, nonce)));
}

export function quizForm(id: number, owner: string, previous?: string): QuizForm {
  const nonce = valid(id, owner, previous) ? previous.split(".")[0] : randomBytes(16).toString("hex");
  const entropy = createHash("sha256").update(nonce).digest();
  let offset = 0;
  function shuffle<T>(input: T[]) {
    const items = [...input];
    for (let n = items.length - 1; n > 0; n--) {
      const j = entropy[offset++] % (n + 1);
      [items[n], items[j]] = [items[j], items[n]];
    }
    return items;
  }
  const selection = [0, 2, 4].map(start => start + entropy[offset++] % 2);
  const questions = shuffle(selection).map(index => {
    const [prompt, ...options] = quizBank[id][index];
    return { id: String(index), prompt, options: shuffle(options) };
  });
  return { ticket: `${nonce}.${seal(id, owner, nonce)}`, questions };
}

export function gradeQuiz(id: number, owner: string, raw: unknown) {
  return quizRetryIds(id, owner, raw)?.length === 0;
}

export function quizRetryIds(id: number, owner: string, raw: unknown): string[] | null {
  if (!raw || typeof raw !== "object" || !("ticket" in raw) || !valid(id, owner, raw.ticket) || !("answers" in raw) || !Array.isArray(raw.answers)) return null;
  const form = quizForm(id, owner, raw.ticket);
  const submitted = raw.answers;
  if (submitted.length !== form.questions.length) return null;
  return form.questions.filter(q => !submitted.some(a => a && a.id === q.id && a.value === quizBank[id][Number(q.id)][1])).map(q => q.id);
}
