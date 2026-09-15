// Persists the *running* focus session so it survives a full page kill (e.g. iOS
// Safari discarding a backgrounded tab). Only the session "recipe" is stored — the
// elapsed time is always recomputed from `startTime`, never counted.

const KEY = "blank_active";
const MAX_AGE_MS = 24 * 60 * 60 * 1000; // ignore anything older than 24h (stale/abandoned)

// session = { startTime, duration, tag, tree }  (duration in minutes; 0 = stopwatch)
export function saveActiveSession(session) {
  try { localStorage.setItem(KEY, JSON.stringify(session)); } catch {}
}

export function clearActiveSession() {
  try { localStorage.removeItem(KEY); } catch {}
}

export function loadActiveSession() {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return null;
    const s = JSON.parse(raw);
    if (!s || typeof s.startTime !== "number") return null;
    if (Date.now() - s.startTime > MAX_AGE_MS) { clearActiveSession(); return null; }
    return s;
  } catch {
    return null;
  }
}
