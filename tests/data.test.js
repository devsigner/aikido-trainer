import { test, describe } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";
import { ROOT, read, readJson, resolveGrade, parentsOf, keysOf, WAZA } from "./helpers.js";
import { mergeGrades } from "../src/logic.js";

describe("JSON data", () => {
  const grades = readJson("data/grades.json");

  test("grades.json references existing files", () => {
    assert.ok(grades.length >= 2);
    for (const grade of grades) {
      for (const file of [grade.file, ...(grade.includes || [])]) {
        assert.ok(fs.existsSync(path.join(ROOT, "data", file)), `${file} not found`);
      }
    }
  });

  for (const grade of grades) {
    test(`${grade.file} follows the format`, () => {
      const data = readJson(`data/${grade.file}`);
      for (const [waza, attacks] of Object.entries(data.waza)) {
        assert.ok(WAZA.includes(waza), `unknown waza: ${waza}`);
        const names = new Set();
        for (const attack of attacks) {
          assert.ok(!names.has(attack.name), `duplicate attack: ${waza} / ${attack.name}`);
          names.add(attack.name);
          assert.ok(attack.techniques.length > 0, `empty attack: ${attack.name}`);
          const techniqueNames = new Set();
          for (const technique of attack.techniques) {
            assert.ok(!techniqueNames.has(technique.name), `duplicate technique: ${attack.name} / ${technique.name}`);
            techniqueNames.add(technique.name);
            if (technique.forms !== undefined) assert.ok(Array.isArray(technique.forms));
            for (const key of ["isNew", "isWarning"]) {
              if (technique[key] !== undefined) assert.equal(typeof technique[key], "boolean");
            }
            if (technique.video) assert.match(technique.video, /^https?:\/\//);
          }
        }
      }
    });
  }

  test("consistent spelling (Nikkyo, Sankyo)", () => {
    const all = JSON.stringify([readJson("data/1er-kyo.json"), readJson("data/2eme-kyo.json")]);
    assert.doesNotMatch(all, /Nikyo|Sankio/i);
  });

  test("2nd Kyo: starred Yokomen uchi lines flagged as warning", () => {
    const yoko = resolveGrade("2eme-kyo").waza["Tachi waza"].find((attack) => attack.name === "Yokomen uchi");
    for (const name of ["Ikkyo", "Nikkyo", "Sankyo", "Irimi nage", "Kote gaeshi"]) {
      assert.equal(yoko.techniques.find((technique) => technique.name === name).isWarning, true, name);
    }
  });

  test("2nd Kyo: special forms", () => {
    const data = resolveGrade("2eme-kyo");
    const kokyu = data.waza["Tachi waza"].find((attack) => attack.name === "Katate dori").techniques.find((technique) => technique.name === "Kokyu nage");
    assert.deepEqual(kokyu.forms, []);
    assert.equal(kokyu.note, "3 formes différentes");
    const taiken = data.waza["Hanmi Handachi waza"].flatMap((attack) => attack.techniques).find((technique) => technique.name === "Taïken nage");
    assert.deepEqual(taiken.forms, ["Uchi", "Soto"]);
  });

  for (const grade of grades.filter((candidate) => candidate.includes)) {
    test(`${grade.file} does not copy data identical to its parents`, () => {
      const parents = parentsOf(grade.id);
      for (const [waza, attacks] of Object.entries(readJson(`data/${grade.file}`).waza)) {
        for (const attack of attacks) {
          const base = parents.waza[waza]?.find((candidate) => candidate.name === attack.name);
          for (const technique of attack.techniques) {
            const baseTechnique = base?.techniques.find((candidate) => candidate.name === technique.name);
            if (baseTechnique) assert.notDeepEqual({ ...baseTechnique, ...technique }, baseTechnique, `${waza}/${attack.name}/${technique.name} is a useless copy`);
          }
        }
      }
    });
  }

  test("inheritance: 1st Kyo ⊇ 2nd Kyo ⊇ 3rd Kyo", () => {
    assert.deepEqual(grades.find((grade) => grade.id === "1er-kyo").includes, ["3eme-kyo.json", "2eme-kyo.json"]);
    assert.deepEqual(grades.find((grade) => grade.id === "2eme-kyo").includes, ["3eme-kyo.json"]);
    assert.equal(grades.find((grade) => grade.id === "3eme-kyo").includes, undefined);
    const firstKyoKeys = new Set(keysOf(resolveGrade("1er-kyo")));
    const secondKyoKeys = new Set(keysOf(resolveGrade("2eme-kyo")));
    for (const key of keysOf(readJson("data/3eme-kyo.json"))) assert.ok(secondKyoKeys.has(key), `3rd → 2nd: ${key}`);
    for (const key of secondKyoKeys) assert.ok(firstKyoKeys.has(key), `2nd → 1st: ${key}`);
  });

  test("the 2nd Kyo overrides the 3rd Kyo", () => {
    const find = (data) => data.waza["Tachi waza"].find((attack) => attack.name === "Katate ryote dori (ou morote dori)").techniques.find((technique) => technique.name === "Ude kime nage");
    assert.deepEqual(find(readJson("data/3eme-kyo.json")).forms, ["Omote"]);
    assert.deepEqual(find(resolveGrade("2eme-kyo")).forms, ["Omote", "Ura"]);
  });
});

describe("order key", () => {
  const ATTACKS = ["Aï hammi katate dori", "Katate dori", "Ryote dori", "Katate ryote dori (ou morote dori)", "Kata dori", "Kata dori men uchi", "Ryo kata dori", "Muna dori", "Ushiro ryote dori", "Ushiro ryo hiji dori", "Ushiro ryo kata dori", "Ushiro eri dori", "Ushiro katate dori kubi shime", "Shomen uchi", "Yokomen uchi", "Chudan tsuki", "Jodan tsuki"];
  for (const file of ["3eme-kyo", "2eme-kyo", "1er-kyo"]) {
    test(`${file}.json: attack order = position in the CLAUDE.md table, otherwise 42`, () => {
      for (const list of Object.values(readJson(`data/${file}.json`).waza))
        for (const attack of list) {
          const index = ATTACKS.indexOf(attack.name);
          assert.equal(attack.order, index < 0 ? 42 : index + 1, attack.name);
        }
    });
  }

  const TECHNIQUE_ORDER = { Ikkyo: 1, Nikkyo: 2, Sankyo: 3, Yonkyo: 4, Gokyo: 5, "Tenchi nage": 5, "Sokumen irimi nage": 6, "Shiho nage": 7, "Ude kime nage": 8, "Irimi nage": 9, "Kote gaeshi": 10, "Kaïten nage": 11 };
  for (const file of ["3eme-kyo", "2eme-kyo", "1er-kyo"]) {
    test(`${file}.json: order = Japanese number in the name, otherwise 42`, () => {
      for (const list of Object.values(readJson(`data/${file}.json`).waza))
        for (const attack of list)
          for (const technique of attack.techniques) assert.equal(technique.order, TECHNIQUE_ORDER[technique.name] ?? 42, `${attack.name} / ${technique.name}`);
    });
  }
});

describe("version", () => {
  const html = read("index.html");
  const doc = read("CLAUDE.md");

  test("CSS and JS carry the same version number as CLAUDE.md", () => {
    const css = html.match(/style\.css\?v=([\w.]+)/)?.[1];
    const js = html.match(/app\.js\?v=([\w.]+)/)?.[1];
    const ico = html.match(/favicon\.ico\?v=([\w.]+)/)?.[1];
    const documented = doc.match(/Current version: `([\w.]+)`/)?.[1];
    assert.ok(css && js && documented, "missing version");
    assert.equal(css, js);
    assert.equal(css, ico);
    const sw = read("sw.js").match(/const VERSION = "([\w.]+)"/)?.[1];
    assert.equal(sw, css, "sw.js: different VERSION");
    assert.equal(css, documented);
    assert.match(css, /^\d{8}(\.\d+)?$/);
    const mapped = [...html.matchAll(/"\.\/src\/[\w-]+\.js": "\.\/src\/[\w-]+\.js\?v=([\w.]+)"/g)].map((match) => match[1]);
    assert.ok(mapped.length > 0 && mapped.every((version) => version === css), "import map: different version");
  });
});

// ---------- Mobile app (PWA) ----------
describe("mobile app", () => {
  const html = read("index.html");
  const manifest = readJson("manifest.webmanifest");
  const sw = read("sw.js");

  test("index.html shows a splash spinner inside #app until the app starts", () => {
    assert.match(html, /<div id="app">.*class="spinner".*<\/div>/);
  });

  test("index.html contains the mobile tags", () => {
    assert.match(html, /<meta name="viewport"[^>]*viewport-fit=cover/);
    assert.match(html, /<meta name="theme-color"/);
    assert.match(html, /<meta name="apple-mobile-web-app-capable" content="yes"/);
    assert.match(html, /<meta name="mobile-web-app-capable" content="yes"/);
    assert.match(html, /<link rel="manifest" href="manifest\.webmanifest"/);
    assert.match(html, /<link rel="apple-touch-icon" href="icons\/apple-touch-icon\.png"/);
    assert.match(html, /serviceWorker\.register\("sw\.js"\)/);
  });

  test("installable manifest: standalone, relative URLs, existing 192 and 512 icons", () => {
    assert.equal(manifest.display, "standalone");
    assert.ok(manifest.name && manifest.short_name);
    for (const url of [manifest.start_url, manifest.scope]) assert.match(url, /^\./, "relative URL required (GitHub Pages subfolder)");
    const sizes = manifest.icons.map((item) => item.sizes);
    assert.ok(sizes.includes("192x192") && sizes.includes("512x512"));
    for (const item of manifest.icons) assert.ok(fs.existsSync(path.join(ROOT, item.src)), `${item.src} introuvable`);
    assert.ok(fs.existsSync(path.join(ROOT, "icons/apple-touch-icon.png")));
  });

  test("the service worker precaches existing files, including all data JSON files", () => {
    const list = sw.match(/const PRECACHE = \[([\s\S]*?)\];/)[1];
    const files = [...list.matchAll(/["`]([^"`]+)["`]/g)].map((match) => match[1].replace("${VERSION}", "").split("?")[0]);
    for (const file of files) {
      assert.ok(file === "./" || fs.existsSync(path.join(ROOT, file)), `${file} not found`);
    }
    for (const file of fs.readdirSync(path.join(ROOT, "data"))) {
      assert.ok(files.includes(`data/${file}`), `data/${file} missing from the precache (offline)`);
    }
  });

  test("every src/ module is in the import map and the precache", () => {
    for (const file of fs.readdirSync(path.join(ROOT, "src"))) {
      assert.ok(html.includes(`"./src/${file}": "./src/${file}?v=`), `${file} missing from the import map`);
      assert.ok(sw.includes(`src/${file}?v=`), `${file} missing from the precache`);
    }
  });

  test("sw.js is a valid script", () => {
    assert.doesNotThrow(() => new vm.Script(sw));
  });
});
