import { test, describe } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";
import { ROOT, read, readJson, resolveGrade, parentsOf, keysOf, WAZA } from "./helpers.js";
import { mergeGrades } from "../src/logic.js";

describe("données JSON", () => {
  const grades = readJson("data/grades.json");

  test("grades.json référence des fichiers existants", () => {
    assert.ok(grades.length >= 2);
    for (const g of grades) {
      for (const f of [g.fichier, ...(g.inclut || [])]) {
        assert.ok(fs.existsSync(path.join(ROOT, "data", f)), `${f} introuvable`);
      }
    }
  });

  for (const g of grades) {
    test(`${g.fichier} respecte le format`, () => {
      const d = readJson(`data/${g.fichier}`);
      for (const [w, attaques] of Object.entries(d.waza)) {
        assert.ok(WAZA.includes(w), `waza inconnu : ${w}`);
        const noms = new Set();
        for (const a of attaques) {
          assert.ok(!noms.has(a.nom), `attaque dupliquée : ${w} / ${a.nom}`);
          noms.add(a.nom);
          assert.ok(a.techniques.length > 0, `attaque vide : ${a.nom}`);
          const techs = new Set();
          for (const t of a.techniques) {
            assert.ok(!techs.has(t.nom), `technique dupliquée : ${a.nom} / ${t.nom}`);
            techs.add(t.nom);
            if (t.formes !== undefined) assert.ok(Array.isArray(t.formes));
            for (const k of ["nouveau", "attention"]) {
              if (t[k] !== undefined) assert.equal(typeof t[k], "boolean");
            }
            if (t.video) assert.match(t.video, /^https?:\/\//);
          }
        }
      }
    });
  }

  test("orthographe harmonisée (Nikkyo, Sankyo)", () => {
    const all = JSON.stringify([readJson("data/1er-kyo.json"), readJson("data/2eme-kyo.json")]);
    assert.doesNotMatch(all, /Nikyo|Sankio/i);
  });

  test("2ème Kyo : lignes * de Yokomen uchi marquées attention", () => {
    const yoko = resolveGrade("2eme-kyo").waza["Tachi waza"].find((a) => a.nom === "Yokomen uchi");
    for (const nom of ["Ikkyo", "Nikkyo", "Sankyo", "Irimi nage", "Kote gaeshi"]) {
      assert.equal(yoko.techniques.find((t) => t.nom === nom).attention, true, nom);
    }
  });

  test("2ème Kyo : formes spéciales", () => {
    const d = resolveGrade("2eme-kyo");
    const kokyu = d.waza["Tachi waza"].find((a) => a.nom === "Katate dori").techniques.find((t) => t.nom === "Kokyu nage");
    assert.deepEqual(kokyu.formes, []);
    assert.equal(kokyu.note, "3 formes différentes");
    const taiken = d.waza["Hanmi Handachi waza"].flatMap((a) => a.techniques).find((t) => t.nom === "Taïken nage");
    assert.deepEqual(taiken.formes, ["Uchi", "Soto"]);
  });

  for (const g of grades.filter((x) => x.inclut)) {
    test(`${g.fichier} ne recopie pas les données identiques de ses parents`, () => {
      const parents = parentsOf(g.id);
      for (const [w, attaques] of Object.entries(readJson(`data/${g.fichier}`).waza)) {
        for (const a of attaques) {
          const base = parents.waza[w]?.find((x) => x.nom === a.nom);
          for (const t of a.techniques) {
            const bt = base?.techniques.find((x) => x.nom === t.nom);
            if (bt) assert.notDeepEqual({ ...bt, ...t }, bt, `${w}/${a.nom}/${t.nom} est une copie inutile`);
          }
        }
      }
    });
  }

  test("héritage : 1er Kyo ⊇ 2ème Kyo ⊇ 3ème Kyo", () => {
    assert.deepEqual(grades.find((g) => g.id === "1er-kyo").inclut, ["3eme-kyo.json", "2eme-kyo.json"]);
    assert.deepEqual(grades.find((g) => g.id === "2eme-kyo").inclut, ["3eme-kyo.json"]);
    assert.equal(grades.find((g) => g.id === "3eme-kyo").inclut, undefined);
    const k1 = new Set(keysOf(resolveGrade("1er-kyo")));
    const k2 = new Set(keysOf(resolveGrade("2eme-kyo")));
    for (const k of keysOf(readJson("data/3eme-kyo.json"))) assert.ok(k2.has(k), `3ème → 2ème : ${k}`);
    for (const k of k2) assert.ok(k1.has(k), `2ème → 1er : ${k}`);
  });

  test("le 2ème Kyo surcharge le 3ème Kyo", () => {
    const find = (d) => d.waza["Tachi waza"].find((a) => a.nom === "Katate ryote dori (ou morote dori)").techniques.find((t) => t.nom === "Ude kime nage");
    assert.deepEqual(find(readJson("data/3eme-kyo.json")).formes, ["Omote"]);
    assert.deepEqual(find(resolveGrade("2eme-kyo")).formes, ["Omote", "Ura"]);
  });
});

describe("clé order", () => {
  const ATTAQUES = ["Aï hammi katate dori", "Katate dori", "Ryote dori", "Katate ryote dori (ou morote dori)", "Kata dori", "Kata dori men uchi", "Ryo kata dori", "Muna dori", "Ushiro ryote dori", "Ushiro ryo hiji dori", "Ushiro ryo kata dori", "Ushiro eri dori", "Ushiro katate dori kubi shime", "Shomen uchi", "Yokomen uchi", "Chudan tsuki", "Jodan tsuki"];
  for (const f of ["3eme-kyo", "2eme-kyo", "1er-kyo"]) {
    test(`${f}.json : order des attaques = position dans la table de CLAUDE.md, sinon 42`, () => {
      for (const l of Object.values(readJson(`data/${f}.json`).waza))
        for (const a of l) {
          const i = ATTAQUES.indexOf(a.nom);
          assert.equal(a.order, i < 0 ? 42 : i + 1, a.nom);
        }
    });
  }

  const NOMBRES = { Ikkyo: 1, Nikkyo: 2, Sankyo: 3, Yonkyo: 4, Gokyo: 5, "Tenchi nage": 5, "Sokumen irimi nage": 6, "Shiho nage": 7, "Ude kime nage": 8, "Irimi nage": 9, "Kote gaeshi": 10, "Kaïten nage": 11 };
  for (const f of ["3eme-kyo", "2eme-kyo", "1er-kyo"]) {
    test(`${f}.json : order = nombre japonais du nom, sinon 42`, () => {
      for (const l of Object.values(readJson(`data/${f}.json`).waza))
        for (const a of l)
          for (const t of a.techniques) assert.equal(t.order, NOMBRES[t.nom] ?? 42, `${a.nom} / ${t.nom}`);
    });
  }
});

describe("version", () => {
  const html = read("index.html");
  const doc = read("CLAUDE.md");

  test("CSS et JS portent le même numéro de version que CLAUDE.md", () => {
    const css = html.match(/style\.css\?v=([\w.]+)/)?.[1];
    const js = html.match(/app\.js\?v=([\w.]+)/)?.[1];
    const ico = html.match(/favicon\.ico\?v=([\w.]+)/)?.[1];
    const documented = doc.match(/Version actuelle : `([\w.]+)`/)?.[1];
    assert.ok(css && js && documented, "version manquante");
    assert.equal(css, js);
    assert.equal(css, ico);
    const sw = read("sw.js").match(/const VERSION = "([\w.]+)"/)?.[1];
    assert.equal(sw, css, "sw.js : VERSION différente");
    assert.equal(css, documented);
    assert.match(css, /^\d{8}(\.\d+)?$/);
    const mapped = [...html.matchAll(/"\.\/src\/[\w-]+\.js": "\.\/src\/[\w-]+\.js\?v=([\w.]+)"/g)].map((m) => m[1]);
    assert.ok(mapped.length > 0 && mapped.every((v) => v === css), "import map : version différente");
  });
});

// ---------- Application mobile (PWA) ----------
describe("application mobile", () => {
  const html = read("index.html");
  const manifest = readJson("manifest.webmanifest");
  const sw = read("sw.js");

  test("index.html contient les balises mobile", () => {
    assert.match(html, /<meta name="viewport"[^>]*viewport-fit=cover/);
    assert.match(html, /<meta name="theme-color"/);
    assert.match(html, /<meta name="apple-mobile-web-app-capable" content="yes"/);
    assert.match(html, /<meta name="mobile-web-app-capable" content="yes"/);
    assert.match(html, /<link rel="manifest" href="manifest\.webmanifest"/);
    assert.match(html, /<link rel="apple-touch-icon" href="icons\/apple-touch-icon\.png"/);
    assert.match(html, /serviceWorker\.register\("sw\.js"\)/);
  });

  test("manifest installable : standalone, URLs relatives, icônes 192 et 512 existantes", () => {
    assert.equal(manifest.display, "standalone");
    assert.ok(manifest.name && manifest.short_name);
    for (const u of [manifest.start_url, manifest.scope]) assert.match(u, /^\./, "URL relative requise (sous-dossier GitHub Pages)");
    const sizes = manifest.icons.map((i) => i.sizes);
    assert.ok(sizes.includes("192x192") && sizes.includes("512x512"));
    for (const i of manifest.icons) assert.ok(fs.existsSync(path.join(ROOT, i.src)), `${i.src} introuvable`);
    assert.ok(fs.existsSync(path.join(ROOT, "icons/apple-touch-icon.png")));
  });

  test("le service worker précache des fichiers existants, dont tous les JSON de données", () => {
    const list = sw.match(/const PRECACHE = \[([\s\S]*?)\];/)[1];
    const files = [...list.matchAll(/["`]([^"`]+)["`]/g)].map((m) => m[1].replace("${VERSION}", "").split("?")[0]);
    for (const f of files) {
      assert.ok(f === "./" || fs.existsSync(path.join(ROOT, f)), `${f} introuvable`);
    }
    for (const f of fs.readdirSync(path.join(ROOT, "data"))) {
      assert.ok(files.includes(`data/${f}`), `data/${f} absent du précache (hors ligne)`);
    }
  });

  test("tous les modules src/ sont dans l'import map et le précache", () => {
    for (const f of fs.readdirSync(path.join(ROOT, "src"))) {
      assert.ok(html.includes(`"./src/${f}": "./src/${f}?v=`), `${f} absent de l'import map`);
      assert.ok(sw.includes(`src/${f}?v=`), `${f} absent du précache`);
    }
  });

  test("sw.js est un script valide", () => {
    assert.doesNotThrow(() => new vm.Script(sw));
  });
});
