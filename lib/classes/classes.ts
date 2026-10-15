/**
 * Espace classe : règles pures (sans base, sans réseau), partagées par les
 * actions serveur, les pages et les tests (scripts/tests/classes-regression.cjs).
 */

/** Sans O/0, I/1 ni L : rien qui se confonde au tableau ou au clavier. */
export const CLASS_CODE_ALPHABET = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";
export const CLASS_CODE_LENGTH = 6;
export const CLASS_CODE_PATTERN = new RegExp(`^[${CLASS_CODE_ALPHABET}]{${CLASS_CODE_LENGTH}}$`);

export const CLASS_NAME_MAX = 60;
export const ASSIGNMENT_NOTE_MAX = 200;
export const COURSE_ID_MIN = 1;
export const COURSE_ID_MAX = 50;

/** Un élève peut suivre plusieurs classes (anglais + AMC, par exemple), pas davantage. */
export const MAX_CLASSES_PER_PUPIL = 5;
export const MAX_ACTIVE_CLASSES_PER_TEACHER = 40;
export const MAX_PUPILS_PER_CLASS = 100;
export const MAX_ASSIGNMENTS_PER_CLASS = 100;

/** Codes erronés tolérés par heure et par compte avant blocage (anti-devinette). */
export const MAX_WRONG_JOIN_CODES_PER_HOUR = 10;
export const JOIN_ATTEMPT_WINDOW_MS = 60 * 60 * 1000;

/** Une date limite se pose au plus un an à l'avance. */
export const MAX_DUE_DATE_DAYS_AHEAD = 366;

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const ISO_DATE_PATTERN = /^(\d{4})-(\d{2})-(\d{2})$/;

function unicodeRange(from: number, to: number) {
  const hex = (value: number) => value.toString(16).padStart(4, "0");
  return `\\u${hex(from)}-\\u${hex(to)}`;
}
// Caractères de contrôle (retours à la ligne compris), espaces invisibles et
// séparateurs de ligne : jamais utiles dans un nom de classe ou une consigne courte.
const CONTROL_CHARACTERS = new RegExp(
  `[${[
    unicodeRange(0x00, 0x1f),
    unicodeRange(0x7f, 0x9f),
    unicodeRange(0x200b, 0x200f),
    unicodeRange(0x2028, 0x2029),
    unicodeRange(0xfeff, 0xfeff),
  ].join("")}]`,
  "g"
);

/** Réponse des actions de l'espace classe, affichable telle quelle. */
export type ClassActionResult<T = undefined> =
  | { ok: true; message: string; data?: T }
  | { ok: false; error: string };

/** Les comptes professeur et administrateur gèrent des classes. */
export function isTeacherRole(role: unknown): boolean {
  return role === "teacher" || role === "admin";
}

export type RandomBytes = (length: number) => Uint8Array;

function defaultRandomBytes(length: number) {
  const bytes = new Uint8Array(length);
  globalThis.crypto.getRandomValues(bytes);
  return bytes;
}

/**
 * Tire un code de six caractères dans l'alphabet sans ambiguïté.
 * Tirage par rejet : chaque caractère a exactement la même probabilité.
 */
export function generateClassCode(randomBytes: RandomBytes = defaultRandomBytes): string {
  const alphabetSize = CLASS_CODE_ALPHABET.length;
  const limit = 256 - (256 % alphabetSize);
  let code = "";
  let guard = 0;

  while (code.length < CLASS_CODE_LENGTH) {
    const bytes = randomBytes(CLASS_CODE_LENGTH * 2);
    for (const byte of bytes) {
      if (byte >= limit) continue;
      code += CLASS_CODE_ALPHABET[byte % alphabetSize];
      if (code.length === CLASS_CODE_LENGTH) break;
    }
    guard += 1;
    if (guard > 64) {
      throw new Error("Random source never produced usable bytes");
    }
  }

  return code;
}

/**
 * Ce que l'élève a tapé, ramené à la forme stockée : majuscules, sans espaces
 * ni tirets ni points (« abc 23x », « ABC-23X » donnent « ABC23X »).
 */
