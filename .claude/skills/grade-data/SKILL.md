---
name: grade-data
description: Format and rules of the grade JSON files in data/ (techniques, inheritance, isNew). Use when adding or editing techniques, forms, notes, videos or a grade.
---

# Grade data (`data/*.json`)

- One file per grade (`data/<id>.json`) plus an entry in `data/grades.json` (`id`, `label`, `file`, optional `includes`); new file → add it to `PRECACHE` in `sw.js`, then `yarn bump`.
- Structure: `waza` → attacks (`name`, `order`) → techniques (`name`, `order`, `forms`, `note`, `video`). Waza: `Tachi waza`, `Suwari waza`, `Hanmi Handachi waza`.
- Inheritance: 1st Kyo ⊇ 2nd ⊇ 3rd, through `includes`; merge by name, the last file wins. A grade file only holds its additions and minimal overrides; never copy parent data (a test detects useless copies).
- **`isNew` is never written in the JSON** (a test fails if it is): it is computed at load time by `markNew` (`src/shared/logic.js`, used by `resolveGrade`). A technique is new when it is absent (same waza, attack, name) from the lower grades; the lowest grade has none. So Sankyo (Tachi, Katate dori) is 🆕 in the 2nd Kyo but not in the 1st.
- `isWarning` (⚠️) no longer exists: do not reintroduce it in data, filters, weights or badges.
- Spelling: Nikkyo, Sankyo, first letter uppercase then lowercase. `video` must be an http(s) URL; `note` free text.
- Format: 2-space indentation, UTF-8, trailing newline. Run `yarn test` (`tests/data.test.js`) after any edit.
