---
name: served-files
description: Cache busting, import map and service worker precache. Use after any change to served code, data, styles or assets, or when adding/renaming a file.
---

# Served files

- After any change to a served file (`src/`, `framework/`, `data/`, `style.css`, assets, screenshots): run `yarn bump`. Run it again after **every** later edit. `.md` files, tests and scripts do not need it.
- Any new `src/` module: add it to the import map of `index.html` **and** to the precache of `sw.js`.
- Any new data or icon file: add it to `PRECACHE` in `sw.js`.
- Renaming or deleting a `docs/screenshots/*` file: fix `sw.js` (otherwise the "service worker precaches existing files" test fails).
- Then check with `yarn lint` and `yarn test` (2 "version" tests fail if the bump is missing).
