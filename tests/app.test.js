const { test, describe } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

const ROOT = path.join(__dirname, "..");
const readJson = (f) => JSON.parse(fs.readFileSync(path.join(ROOT, f), "utf8"));
const WAZA = ["Tachi waza", "Suwari waza", "Hanmi Handachi waza"];

// ---------- Faux DOM minimal pour exécuter app.js tel quel ----------
class El {
  constructor() {
    this.children = [];
    this.options = [];
    this.hidden = false;
    this.disabled = false;
    this.checked = false;
    this.value = "";
    this.textContent = "";
    this.href = "";
  }
  set innerHTML(_) {
    this.children = [];
  }
  appendChild(c) {
    this.children.push(c);
  }
  add(opt) {
    this.options.push(opt);
    if (this.options.length === 1) this.value = opt.value;
  }
}

async function createEnv({ random = Math.random } = {}) {
  const els = {};
  const el = (id) => (els[id] ??= new El());
  el("draw").hidden = true;
  el("done").hidden = true;
  el("card-video").hidden = true;

  const ctx = vm.createContext({
    document: { getElementById: el, createElement: () => new El() },
    Option: class {
      constructor(text, value) {
        this.text = text;
        this.value = value;
      }
    },
    fetch: async (p) => ({ json: async () => readJson(p) }),
    console,
    Math: Object.create(Math, { random: { value: () => random() } }),
  });

  const src = fs.readFileSync(path.join(ROOT, "app.js"), "utf8").trimEnd();
  assert.match(src, /init\(\);$/, "app.js doit se terminer par init();");
  vm.runInContext(src.replace(/init\(\);$/, ""), ctx);
  await vm.runInContext("init()", ctx);

  return {
    el,
    // Les objets du contexte vm ont d'autres prototypes : on renvoie des copies JSON simples.
    run: (code) => {
      const v = vm.runInContext(code, ctx);
      return v && typeof v === "object" ? JSON.parse(JSON.stringify(v)) : v;
    },
    wazaButtons: () => el("waza-buttons").children,
    async selectGrade(id) {
      el("grade").value = id;
      await el("grade").onchange();
    },
    setFilters({ nouveau = false, attention = false }) {
      el("f-nouveau").checked = nouveau;
      el("f-attention").checked = attention;
      el("f-nouveau").onchange();
    },
    start: (waza) => el("waza-buttons").children.find((b) => b.textContent === waza).onclick(),
    next: () => el("next").onclick(),
    home: () => el("home-btn").onclick(),
    card() {
      return {
        waza: el("card-waza").textContent,
        attaque: el("card-attaque").textContent,
        technique: el("card-technique").textContent,
        forme: el("card-forme").textContent,
        badges: el("card-badges").textContent,
        note: el("card-note").textContent,
        video: el("card-video"),
      };
    },
  };
}

const cardKey = (c) => [c.attaque, c.technique, c.forme].join(" – ");
const keysOf = (d) =>
  Object.entries(d.waza).flatMap(([w, l]) => l.flatMap((a) => a.techniques.map((t) => `${w}|${a.nom}|${t.nom}`)));

// ---------- Données ----------
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
    const yoko = readJson("data/2eme-kyo.json").waza["Tachi waza"].find((a) => a.nom === "Yokomen uchi");
    for (const nom of ["Ikkyo", "Nikkyo", "Sankyo", "Irimi nage", "Kote gaeshi"]) {
      assert.equal(yoko.techniques.find((t) => t.nom === nom).attention, true, nom);
    }
  });

  test("2ème Kyo : formes spéciales", () => {
    const d = readJson("data/2eme-kyo.json");
    const kokyu = d.waza["Tachi waza"][0].techniques.find((t) => t.nom === "Kokyu nage");
    assert.deepEqual(kokyu.formes, []);
    assert.equal(kokyu.note, "3 formes différentes");
    const taiken = d.waza["Hanmi Handachi waza"].flatMap((a) => a.techniques).find((t) => t.nom === "Taïken nage");
    assert.deepEqual(taiken.formes, ["Uchi", "Soto"]);
  });

  test("1er-kyo.json ne recopie pas les données identiques du 2ème Kyo", () => {
    const e2 = readJson("data/2eme-kyo.json");
    const e1 = readJson("data/1er-kyo.json");
    for (const [w, attaques] of Object.entries(e1.waza)) {
      for (const a of attaques) {
        const base = e2.waza[w]?.find((x) => x.nom === a.nom);
        for (const t of a.techniques) {
          const bt = base?.techniques.find((x) => x.nom === t.nom);
          if (bt) assert.notDeepEqual({ ...bt, ...t }, bt, `${w}/${a.nom}/${t.nom} est une copie inutile`);
        }
      }
    }
  });
});