export function normalizeClassCode(input: unknown): string {
  if (typeof input !== "string") return "";
  return input
    .normalize("NFKC")
    .toUpperCase()
    .replace(/[\s\-_.·]+/g, "")
    .slice(0, 32);
}

export function isValidClassCode(code: string): boolean {
  return CLASS_CODE_PATTERN.test(code);
}

/** Affichage au tableau : « ABC 23X », plus facile à recopier. */
export function formatClassCode(code: string): string {
  return code.length === CLASS_CODE_LENGTH ? `${code.slice(0, 3)} ${code.slice(3)}` : code;
}

export function isUuid(value: unknown): value is string {
  return typeof value === "string" && UUID_PATTERN.test(value);
}

function cleanLine(value: unknown): string {
  if (typeof value !== "string") return "";
  return value.normalize("NFC").replace(CONTROL_CHARACTERS, " ").replace(/\s+/g, " ").trim();
}

export type Validation<T> = { ok: true; value: T } | { ok: false; error: string };

export function validateClassName(input: unknown): Validation<string> {
  const name = cleanLine(input);
  if (name.length === 0) {
    return { ok: false, error: "Donnez un nom à la classe." };
  }
  if (Array.from(name).length > CLASS_NAME_MAX) {
    return { ok: false, error: `Le nom de la classe fait ${CLASS_NAME_MAX} caractères au plus.` };
  }
  return { ok: true, value: name };
}

export function validateAssignmentNote(input: unknown): Validation<string | null> {
  const note = cleanLine(input);
  if (note.length === 0) return { ok: true, value: null };
  if (Array.from(note).length > ASSIGNMENT_NOTE_MAX) {
    return { ok: false, error: `La consigne fait ${ASSIGNMENT_NOTE_MAX} caractères au plus.` };
  }
  return { ok: true, value: note };
}

export function validateCourseId(input: unknown): Validation<number> {
  const value = typeof input === "string" ? Number(input.trim()) : input;
  if (typeof value !== "number" || !Number.isInteger(value) || value < COURSE_ID_MIN || value > COURSE_ID_MAX) {
    return { ok: false, error: "Choisissez une mission dans la liste." };
  }
  return { ok: true, value };
}

/** Date du jour à Paris, au format AAAA-MM-JJ (celui des champs date et de Postgres). */
export function parisDateString(date: Date = new Date()): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Europe/Paris",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}

function isRealCalendarDate(value: string) {
  const match = ISO_DATE_PATTERN.exec(value);
  if (!match) return false;
  const [, year, month, day] = match.map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  return date.getUTCFullYear() === year && date.getUTCMonth() === month - 1 && date.getUTCDate() === day;
}

/** Ajoute des jours à une date AAAA-MM-JJ, sans fuseau horaire. */
export function addDaysToDateString(value: string, days: number): string {
  const [year, month, day] = value.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day + days));
  return date.toISOString().slice(0, 10);
}

/** Nombre de jours entre deux dates AAAA-MM-JJ (positif si `to` est après `from`). */
export function daysBetween(from: string, to: string): number {
  const [fy, fm, fd] = from.split("-").map(Number);
  const [ty, tm, td] = to.split("-").map(Number);
  return Math.round((Date.UTC(ty, tm - 1, td) - Date.UTC(fy, fm - 1, fd)) / 86_400_000);
}

/**
 * Date limite d'un devoir : facultative ; sinon une vraie date, pas dans le
 * passé (heure de Paris), au plus un an à l'avance.
 */
export function validateDueDate(input: unknown, today: string = parisDateString()): Validation<string | null> {
  const value = typeof input === "string" ? input.trim() : "";
  if (value.length === 0) return { ok: true, value: null };
  if (!isRealCalendarDate(value)) {
    return { ok: false, error: "La date limite n'est pas valide." };
  }
  if (value < today) {
    return { ok: false, error: "La date limite est déjà passée." };
  }
  if (daysBetween(today, value) > MAX_DUE_DATE_DAYS_AHEAD) {
    return { ok: false, error: "La date limite est à plus d'un an." };
  }
  return { ok: true, value };
}

