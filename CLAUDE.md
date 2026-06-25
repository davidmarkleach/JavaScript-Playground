# JavaScript-Playground

This repository is a personal **playground for random, unrelated projects**. It is
not a single application — it's a collection of experiments. Treat each project as
self-contained.

## Conventions for future AI assistants

- **One folder per project.** When asked to build something new and distinct,
  create a new top-level folder for it rather than dropping files into the repo
  root. The root currently holds older loose experiments (an animated counter, a
  drawing assistant, assorted `pageN.html` files); leave those alone unless asked.
- **Vanilla web stack.** Existing work is plain HTML/CSS/JS with no build step.
  Prefer the same — files that open directly in a browser — unless the user asks
  for a framework/build tooling.
- **No secrets / no backend by default.** Projects here are static and run
  client-side.
- Tooling present at the root: `jshint` (via `node_modules`) and a `.vscode`
  folder. There is no test runner configured.

## Projects

| Folder | Description |
| ------ | ----------- |
| `mood-screen-time-tracker/` | Free, no-login, on-device app that logs daily mood and screen time (broken down by social app) to explore the hypothesis "less screen time → happier." Includes an opt-in anonymized data export to contribute to a research report. See its own `README.md`. |
| _(root, loose files)_ | Older misc experiments: animated counter, AI drawing assistant, `pageN.html` demos. |