// ---------- Fusion des grades ----------
describe("mergeGrades", () => {
  let env;
  const merge = (a, b) => env.run(`mergeGrades(${JSON.stringify(a)}, ${JSON.stringify(b)})`);
  const base = () => ({
    grade: "B",
    waza: {
      "Tachi waza": [
        { nom: "Katate dori", techniques: [{ nom: "Ikkyo", formes: ["Omote", "Ura"], nouveau: true, attention: false, video: "https://v" }] },
      ],
    },
  });

  test("surcharge des champs sans perdre le reste", async () => {
    env ??= await createEnv();
    const over = { grade: "A", waza: { "Tachi waza": [{ nom: "Katate dori", techniques: [{ nom: "Ikkyo", nouveau: false, attention: true }] }] } };
    const t = merge(base(), over).waza["Tachi waza"][0].techniques[0];
    assert.deepEqual(
      t,
      { nom: "Ikkyo", formes: ["Omote", "Ura"], nouveau: false, attention: true, video: "https://v" },
    );
  });

  test("ajoute attaques, techniques et waza absents de la base", async () => {
    env ??= await createEnv();
    const over = {
      waza: {
        "Tachi waza": [
          { nom: "Katate dori", techniques: [{ nom: "Yonkyo", formes: [] }] },
          { nom: "Muna dori", techniques: [{ nom: "Shiho nage", formes: [] }] },
        ],
        "Suwari waza": [{ nom: "Ryote dori", techniques: [{ nom: "Ikkyo", formes: [] }] }],
      },
    };
    const m = merge(base(), over);
    assert.deepEqual(m.waza["Tachi waza"][0].techniques.map((t) => t.nom), ["Ikkyo", "Yonkyo"]);
    assert.equal(m.waza["Tachi waza"][1].nom, "Muna dori");
    assert.equal(m.waza["Suwari waza"].length, 1);
  });

  test("conserve le grade et la note du fichier prioritaire", async () => {
    env ??= await createEnv();
    const m = merge(base(), { grade: "A", note: "n", waza: {} });
    assert.equal(m.grade, "A");
    assert.equal(m.note, "n");
  });

  test("ne modifie pas la base", async () => {
    env ??= await createEnv();
    const b = JSON.stringify(base());
    const after = env.run(`(() => {
      const b = ${b};
      mergeGrades(b, { waza: { "Tachi waza": [{ nom: "Katate dori", techniques: [{ nom: "Ikkyo", nouveau: false }, { nom: "X" }] }] } });
      return JSON.stringify(b);
    })()`);
    assert.equal(after, b);
  });

  test("1er Kyo fusionné = toutes les données du 2ème Kyo + ses propres techniques", async () => {
    env ??= await createEnv();
    const e2 = readJson("data/2eme-kyo.json");
    const e1 = readJson("data/1er-kyo.json");
    const m = merge(e2, e1);
    const merged = new Set(keysOf(m));
    for (const k of [...keysOf(e2), ...keysOf(e1)]) assert.ok(merged.has(k), `perdu : ${k}`);
    assert.equal(merged.size, 161);
    // la vidéo du 2ème Kyo survit à la surcharge des marqueurs
    const sankyo = m.waza["Tachi waza"][0].techniques.find((t) => t.nom === "Sankyo");
    assert.equal(sankyo.nouveau, false);
    assert.equal(sankyo.attention, true);
    assert.match(sankyo.video, /youtube/);
  });
});

