export function fmt(s) {
  return `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;
}

export function fmtDuration(m) {
  if (m >= 60) {
    const h = Math.floor(m / 60);
    const r = m % 60;
    return r > 0 ? `${h}小时${r}分钟` : `${h}小时`;
  }
  return `${m}分钟`;
}

export function fmtDurationShort(m) {
  if (m >= 60) {
    const h = Math.floor(m / 60);
    const r = m % 60;
    return r > 0 ? `${h}时${r}分` : `${h}时`;
  }
  return `${m}分`;
}
