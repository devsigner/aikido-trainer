# Aikido Trainer

Small static web app (HTML/CSS/JS, no dependencies and no build step) that randomly picks an aikido technique for training and review.

## Version

**Current version: `20261113.8`** (format `YYYYMMDD`, the date of the update).

For each new version:
1. Replace the number in `index.html`: `favicon.ico?v=...`, `style.css?v=...`, `app.js?v=...` and every import map entry (`./src/*.js?v=...`): this forces a reload and bypasses the cache. Any new `src/` module must be added to the import map and to the precache in `sw.js`.
2. Set the same value in `const VERSION` in `sw.js` (renews the offline cache).
3. Update the number above.
4. If two versions are published on the same day, add a suffix: `20261111.2`.

## Technique order (`order`)

Each technique in the JSON files (`data/*.json`, including the overrides in `1er-kyo.json`) has an `order` key (integer). It is used to sort the techniques of an attack in the program: ascending `order`, then alphabetical order (French) on ties.

| order | Techniques                            |
|-------|---------------------------------------|
| 1     | Ikkyo                                 |
| 2     | Nikkyo                                |
| 3     | Sankyo                                |
| 4     | Yonkyo                                |
| 5     | Gokyo                                 |
| 5     | Tenchi nage                           |
| 6     | Sokumen irimi nage                    |
| 7     | Shiho nage                            |
| 8     | Ude kime nage                         |
| 9     | Irimi nage                            |
| 10    | Kote gaeshi                           |
| 11    | Kaiten nage                           |
| 42    | all others (default value)            |

Rules:
- A new technique gets the `order` of its name if it is in the table, otherwise `42`.
- To change the `order` of a name, change it everywhere (3rd, 2nd and 1st Kyo) and update this table and `TECHNIQUE_ORDER` in `tests/data.test.js`: a test checks consistency.

## Attack order (`order`)

Each attack in the JSON files also has an `order` key (integer), which sorts the program's attack list: ascending `order`, then alphabetical order (French) on ties. This table is the reference (one value per attack name, identical across all waza and grades):

| order | Attack                                |
|-------|---------------------------------------|
| 1     | Aï hammi katate dori                  |
| 2     | Katate dori                           |
| 3     | Ryote dori                            |
| 4     | Katate ryote dori (ou morote dori)    |
| 5     | Kata dori                             |
| 6     | Kata dori men uchi                    |
| 7     | Ryo kata dori                         |
| 8     | Muna dori                             |
| 9     | Ushiro ryote dori                     |
| 10    | Ushiro ryo hiji dori                  |
| 11    | Ushiro ryo kata dori                  |
| 12    | Ushiro eri dori                       |
| 13    | Ushiro katate dori kubi shime         |
| 14    | Shomen uchi                           |
| 15    | Yokomen uchi                          |
| 16    | Chudan tsuki                          |
| 17    | Jodan tsuki                           |
| 42    | all others (default value)            |

Same rules as for techniques: a new attack gets the value of its name if it is in the table, otherwise `42`; to change a value, change it everywhere and update this table and `ATTACKS` in `tests/data.test.js`.

## Program

The "Voir le programme" (View the program) button (draw screen, under "Retour à l'accueil" (Back to home)) opens the full listing of the selected waza and grade, without touching the session (already-drawn techniques are kept). The 🆕/⚠️ filters do not apply there.

1. List of all attacks (sorted by `order`, then alphabetically).
2. Click on an attack: its card and the list of its techniques (sorted by `order`, then alphabetically).
3. Click on a technique: its card (forms, badges, note, video) and, below it, the other attacks of the same waza that have the same technique (name compared ignoring case and accents). Clicking one of them opens its card.

The ← button and the browser back action (`history`) go up one level, then return to the draw.

## Mobile app (PWA)

Installable on the home screen (iOS: Share → "Sur l'écran d'accueil" (Add to Home Screen); Android: "Installer l'application" (Install app)) and usable offline.

