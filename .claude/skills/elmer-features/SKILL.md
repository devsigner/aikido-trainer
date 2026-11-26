---
name: elmer-features
description: ELMer architecture rules (features, messages, events, views). Use when creating or changing a feature, a view or a message in src/.
---

# ELMer architecture

- A feature = `defineFeature({ name, initialState, messages, on, views, effects… })` in `src/features/`. It writes only its own slice; to read another slice use `root` (read-only); to act on another feature, publish an event (`emit`).
- A view belongs to the feature whose responsibility it is (e.g. draw filters → `quiz`, grade selector → `catalog`, Program button → `program`). Assemble them in `src/layout/` with `embed(name, view)`.
- `embed` requires **a single root node**.
- `update` stays pure: randomness, network and DOM go through effects (`cmd`).
- View or update errors can show up as "Chargement impossible (…)" (catch of the catalog `loading` effect): look for the real bug.
- A message sent from another feature: `to("feature", { type, … })`.
- Add tests in `tests/app.test.js` / `tests/elmer.test.js` and follow the `served-files` skill (bump, import map, precache).
