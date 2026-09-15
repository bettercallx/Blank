// ---- localStorage schema migrations ----
// Runs once at startup (before React renders) and upgrades any stored data to the
// current schema version. When you make a BREAKING change to stored data (rename a
// field, change its meaning, move data between keys), bump CURRENT_VERSION and add a
// matching migrations[n] step that transforms localStorage from version n-1 → n.
//
// Keys currently in use: blank_records, blank_tags, blank_userName, blank_userAvatar

const VERSION_KEY = "blank_version";
const CURRENT_VERSION = 1;

const migrations = {
  // Baseline. Existing data is already this shape, so nothing to transform —
  // this step just stamps unversioned data as v1.
  1: () => {},

  // ---- Add future migrations below. Example (rename records' `duration` → `minutes`):
  // 2: () => {
  //   const recs = JSON.parse(localStorage.getItem("blank_records") || "[]");
  //   const migrated = recs.map(({ duration, ...r }) => ({ ...r, minutes: duration }));
  //   localStorage.setItem("blank_records", JSON.stringify(migrated));
  // },
};

export function runMigrations() {
  let v = Number(localStorage.getItem(VERSION_KEY) || 0);
  while (v < CURRENT_VERSION) {
    v += 1;
    try {
      migrations[v]?.();
    } catch (e) {
      // A failed migration shouldn't white-screen the app; log and keep going.
      console.error(`Migration to v${v} failed:`, e);
    }
    localStorage.setItem(VERSION_KEY, String(v));
  }
}
