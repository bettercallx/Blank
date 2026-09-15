import { useState, useCallback, useMemo } from "react";
import { createSampleRecords } from "../data/sampleData";

// Demo mode: `true` shows the sample data only (for screenshots) and does NOT touch
// your saved data; `false` = your real data only. Flip back to `false` when done.
const USE_SAMPLE_DATA = false;

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

export function useHistory() {
  // Demo/sample data is regenerated fresh on each load and never persisted,
  // so screenshots stay "today-relative". Only real sessions are saved.
  const [sampleRecords] = useState(() => USE_SAMPLE_DATA ? createSampleRecords() : []);
  const [userRecords, setUserRecords] = useState(loadUserRecords);

  const addRecord = useCallback((r) => {
    setUserRecords(prev => {
      const next = [...prev, { ...r, id: Date.now(), date: new Date() }];
      if(!USE_SAMPLE_DATA) persist(next); // don't write real storage while demoing
      return next;
    });
  }, []);

  const importRecords = useCallback((recs) => {
    setUserRecords(prev => {
      const next = [...prev, ...recs];
      if(!USE_SAMPLE_DATA) persist(next);
      return next;
    });
  }, []);

  // Demo mode shows sample data only; otherwise real (saved) data only.
  const records = useMemo(
    () => USE_SAMPLE_DATA ? sampleRecords : userRecords,
    [sampleRecords, userRecords]
  );

  return { records, addRecord, importRecords };
}
