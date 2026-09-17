**English** | [简体中文](README.zh-CN.md)

# Blank

a focus app in cute pixel art

React + Vite + SVG pixel art

## License notice

This project is **dual-licensed**:

- **Code** → [Apache 2.0](LICENSE). Open source — fork, modify, and reuse freely.
- **Pixel art, name & icon** → [All Rights Reserved](ASSETS-LICENSE). **Not** open source.

You may **not** publish this app, or any app reusing its pixel art / name / icon,
to any app store (Apple App Store, Google Play, etc.). See [`ASSETS-LICENSE`](ASSETS-LICENSE).

## Contribution

Issues and PRs welcome!

- Bug reports → open an Issue
- Want a new tree species → open an Issue with a reference image, or send a PR
- Code contributions → Fork → open a PR

## Local & GitHub Pages

```bash
npm install
npm run dev
```

## iPhone usage

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

Demo/sample data is **never** persisted — toggle it in-app via the "看看示例" button on the
Stats screen (backed by the `demo` state in `src/hooks/useHistory.js`).

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