export type AssignmentStatus = "fait" | "en_retard" | "a_faire";

export const ASSIGNMENT_STATUS_LABELS: Record<AssignmentStatus, string> = {
  fait: "Fait",
  en_retard: "En retard",
  a_faire: "À faire",
};

/**
 * Statut d'un devoir pour un élève. La mission validée compte comme faite,
 * même après la date. La date limite est incluse : le devoir n'est en retard
 * que le lendemain.
 */
export function getAssignmentStatus(params: {
  completed: boolean;
  dueDate: string | null;
  today?: string;
}): AssignmentStatus {
  if (params.completed) return "fait";
  const today = params.today ?? parisDateString();
  if (params.dueDate && params.dueDate < today) return "en_retard";
  return "a_faire";
}

/** Retards d'abord, puis la date la plus proche ; sans date limite en dernier. */
export function compareHomework(
  left: { status: AssignmentStatus; dueDate: string | null; courseId: number },
  right: { status: AssignmentStatus; dueDate: string | null; courseId: number }
): number {
  const rank = (status: AssignmentStatus) => (status === "en_retard" ? 0 : status === "a_faire" ? 1 : 2);
  const byStatus = rank(left.status) - rank(right.status);
  if (byStatus !== 0) return byStatus;
  if (left.dueDate !== right.dueDate) {
    if (!left.dueDate) return 1;
    if (!right.dueDate) return -1;
    return left.dueDate < right.dueDate ? -1 : 1;
  }
  return left.courseId - right.courseId;
}

export type JoinAttemptVerdict = { blocked: false; remaining: number } | { blocked: true; retryInMinutes: number };

/**
 * Limite des codes erronés : au plus dix par heure glissante. Les échecs plus
 * anciens qu'une heure ne comptent plus ; le blocage se lève quand le plus
 * ancien échec de la fenêtre sort de l'heure.
 */
export function evaluateJoinAttempts(failedAt: Array<string | Date>, now: Date = new Date()): JoinAttemptVerdict {
  const windowStart = now.getTime() - JOIN_ATTEMPT_WINDOW_MS;
  const recent = failedAt
    .map((value) => (value instanceof Date ? value.getTime() : Date.parse(value)))
    .filter((time) => Number.isFinite(time) && time > windowStart && time <= now.getTime())
    .sort((a, b) => a - b);

  if (recent.length < MAX_WRONG_JOIN_CODES_PER_HOUR) {
    return { blocked: false, remaining: MAX_WRONG_JOIN_CODES_PER_HOUR - recent.length };
  }

  // Il faut que suffisamment d'échecs sortent de la fenêtre pour repasser sous la limite.
  const unlockingFailure = recent[recent.length - MAX_WRONG_JOIN_CODES_PER_HOUR];
  const waitMs = unlockingFailure + JOIN_ATTEMPT_WINDOW_MS - now.getTime();
  return { blocked: true, retryInMinutes: Math.max(1, Math.ceil(waitMs / 60_000)) };
}

export type QuizAttempt = { courseId: number; accuracy: number };

export type StrugglingCourse = {
  courseId: number;
  /** Moyenne des meilleurs scores au quiz, en pourcentage arrondi. */
  average: number;
  /** Nombre d'élèves qui ont fait le quiz au moins une fois. */
  attempts: number;
};

/**
 * Les notions qui coincent : les cours déjà tentés, classés par moyenne de
 * meilleur score croissante. À moyenne égale, le cours tenté par le plus
 * d'élèves passe devant (le signal est plus solide).
 */
export function rankStrugglingCourses(attempts: QuizAttempt[], limit = 5): StrugglingCourse[] {
  const byCourse = new Map<number, { sum: number; count: number }>();
  for (const attempt of attempts) {
    if (!Number.isFinite(attempt.accuracy)) continue;
    const entry = byCourse.get(attempt.courseId) ?? { sum: 0, count: 0 };
    entry.sum += Math.max(0, Math.min(100, attempt.accuracy));
    entry.count += 1;
    byCourse.set(attempt.courseId, entry);
  }

  return Array.from(byCourse.entries())
    .map(([courseId, { sum, count }]) => ({ courseId, average: Math.round(sum / count), attempts: count, exact: sum / count }))
    .sort((left, right) => left.exact - right.exact || right.attempts - left.attempts || left.courseId - right.courseId)
    .slice(0, Math.max(0, limit))
    .map(({ courseId, average, attempts: count }) => ({ courseId, average, attempts: count }));
}

