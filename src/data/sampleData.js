export function createSampleRecords() {
  // Anchor past days to local midnight so every session lands on a FIXED, natural
  // clock time (e.g. 13:00) no matter when the demo is opened — not the old bug of
  // adding an offset onto Date.now() (which already carries the current time of day).
  // Today's few sessions are relative to "now" so they always stay in the past.
  const midnight = new Date(); midnight.setHours(0, 0, 0, 0);
  const DAY = 86400000;
  let id = 0;
  // a fixed-clock session on a past day: (daysAgo, hour, minute, ...)
  const at = (daysAgo, hour, minute, tag, tree, duration) => ({
    id: ++id, tag, tree, duration, completed: true,
    date: new Date(midnight.getTime() - daysAgo * DAY + (hour * 60 + minute) * 60000),
  });
  // a session earlier today, `hoursAgo` before now (kept in the past)
  const ago = (hoursAgo, tag, tree, duration) => ({
    id: ++id, tag, tree, duration, completed: true,
    date: new Date(Date.now() - hoursAgo * 3600000),
  });

  return [
    // ── 6 days ago ──
    at(6,  9, 30, "study",  "pine",       25),
    at(6, 13,  0, "code",   "christmas",  60),
    at(6, 15, 30, "read",   "cactus",     30),
    // ── 5 days ago ──
    at(5, 10,  0, "class",  "sakura",     50),
    at(5, 13, 30, "work",   "maple",      45),
    at(5, 16,  0, "create", "sunflower",  30),
    at(5, 20,  0, "read",   "bamboo",     25),
    // ── 4 days ago ──
    at(4,  9,  0, "study",  "plum",       30),
    at(4, 13,  0, "code",   "christmas",  60),
    at(4, 14, 30, "study",  "pine",       25),
    at(4, 16, 30, "read",   "fumeshroom", 25),
    // ── 3 days ago ──
    at(3, 10, 30, "work",   "palm",       45),
    at(3, 13,  0, "study",  "bamboo",     50),
    at(3, 15,  0, "create", "cactus",     30),
    // ── 2 days ago ──
    at(2,  9, 30, "study",  "pine",       25),
    at(2, 13,  0, "code",   "maple",      60),
    at(2, 15, 30, "class",  "sakura",     50),
    at(2, 20,  0, "read",   "sunflower",  25),
    // ── yesterday ──
    at(1, 10,  0, "study",  "plum",       30),
    at(1, 13,  0, "work",   "bamboo",     45),
    at(1, 14, 30, "code",   "christmas",  60),
    at(1, 16, 30, "create", "fumeshroom", 25),
    // ── today (relative to now, always in the past) ──
    ago(5,   "study", "sakura", 25),
    ago(3.5, "code",  "maple",  45),
    ago(2,   "class", "pine",   50),
    ago(1,   "work",  "palm",   30),
  ];
}
