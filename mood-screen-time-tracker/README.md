# Mood ↔ Screen Time

A tiny, free, **no-login** web app for a personal science experiment:

> **Hypothesis:** less screen time → happier people — and it may differ by social app.

## What it does

- **Log your day** — pick a mood (😢→😄), enter total screen time, and optionally
  break down minutes per social app (Instagram, TikTok, YouTube, X, Facebook,
  Snapchat, Reddit, other).
- **Insights** — see whether *your* data supports the hypothesis: a mood-vs-screen-time
  scatter plot, a per-app "heavy use vs light use" mood comparison, a 14-day trend,
  and a plain-language verdict with a correlation value.
- **History** — review, edit (re-log the same date), or delete any day.
- **Data & research** — opt in to contribute your **anonymous** data, or export/import
  a full backup.

## Privacy

- **No account, no server.** Everything is stored in your browser's `localStorage`
  on this one device.
- Nothing is transmitted anywhere unless you tap **"Review & send my data"** and
  then choose to email or download it yourself.
- The research payload is deliberately minimal: dates, mood scores, and minutes only —
  **no name, no email, no notes, no device ID**. You see the exact JSON before it
  leaves your device.

## Run it

It's plain HTML/CSS/JS — no build step.

```bash
# from this folder, any static server works, e.g.:
python3 -m http.server 8000
# then open http://localhost:8000
```

Or just open `index.html` directly in a browser.

## Files

| File | Purpose |
| ---- | ------- |
| `index.html` | Markup and tab layout |
| `styles.css` | Styling (mobile-first) |
| `app.js` | All logic: storage, charts, correlation, export |

## Configuring research contributions

Contributions are sent by the user's own email client via a `mailto:` link. The
destination address is the `RESEARCH_EMAIL` constant at the top of `app.js`.
There is no backend collecting data — by design, to keep the app free and
login-free. If this experiment grows, a simple opt-in upload endpoint could
replace the `mailto:` step.
