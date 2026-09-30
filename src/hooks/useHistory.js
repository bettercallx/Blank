import { useState, useCallback, useMemo } from "react";
import { createSampleRecords } from "../data/sampleData";

const STORAGE_KEY = "blank_records";

function loadUserRecords() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    // dates are stored as ISO strings in JSON; revive them back into Date objects
    return JSON.parse(raw).map(r => ({ ...r, date: new Date(r.date) }));
  } catch {
    return [];
  }
}

function persist(records) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
  } catch {}
}

// Split a session into one record per calendar day it spans, so a session that runs
// across midnight (e.g. 23:00 → 00:30) is attributed to the natural days it actually
// occupied instead of landing entirely on the completion day. Each segment keeps its
// own minutes and its own tree; the minutes always sum back to the original duration.
// `startMs` is the wall-clock start; segments carry a date within their own day.
export function splitByDay(startMs, durationMin) {
  const segments = [];
  let segStart = startMs;
  let remaining = durationMin;
  while (remaining > 0) {
    const nextMidnight = new Date(segStart);
    nextMidnight.setHours(24, 0, 0, 0); // 00:00 of the following day
    // whole minutes from this segment's start until midnight (rounded to nearest)
    const minsToMidnight = Math.round((nextMidnight.getTime() - segStart) / 60000);
    const take = Math.min(remaining, minsToMidnight);
    if (take > 0) {
      segments.push({ date: new Date(segStart), duration: take });
      remaining -= take;
    }
    // a sub-minute sliver before midnight rounds to 0 → skip it, roll into the next day
    segStart = nextMidnight.getTime();
  }
  return segments;
}

export function useHistory() {
  // Demo mode: temporarily show curated sample data so new users can preview a
  // populated dashboard (also handy for screenshots). It's regenerated fresh on load,
  // never persisted, and never touches real data — flipping `demo` only swaps the view.
  const [demo, setDemo] = useState(false);
  const [sampleRecords] = useState(() => createSampleRecords());
  const [userRecords, setUserRecords] = useState(loadUserRecords);

  // `r` carries { tag, tree, duration, completed, startTime }. Completed sessions are
  // attributed to the day(s) they ran on (split at midnight); incomplete/abandoned ones
  // stay a single record on their start day (they're excluded from totals anyway).
  const addRecord = useCallback(({ startTime, ...r }) => {
    setUserRecords(prev => {
      const startMs = typeof startTime === "number" ? startTime : Date.now();
      const segments = r.completed
        ? splitByDay(startMs, r.duration)
        : [{ date: new Date(startMs), duration: r.duration }];
      const idBase = Date.now(); // +i so multi-day segments get distinct ids
      const newRecs = segments.map((s, i) => ({ ...r, duration: s.duration, date: s.date, id: idBase + i }));
      const next = [...prev, ...newRecs];
      persist(next); // real sessions always save, regardless of demo view
      return next;
    });
  }, []);

  const importRecords = useCallback((recs) => {
    setUserRecords(prev => {
      const next = [...prev, ...recs];
      persist(next);
      return next;
    });
  }, []);

  // Demo shows sample data only; otherwise real (saved) data only.
  const records = useMemo(
    () => demo ? sampleRecords : userRecords,
    [demo, sampleRecords, userRecords]
  );

  return { records, addRecord, importRecords, demo, setDemo };
}