export function averageOf(values: number[]): number | null {
  const usable = values.filter((value) => Number.isFinite(value));
  if (usable.length === 0) return null;
  return Math.round(usable.reduce((sum, value) => sum + value, 0) / usable.length);
}

export type PupilRow = {
  userId: string;
  username: string;
  completedCount: number;
  currentCourseId: number | null;
  currentCourseLabel: string | null;
  /** Dernier jour d'activité connu, AAAA-MM-JJ (heure de Paris). */
  lastActivity: string | null;
  xp: number;
  quizAverage: number | null;
  quizCount: number;
};

export type PupilSortKey = "username" | "completedCount" | "currentCourseId" | "lastActivity" | "xp" | "quizAverage";
export type SortDirection = "asc" | "desc";

export const PUPIL_SORT_KEYS: PupilSortKey[] = [
  "username",
  "completedCount",
  "currentCourseId",
  "lastActivity",
  "xp",
  "quizAverage",
];

/**
 * Tri du tableau des élèves. Les valeurs absentes (pas de quiz, aucune
 * activité) restent en bas, quel que soit le sens du tri. À égalité, ordre
 * alphabétique des pseudos.
 */
export function sortPupilRows(rows: PupilRow[], key: PupilSortKey, direction: SortDirection): PupilRow[] {
  const factor = direction === "asc" ? 1 : -1;
  const byName = (left: PupilRow, right: PupilRow) =>
    left.username.localeCompare(right.username, "fr", { sensitivity: "base", numeric: true });

  return [...rows].sort((left, right) => {
    if (key === "username") {
      return factor * byName(left, right);
    }
    const a = left[key];
    const b = right[key];
    const aMissing = a === null || a === undefined;
    const bMissing = b === null || b === undefined;
    if (aMissing || bMissing) {
      if (aMissing && bMissing) return byName(left, right);
      return aMissing ? 1 : -1;
    }
    if (a === b) return byName(left, right);
    return (a < b ? -1 : 1) * factor;
  });
}

/** Sens par défaut quand on clique sur une colonne : alphabétique pour le pseudo, les plus forts d'abord sinon. */
export function defaultSortDirection(key: PupilSortKey): SortDirection {
  return key === "username" ? "asc" : "desc";
}

/** « aujourd'hui », « hier », « il y a 3 jours », puis la date courte. */
export function formatLastActivity(day: string | null, today: string = parisDateString()): string {
  if (!day) return "Jamais";
  const diff = daysBetween(day, today);
  if (diff <= 0) return "Aujourd'hui";
  if (diff === 1) return "Hier";
  if (diff < 7) return `Il y a ${diff} jours`;
  return formatShortDate(day);
}

const MONTHS = ["janv.", "févr.", "mars", "avr.", "mai", "juin", "juil.", "août", "sept.", "oct.", "nov.", "déc."];

/** « 3 oct. », sans dépendre de la locale du serveur. */
export function formatShortDate(day: string, withYear = false): string {
  const match = ISO_DATE_PATTERN.exec(day);
  if (!match) return day;
  const [, year, month, date] = match;
  const label = `${Number(date)} ${MONTHS[Number(month) - 1]}`;
  return withYear ? `${label} ${year}` : label;
}

/** Libellé d'une date limite vue par l'élève. */
export function formatDueDate(dueDate: string | null, today: string = parisDateString()): string {
  if (!dueDate) return "Sans date limite";
  const diff = daysBetween(today, dueDate);
  if (diff === 0) return "Pour aujourd'hui";
  if (diff === 1) return "Pour demain";
  if (diff < 0) return `Prévu pour le ${formatShortDate(dueDate)}`;
  return `Pour le ${formatShortDate(dueDate)}`;
}