- `manifest.webmanifest`: `standalone` mode, portrait, colors `#14171c`, icons `icons/icon-192.png` and `icons/icon-512.png` (maskable). All URLs are relative (the site is served under `/aikido-trainer/` in production).
- `icons/apple-touch-icon.png` (180 px) for iOS. `apple-mobile-web-app-*` and `theme-color` tags in `index.html`, `viewport-fit=cover` with `env(safe-area-inset-*)` margins in `style.css`.
- `sw.js`: precaches all files (including the JSON files in `data/`), network-first then cache strategy. Any new data or icon file must be added to `PRECACHE` (a test checks this for `data/`).
- The service worker requires HTTPS (or `localhost`): it works in production (GitHub Pages) and locally, but not on the local network IP over HTTP.

## URLs

- Production (GitHub Pages): https://devsigner.github.io/aikido-trainer
- Repository: https://github.com/devsigner/aikido-trainer (`main` branch, automatic publication on push)

## Local development

An HTTP server is required (`fetch()` of the JSON files does not work over `file://`). From the project folder:

```
corepack enable  # enables the package manager (Node ≥ 20)
yarn install     # once only (installs http-server)
yarn server
```

Then open http://localhost:8000. `yarn server` runs `http-server` on port 8000 with caching disabled (`-c-1`).

Without yarn, any static server will do:

```
python3 -m http.server 8000
# or
ruby -run -ehttpd . -p8000
```

## Tests

No test dependencies: Node's built-in runner (≥ 20).

```
yarn test
```

- `tests/data.test.js`: JSON validity (format, duplicates, spelling, `order`, inheritance), version number consistency (`index.html` + import map ↔ `sw.js` ↔ `CLAUDE.md`), mobile configuration (tags, manifest, icons, precache, `src/` modules).
- `tests/app.test.js`: pure logic (pool, weighting, sorting, merging), `update`, `h()`, `resolveGrade`, and a full walkthrough using the real runtime with `tests/helpers.js` (virtual tree, simulated history: home, draw without repetition, progress, program, back).

Run the tests before every commit and add some for any new rule.

## Architecture (Elm pattern)

Unidirectional flow, no dependencies and no build (native ES modules + versioned import map):

- `Model` (`src/update.js`): all the state (screen, grade, filters, pool, current draw, program).
- `Msg`: objects `{ type, ... }` (`SelectGrade`, `StartSession`, `Next`, `Rolled`, `OpenProgram`, `Navigate`, `Back`, `Popped`…).
- `update(model, msg) → [model, cmds]`: pure function, never accesses the DOM, randomness or the network.
- `cmds`: effects described as data (`LoadGrade`, `Random`, `PushHistory`…), executed by `src/effects.js` which returns a `Msg`. Randomness is an effect (`Random` → `Rolled`) to stay testable.
- `view(model) → vnode` (`src/view.js`): pure function; handlers are messages. `src/vdom.js` provides `h()` and diff-based rendering; `src/runtime.js` loops `update → effects → view → render`.
- **URL** (`src/route.js`): `#/grade[/waza[/program[/attack[/technique]]]]`, derived from the model (`toHash`) and re-read on load or browser back (`parseHash`). Each screen change adds a history entry (`Url` command), changing grade replaces the URL. Reloading a URL restores the state: a waza starts a new draw (the pool is not kept); an unknown attack or technique falls back to the level above. Filters are not in the URL.
- The ids and CSS classes of the views are stable (used by `style.css` and the tests).

## Structure

