# IF-THEN Intention Engine

A productivity app built around **implementation intentions** — the finding that
a goal bound to a concrete situational cue ("IF I close my laptop, THEN I pack
my gym bag") gets acted on far more reliably than the same goal written as a
bare to-do.

The app is deliberately opinionated in two ways:

1. **No unanchored tasks.** Every record needs both an IF (trigger context) and
   a THEN (actionable step). The constraint is enforced in the domain layer, so
   it holds for typed input *and* for pasted import payloads.
2. **A hard cap on live commitments.** Only `ACTIVE_LIMIT` (7) intentions can be
   active at once. At capacity the form locks, and the only way forward is to
   complete or archive something. This is the anti-hoarding mechanic.

## Stack

- React 18 + Vite 5
- Tailwind CSS 3 with semantic tokens (`bg-background`, `text-muted-foreground`, …)
- Radix-backed shadcn/ui primitives — Button, Card, Input, Tabs, Dialog, Toast
- Lucide icons as visual anchors

## Local development

```bash
cd if-then-engine
npm install
npm run dev
```

`npm run build` emits to `dist/`. The base path defaults to the GitHub Pages
subpath; override it when hosting elsewhere:

```bash
IFTHEN_BASE=/ npm run build
```

## Data portability

The **Data portal** dialog exports the library as JSON and imports it back from
a pasted payload. Import accepts either a bare array or the export envelope:

```json
[
  { "trigger": "I close my laptop at 6pm", "action": "I pack my gym bag" },
  { "if": "I sit down at my desk", "then": "I review my inbox once" }
]
```

Both `trigger`/`action` and the `if`/`then` shorthand are accepted. Entries
missing either half are rejected and reported as skipped rather than silently
dropped. **Merge** dedupes against the existing library by `id`; **Replace**
swaps it wholesale.

## Layout

```
src/
  App.jsx                      app shell, theme toggle
  main.jsx                     entry point
  index.css                    design tokens (light + dark)
  components/
    IfThenPlanner.jsx          the planner: form, capacity gate, tabs, data portal
    ui/                        shadcn/ui primitives
  lib/
    intentions.js              domain rules, validation, import/export
    storage.js                 guarded localStorage persistence
```

State lives in a single `intentions` array persisted to `localStorage`. The
capacity gate is derived from that array rather than stored separately, so it
cannot drift out of sync.
