# Blank

a focus app in cute pixel art

React + Vite + SVG pixel art

## Contribution

欢迎提 Issue 和 PR！

- Bug 反馈 → 开 Issue
- 想要新树种 → 开 Issue 附参考图/提 PR
- 代码贡献 → Fork → 提 PR

## local and github pages

```bash
npm install
npm run dev
```

## iPhone 使用

Safari 打开链接 `https://bettercallx.github.io/Blank/` → 分享 → 添加到主屏幕

Safari open link `https://bettercallx.github.io/Blank/` → share → Add to Home Screen

## Timer & session recovery

The timer is timestamp-based, so it stays accurate when the phone locks or the app is
backgrounded. If the app is fully closed mid-session, on reopen:

- Countdown still running → resumes with the correct time left
- Countdown that finished while away → plants the tree and records it
- Stopwatch → resumes counting from where it left off
- Session older than 24h → discarded, not restored

## Data storage

All user data lives in the browser's `localStorage` (per-device, no server). Keys:

| Key | Contents |
| --- | --- |
| `blank_records` | focus sessions `{id, tag, tree, duration, date, completed}` (dates are ISO strings) |
| `blank_tags` | tag list `{id, label}` |
| `blank_userName` / `blank_userAvatar` | profile name & avatar tree id |
| `blank_version` | schema version (managed by migrations) |

Demo/sample data is **never** persisted — toggle it with `USE_SAMPLE_DATA` in `src/hooks/useHistory.js`.

## Migrations

When you make a change to stored data (rename/repurpose a field, restructure,
move data between keys), add a migration so existing devices don't lose or misread data.
Additive changes (a new optional field) don't need one — just default it on read.

Migrations live in `src/data/migrations.js` and run once at startup (`runMigrations()` in
`src/main.jsx`) before React reads anything.

To add one:

1. Bump `CURRENT_VERSION`.
2. Add a matching `migrations[n]` step (transforms localStorage from v`n-1` → v`n`).

```js
// example: rename records' `duration` → `minutes`
const CURRENT_VERSION = 2;      // was 1
2: () => {
  const recs = JSON.parse(localStorage.getItem("blank_records") || "[]");
  localStorage.setItem("blank_records",
    JSON.stringify(recs.map(({ duration, ...r }) => ({ ...r, minutes: duration }))));
},
```