```
index.html            Single page (home + draw screen)
favicon.ico           Site icon (character 道, embedded 16/32/48/64 px PNGs)
style.css
manifest.webmanifest   PWA manifest
sw.js                 Service worker (offline)
icons/                App icons (192, 512, apple-touch-icon)
app.js                Entry point (assembles init/update/view/effects)
src/logic.js          Pure functions (merge, pool, weighting, sorting)
src/update.js         Model, Msg, update
src/route.js          URL (hash) ⇄ model
src/view.js           view(model) → vnodes
src/vdom.js           h() and diff-based rendering
src/runtime.js        Elm loop
src/effects.js        Command execution (fetch, randomness, history)
data/grades.json      List of available grades
data/3eme-kyo.json    3rd Kyo program (complete, without `includes`)
data/2eme-kyo.json    2nd Kyo additions and overrides (inherits from the 3rd)
data/1er-kyo.json     1st Kyo additions and overrides (inherits from the 2nd and the 3rd)
tests/*.test.js       Tests (node:test), `tests/helpers.js`: utilities
package.json          `yarn server` and `yarn test` scripts, package manager (`packageManager`)
yarn.lock             Locked dependency versions
```

## Data (JSON)

One file per grade:

```json
{
  "grade": "2ème Kyo",
  "waza": {
    "Tachi waza": [
      {
        "name": "Aï hammi katate dori",
        "techniques": [
          {
            "name": "Nikkyo",
            "forms": ["Omote", "Ura"],
            "isNew": false,
            "isWarning": true,
            "note": null,
            "video": null,
            "order": 2
          }
        ]
      }
    ]
  }
}
```

- Waza: `Tachi waza`, `Suwari waza`, `Hanmi Handachi waza`.
- `forms`: array, empty if there is no form to draw (e.g. "Omote", "Ura").
- `isNew` (🆕) and `isWarning` (⚠️): markers carried by the whole technique.
- `note`: free text displayed under the technique (e.g. "Naname", "3 formes différentes").
- `video`: URL, the link is only displayed if it exists.
- Harmonized spelling: Nikkyo, Sankyo, first letter uppercase then lowercase (e.g. "Kote gaeshi").
- Adding a grade: create `data/<id>.json`, then add an entry in `data/grades.json` (`id`, `label`, `file`, and optionally `includes`).

### Inheritance between grades

Grades inherit in numbering order: 1st Kyo inherits from 2nd, which inherits from 3rd.

- `grades.json`: `includes` is the list of files loaded, in order, before the grade's own file. 3rd Kyo: no `includes`; 2nd Kyo: `["3eme-kyo.json"]`; 1st Kyo: `["3eme-kyo.json", "2eme-kyo.json"]`.
- `mergeGrades` (in `src/logic.js`) merges by name (waza, attack, technique): the last file wins. Each grade adds its new techniques and overrides inherited ones when needed.
- A grade file therefore only contains its additions and minimal overrides (`name`, `order` and the fields that change, e.g. `isNew`, `isWarning`, `forms`, `note`). Do not copy a parent's data (a test detects needless copies).
- Consequence: any technique added to the 3rd Kyo also appears in the 2nd and 1st Kyo, and any 2nd Kyo technique appears in the 1st.
- For an intended `null` value (e.g. clearing an inherited note), write it explicitly in the override.

## Application rules

- **Home**: grade selector (with the number of techniques), 🆕 Nouveautés (New) / ⚠️ Attention (Warning) filters, then one button per waza (order defined by `WAZA_ORDER`).
- **Filters**: none checked = everything; only one = techniques with that marker; both = one OR the other. A waza with no matching technique is disabled.
- **Draw**: uniform over all `attack × technique × form` combinations, weighted. Weight ×1.5 for `isNew` and ×1.5 for `isWarning` (cumulative), constants `WEIGHT_NEW` and `WEIGHT_WARNING` at the top of `src/logic.js`.
- **No repetition**: a combination already drawn does not come up again during the session. When all have been drawn, "Waza terminé 🎉" (Waza finished).
- **Session**: reset by "Retour à l'accueil" (Back to home). Filters are taken into account when the waza is chosen.
- **Display**: waza, attack, technique, form, 🆕/⚠️ badges, note, video link, progress counter ("n / total", per combination).
- **Buttons**: "Technique suivante" (Next technique, same waza) and "Retour à l'accueil" (Back to home).
- The grade selector's counter counts techniques per attack, without multiplying by forms.
