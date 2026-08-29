# Intention Engine

A mobile-first behavioural psychology app that enforces **implementation
intentions** — the "If-Then" planning format from Peter Gollwitzer's research.

The premise is a constraint, not a feature: an intention without a cue is just a
wish. So the **THEN (target step)** field is physically locked until you have
written a **IF (trigger context)**. You cannot hoard vague tasks here.

## Running it

```bash
npm install
npm run dev      # http://localhost:3000
```

```bash
npm run build    # production build
npm run lint     # eslint
```

## What's inside

| Path | Purpose |
| --- | --- |
| `components/if-then-planner.tsx` | The whole engine: composer, board, store, JSON transfer |
| `components/ui/` | shadcn/ui primitives (`base-nova` style, Base UI under the hood) |
| `src/app/page.tsx` | Route that mounts the planner |
| `src/app/layout.tsx` | Fonts, theme provider, sonner `<Toaster />` |

### Behaviour

- **Locked creation.** The target step and the commit button stay disabled until
  the trigger context has at least four characters.
- **Three cue configurations.** `Event` anchors to something that already happens,
  `Time` pins a clock time and place, and `Backup` pre-plans the recovery route
  for a missed window. Each one rewrites the connector, placeholders, and coaching
  copy.
- **Persistence.** Loops are cached in `localStorage` under
  `intention-engine:loops:v1`. React reads them through `useSyncExternalStore`, so
  the server-rendered markup stays deterministic and open tabs stay in sync.
- **Transfer payloads.** A dialog exports the board as a JSON string and imports
  one back, either merging (duplicate ids skipped) or replacing. Imports accept
  both `{ "intentions": [...] }` and a bare array, and every record is validated
  before it lands.
- **Completion.** Ticking a loop strikes the text through and raises a sonner
  toast with an undo action. Deletes and clears are undoable too.

### Payload shape

```json
{
  "kind": "intention-engine/loops",
  "version": 1,
  "exportedAt": "2026-01-01T09:00:00.000Z",
  "intentions": [
    {
      "id": "1f9c…",
      "cueType": "time",
      "trigger": "7:15am, at the kitchen table",
      "action": "I read one chapter before opening my inbox",
      "done": false,
      "createdAt": 1767258000000,
      "completedAt": null
    }
  ]
}
```

`cueType` is one of `event`, `time`, `contingency`. Only `trigger` and `action`
are required on import — everything else is defaulted.

## Stack

Next.js 16 (App Router) · React 19 · Tailwind CSS v4 · shadcn/ui · Base UI ·
lucide-react · sonner
