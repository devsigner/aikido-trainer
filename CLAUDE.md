# Aikido Trainer

Small static web app written in Gren (compiled to `app.js`, which is committed) that randomly picks an aikido technique for training and review.

## Version

**Current version: `20261114.102`** (format `YYYYMMDD`, the date of the update).

For each new version:
1. Replace the number in `index.html`: `favicon.ico?v=...`, `style.css?v=...` and `app.js?v=...`: this forces a reload and bypasses the cache.
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

The "Voir le programme" (View the program) button (quiz screen, under "Retour à l'accueil" (Back to home)) opens the full listing of the selected waza and grade; the draw session ends (back to the quiz starts a new one at 0). The 🆕/⚠️ filters do not apply there.

1. List of all attacks (sorted by `order`, then alphabetically).
2. Click on an attack: its card and the list of its techniques (sorted by `order`, then alphabetically).
3. Click on a technique: its card (forms, badges, note, video) and, below it, the other attacks of the same waza that have the same technique (name compared ignoring case and accents). Clicking one of them opens its card.

The ← button and the browser back action (`history`) go up one level, then return to the quiz.

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
yarn install     # once only (Gren compiler, http-server)
yarn build       # after each change of src/*.gren
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

```
yarn build    # src/*.gren → app.js (commit the result)
yarn test
```

A `pre-commit` hook (`.githooks/`, enabled by `yarn install` through the `prepare` script) runs the tests before each commit and blocks the commit on failure.

- `tests/gren/Main.gren`: Gren unit tests (`gren-lang/test`, node platform; no `Browser` module there, so only `Grade` and `Route` are testable). `tests/gren.test.js` compiles and runs them, and checks that `app.js` equals a fresh build of `src/` (forgot `yarn build`).
- `tests/data.test.js`: JSON validity (format, duplicates, spelling, `order`, inheritance), version number consistency (`index.html` ↔ `sw.js` ↔ `CLAUDE.md`), mobile configuration (tags, manifest, icons, precache).
- `tests/helpers.js`: reads the data and merges grades (independent of the Gren code).

Run the tests before every commit and add some for any new rule.

## Architecture (The Elm Architecture, in Gren)

Gren 0.6.6 (`gren.json`, `src/`): `when … is` instead of `case`, `Array` instead of `List`, no tuples (records), variants with a single parameter, `Array.prepend a b` = `a ++ b` (careful: `Array.append` is the reverse).

- `src/Main.gren`: `Browser.application { init, update, view, subscriptions, onUrlRequest, onUrlChange }`. Flags: `{ skipVideoWarning }` (read from `localStorage` by `index.html`). `update : Msg -> Model -> { model, command }` is pure; randomness is a command (`Random.generate Rolled`), the HTTP loading a `Task` (`GradesLoaded`).
- `src/Types.gren`: `Model { status, grades, gradeId, filters, screen, slide, skipVideoWarning, videoPrompt, … }`, `Screen = Home | Quiz QuizState | Program { waza, level }`, `Msg`, `routeOf` (the route is derived from the model).
- `src/Grade.gren`: pure functions on the data (JSON decoders with partial patches, `mergeFile`, `buildPool`, `pickIndex`, sorting, `norm`).
- `src/Route.gren`: `parse` / `toHash` / `depth`.
- `src/View.gren`: `view : Model -> Document Msg`. The ids and CSS classes are stable (used by `style.css`).
- **URL**: `#/grade[/waza[/program[/attack[/technique]]]]`. A user action does `pushUrl`; `UrlChanged` (browser back/forward, reload) applies the route if it differs from `routeOf model`, narrowed to what the data contains (unknown grade → first grade; unknown waza → home; unknown attack or technique → level above). A waza starts a new quiz (the pool is not kept). Slide direction: deeper route = forward. Filters are not in the URL.
- Debug: `gren make Main --debug` gives the Elm-style time-travel debugger (do not commit that build).
- The data live in the model (`grades`), decoded once at startup; offline use relies on the service worker cache of `data/*.json`.

## Structure

```
README.md             User manual (French) with screenshots from `docs/screenshots/`
index.html            Single page: loads `app.js`, then `Gren.Main.init` with the flags
favicon.ico           Site icon (character 道, embedded 16/32/48/64 px PNGs)
style.css
manifest.webmanifest   PWA manifest
sw.js                 Service worker (offline)
icons/                App icons (192, 512, apple-touch-icon)
gren.json             Gren project (browser application, source `src/`)
app.js                Compiled by `yarn build` (committed)
src/*.gren            Main, Types, Grade, Route, View
data/grades.json      List of available grades
data/3eme-kyo.json    3rd Kyo program (complete, without `includes`)
data/2eme-kyo.json    2nd Kyo additions and overrides (inherits from the 3rd)
data/1er-kyo.json     1st Kyo additions and overrides (inherits from the 2nd and the 3rd)
tests/                `*.test.js` (node:test), `gren/` (Gren unit tests, own `gren.json`), `helpers.js`
package.json          `yarn server`, `yarn build` and `yarn test` scripts, package manager (`packageManager`)
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
- `Grade.mergeFile` (in `src/Grade.gren`) merges by name (waza, attack, technique): the last file wins. Each grade adds its new techniques and overrides inherited ones when needed.
- A grade file therefore only contains its additions and minimal overrides (`name`, `order` and the fields that change, e.g. `isNew`, `isWarning`, `forms`, `note`). Do not copy a parent's data (a test detects needless copies).
- Consequence: any technique added to the 3rd Kyo also appears in the 2nd and 1st Kyo, and any 2nd Kyo technique appears in the 1st.
- For an intended `null` value (e.g. clearing an inherited note), write it explicitly in the override.

## Application rules

- **Home**: grade selector (with the number of techniques), 🆕 Nouveautés (New) / ⚠️ Attention (Warning) filters, then one button per waza (order defined by `Grade.wazaOrder`).
- **Filters**: none checked = everything; only one = techniques with that marker; both = one OR the other. A waza with no matching technique is disabled.
- **Draw**: uniform over all `attack × technique × form` combinations, weighted. Weight ×1.5 for `isNew` and ×1.5 for `isWarning` (cumulative), constants `weightNew` and `weightWarning` in `src/Grade.gren`.
- **No repetition**: a combination already drawn does not come up again during the session. When all have been drawn, "Waza terminé 🎉" (Waza finished).
- **Session**: reset by "Retour à l'accueil" (Back to home). Filters are taken into account when the waza is chosen.
- **Display**: waza, attack, technique, form, 🆕/⚠️ badges, note, video link, progress counter ("n / total", per combination).
- **Buttons**: "Technique suivante" (Next technique, same waza) and "Retour à l'accueil" (Back to home).
- The grade selector's counter counts techniques per attack, without multiplying by forms.