// ---------- Interface et tirage ----------
describe("accueil", () => {
  test("sélecteur de grade avec le nombre de techniques", async () => {
    const env = await createEnv();
    assert.deepEqual(
      env.el("grade").options.map((o) => o.text),
      ["1er Kyo (161 techniques)", "2ème Kyo (102 techniques)"],
    );
  });

  test("boutons waza dans l'ordre défini, tous actifs sans filtre", async () => {
    const env = await createEnv();
    assert.deepEqual(env.wazaButtons().map((b) => b.textContent), env.run("WAZA_ORDER"));
    assert.ok(env.wazaButtons().every((b) => !b.disabled));
    assert.equal(env.el("home-msg").textContent, "");
  });

  test("filtre Attention : waza sans technique correspondante désactivé", async () => {
    const env = await createEnv();
    await env.selectGrade("2eme-kyo");
    env.setFilters({ attention: true });
    const disabled = Object.fromEntries(env.wazaButtons().map((b) => [b.textContent, b.disabled]));
    assert.deepEqual(disabled, { "Tachi waza": false, "Hanmi Handachi waza": true, "Suwari waza": true });
    assert.match(env.el("home-msg").textContent, /aucune technique/i);
  });

  test("changer de grade recharge les données fusionnées", async () => {
    const env = await createEnv();
    await env.selectGrade("2eme-kyo");
    env.start("Tachi waza");
    const total2 = env.run("total");
    env.home();
    await env.selectGrade("1er-kyo");
    env.start("Tachi waza");
    assert.ok(env.run("total") > total2);
  });
});

describe("pool et pondération", () => {
  test("une entrée par forme, poids 1 / 1.5 / 2.25 selon les marqueurs", async () => {
    const env = await createEnv();
    env.run(`data = { waza: { "Tachi waza": [{ nom: "A", techniques: [
      { nom: "Normal", formes: [] },
      { nom: "Nouveau", formes: ["Omote", "Ura"], nouveau: true },
      { nom: "Attention", formes: [], attention: true },
      { nom: "Les deux", formes: [], nouveau: true, attention: true }
    ] }] } }`);
    const pool = JSON.parse(env.run(`JSON.stringify(buildPool("Tachi waza").map(i => [i.t.nom, i.forme, i.poids]))`));
    assert.deepEqual(pool, [
      ["Normal", null, 1],
      ["Nouveau", "Omote", 1.5],
      ["Nouveau", "Ura", 1.5],
      ["Attention", null, 1.5],
      ["Les deux", null, 2.25],
    ]);
  });

  test("filtres : Nouveautés, Attention, ou les deux (OU)", async () => {
    const env = await createEnv();
    env.run(`data = { waza: { "Tachi waza": [{ nom: "A", techniques: [
      { nom: "Normal", formes: [] },
      { nom: "N", formes: [], nouveau: true },
      { nom: "A", formes: [], attention: true }
    ] }] } }`);
    const names = () => JSON.parse(env.run(`JSON.stringify(buildPool("Tachi waza").map(i => i.t.nom))`));
    assert.deepEqual(names(), ["Normal", "N", "A"]);
    env.setFilters({ nouveau: true });
    assert.deepEqual(names(), ["N"]);
    env.setFilters({ attention: true });
    assert.deepEqual(names(), ["A"]);
    env.setFilters({ nouveau: true, attention: true });
    assert.deepEqual(names(), ["N", "A"]);
  });

  test("pick() respecte les poids", async () => {
    let r = 0;
    const env = await createEnv({ random: () => r });
    const pick = () => {
      env.run(`pool = [{ id: "a", poids: 1 }, { id: "b", poids: 2.25 }]`);
      return env.run("pick().id");
    };
    r = 0.3; // 0.3 * 3.25 = 0.975 <= 1
    assert.equal(pick(), "a");
    r = 0.31; // 1.0075 > 1
    assert.equal(pick(), "b");
    r = 0.9999;
    assert.equal(pick(), "b");
  });
});

