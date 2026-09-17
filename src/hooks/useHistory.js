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

export function useHistory() {
  // Demo mode: temporarily show curated sample data so new users can preview a
  // populated dashboard (also handy for screenshots). It's regenerated fresh on load,
  // never persisted, and never touches real data — flipping `demo` only swaps the view.
  const [demo, setDemo] = useState(false);
  const [sampleRecords] = useState(() => createSampleRecords());
  const [userRecords, setUserRecords] = useState(loadUserRecords);

  const addRecord = useCallback((r) => {
    setUserRecords(prev => {
      const next = [...prev, { ...r, id: Date.now(), date: new Date() }];
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
