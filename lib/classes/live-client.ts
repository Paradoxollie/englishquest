import type { LiveCommand, LiveSnapshot } from "./live-shared";

async function request(url: string, options: RequestInit): Promise<LiveSnapshot> {
  const response = await fetch(url, { ...options, credentials: "same-origin", cache: "no-store" });
  const data = await response.json().catch(() => null);
  if (!response.ok || !data || typeof data.serverNow !== "number") {
    throw Object.assign(new Error(data?.error ?? "Impossible de joindre la séance. Réessaie dans un instant."), { status: response.status });
  }
  return data as LiveSnapshot;
}

export function readLive(classId: string, sessionId?: string | null, signal?: AbortSignal) {
  const params = new URLSearchParams({ classId });
  if (sessionId) params.set("sessionId", sessionId);
  return request(`/api/classe-direct?${params}`, { method: "GET", signal });
}

export function sendLive(classId: string, command: LiveCommand, options: { keepalive?: boolean; signal?: AbortSignal } = {}) {
  return request("/api/classe-direct", {
    method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ classId, ...command }),
    keepalive: options.keepalive, signal: options.signal,
  });
}