describe("session de tirage", () => {
  test("affiche waza, attaque, technique, forme, badges, note et vidéo", async () => {
    const env = await createEnv();
    env.run(`data = { waza: { "Tachi waza": [{ nom: "Katate dori", techniques: [
      { nom: "Nikkyo", formes: ["Ura"], nouveau: true, attention: true, note: "Naname", video: "https://v" }
    ] }] } }`);
    env.start("Tachi waza");
    const c = env.card();
    assert.equal(c.waza, "Tachi waza");
    assert.equal(c.attaque, "Katate dori");
    assert.equal(c.technique, "Nikkyo");
    assert.equal(c.forme, "Ura");
    assert.equal(c.badges, "🆕 ⚠️");
    assert.equal(c.note, "Naname");
    assert.equal(c.video.hidden, false);
    assert.equal(c.video.href, "https://v");
    assert.equal(env.el("home").hidden, true);
    assert.equal(env.el("draw").hidden, false);
  });

  test("lien vidéo masqué et champs vides sans vidéo, forme ni note", async () => {
    const env = await createEnv();
    env.run(`data = { waza: { "Tachi waza": [{ nom: "A", techniques: [{ nom: "Irimi nage", formes: [] }] }] } }`);
    env.start("Tachi waza");
    const c = env.card();
    assert.equal(c.video.hidden, true);
    assert.equal(c.forme, "");
    assert.equal(c.note, "");
    assert.equal(c.badges, "");
  });

  test("aucune répétition : chaque combinaison sort une seule fois puis « terminé »", async () => {
    const env = await createEnv();
    await env.selectGrade("2eme-kyo");
    env.start("Suwari waza");
    const total = env.run("total");
    assert.equal(total, 20);
    const seen = [cardKey(env.card())];
    for (let i = 1; i < total; i++) {
      env.next();
      seen.push(cardKey(env.card()));
    }
    assert.equal(new Set(seen).size, total);
    assert.equal(env.el("progress").textContent, `Suwari waza : ${total} / ${total}`);
    env.next();
    assert.equal(env.el("done").hidden, false);
    assert.equal(env.el("card").hidden, true);
    assert.equal(env.el("next").hidden, true);
  });

  test("compteur de progression", async () => {
    const env = await createEnv();
    await env.selectGrade("2eme-kyo");
    env.start("Hanmi Handachi waza");
    assert.equal(env.el("progress").textContent, "Hanmi Handachi waza : 1 / 5");
    env.next();
    assert.equal(env.el("progress").textContent, "Hanmi Handachi waza : 2 / 5");
  });

  test("retour à l'accueil réinitialise la session", async () => {
    const env = await createEnv();
    await env.selectGrade("2eme-kyo");
    env.start("Hanmi Handachi waza");
    for (let i = 0; i < 5; i++) env.next();
    assert.equal(env.el("done").hidden, false);
    env.home();
    assert.equal(env.el("home").hidden, false);
    assert.equal(env.el("draw").hidden, true);
    assert.equal(env.run("pool.length"), 0);
    env.start("Hanmi Handachi waza");
    assert.equal(env.el("done").hidden, true);
    assert.equal(env.el("card").hidden, false);
    assert.equal(env.run("pool.length"), 4);
  });

  test("les filtres sont appliqués au pool de la session", async () => {
    const env = await createEnv();
    await env.selectGrade("2eme-kyo");
    env.setFilters({ nouveau: true });
    env.start("Tachi waza");
    const total = env.run("total");
    const keys = new Set();
    for (let i = 0; i < total; i++) {
      assert.match(env.card().badges, /🆕/);
      keys.add(cardKey(env.card()));
      env.next();
    }
    assert.equal(keys.size, total);
  });
});

// ---------- Cache-busting et version ----------
describe("version", () => {
  const html = fs.readFileSync(path.join(ROOT, "index.html"), "utf8");
  const doc = fs.readFileSync(path.join(ROOT, "CLAUDE.md"), "utf8");

  test("CSS et JS portent le même numéro de version que CLAUDE.md", () => {
    const css = html.match(/style\.css\?v=([\w.]+)/)?.[1];
    const js = html.match(/app\.js\?v=([\w.]+)/)?.[1];
    const documented = doc.match(/Version actuelle : `([\w.]+)`/)?.[1];
    assert.ok(css && js && documented, "version manquante");
    assert.equal(css, js);
    assert.equal(css, documented);
    assert.match(css, /^\d{8}(\.\d+)?$/);
  });
});
