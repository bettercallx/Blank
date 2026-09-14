import { useState, useCallback } from "react";
import { createSampleRecords } from "../data/sampleData";

export function useHistory() {
  const [records, setRecords] = useState(createSampleRecords);
  const addRecord = useCallback((r) => setRecords(p => [...p, { ...r, id: Date.now(), date: new Date() }]), []);
  const importRecords = useCallback((recs) => setRecords(p => [...p, ...recs]), []);
  return { records, addRecord, importRecords };
}
