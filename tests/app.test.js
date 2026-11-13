import { test, describe } from "node:test";
import assert from "node:assert/strict";
import { createApp, readJson, resolveGrade, WAZA, keysOf, parentsOf, byId, find, text } from "./helpers.js";
import { buildPool, pickIndex, mergeGrades, listAttaques, listTechniques, findSameTechnique, countTechniques } from "../src/logic.js";
import { h } from "../src/vdom.js";
import { update, init } from "../src/update.js";
import { resolveGrade as resolveGradeFx } from "../src/effects.js";

const DATA = {
  waza: {
    "Tachi waza": [
      { nom: "Katate dori", order: 2, techniques: [
        { nom: "Nikkyo", order: 2, formes: ["Omote", "Ura"], nouveau: true, attention: false, note: "N", video: "https://v" },
        { nom: "Kote gaeshi", order: 10, formes: [] },
      ] },
      { nom: "Ryote dori", order: 3, techniques: [{ nom: "nikkyo", order: 2, formes: [], attention: true }, { nom: "Sankyo", order: 3, formes: [] }] },
      { nom: "Aï hammi katate dori", order: 1, techniques: [{ nom: "Sankyo", order: 3, formes: [] }] },
    ],
    "Suwari waza": [],
  },
};
const ALL = { nouveau: false, attention: false };

describe("logic", () => {
  test("pool : une entrée par forme, poids 1 / 1.5 / 2.25", () => {
    const pool = buildPool(DATA, "Tachi waza", ALL);
    assert.equal(pool.length, 6);
    const w = (t, f) => pool.find((e) => e.t.nom === t && e.forme === f).poids;
    assert.equal(w("Nikkyo", "Omote"), 1.5);
    assert.equal(pool.find((e) => e.t.nom === "Kote gaeshi").poids, 1);
    assert.equal(pool.find((e) => e.t.nom === "nikkyo").poids, 1.5);
  });

  test("filtres : Nouveautés, Attention, ou les deux (OU)", () => {
    const n = (f) => buildPool(DATA, "Tachi waza", f).length;
    assert.equal(n({ nouveau: true, attention: false }), 2);
    assert.equal(n({ nouveau: false, attention: true }), 1);
    assert.equal(n({ nouveau: true, attention: true }), 3);
  });

  test("pickIndex respecte les poids", () => {
    const pool = [{ poids: 1 }, { poids: 3 }];
    assert.equal(pickIndex(pool, 0), 0);
    assert.equal(pickIndex(pool, 0.24), 0);
    assert.equal(pickIndex(pool, 0.26), 1);
    assert.equal(pickIndex(pool, 0.999), 1);
  });

  test("tri par order puis alphabétique ; même technique sans casse ni accents", () => {
    assert.deepEqual(listAttaques(DATA, "Tachi waza").map((a) => a.nom), ["Aï hammi katate dori", "Katate dori", "Ryote dori"]);
    assert.deepEqual(listTechniques(DATA, "Tachi waza", "Ryote dori").map((t) => t.nom), ["nikkyo", "Sankyo"]);
    assert.deepEqual(findSameTechnique(DATA, "Tachi waza", "Katate dori", "Nikkyo").map((o) => o.attaque), ["Ryote dori"]);
  });

  test("héritage : compteurs 167 / 108 / 65 et 1er ⊇ 2ème ⊇ 3ème", () => {
    assert.deepEqual(["1er-kyo", "2eme-kyo", "3eme-kyo"].map((g) => countTechniques(resolveGrade(g))), [167, 108, 65]);
    const k1 = new Set(keysOf(resolveGrade("1er-kyo")));
    for (const k of keysOf(resolveGrade("2eme-kyo"))) assert.ok(k1.has(k), k);
    assert.ok(keysOf(parentsOf("2eme-kyo")).length === 65);
  });

  test("mergeGrades ne modifie pas la base", () => {
    const base = structuredClone(DATA);
    mergeGrades(base, { waza: { "Tachi waza": [{ nom: "Katate dori", techniques: [{ nom: "Nikkyo", formes: ["X"] }] }] } });
    assert.deepEqual(base, DATA);
  });
});

describe("update (pure)", () => {
  test("Rolled est ignoré hors tirage", () => {
    const [m] = init();
    const [m2, cmds] = update(m, { type: "Rolled", value: 0.5 });
    assert.equal(m2.current ?? null, m.current ?? null);
    assert.deepEqual(cmds, []);
  });
});

describe("vdom", () => {
  test("h() normalise enfants (null/false ignorés, tableaux aplatis)", () => {
    const n = h("div", { id: "x" }, "a", null, false, [h("b", {}, "c")], 3);
    assert.equal(n.children.length, 3);
    assert.equal(text(n), "ac3");
  });
});

describe("effects.resolveGrade", () => {
  test("fusionne les parents puis le grade", async () => {
    const grades = readJson("data/grades.json");
    const d = await resolveGradeFx(grades.find((g) => g.id === "2eme-kyo"), async (u) => readJson(u));
    assert.equal(countTechniques(d), 108);
  });
});

describe("application", () => {
  test("accueil : grades, waza actifs, programme caché", async () => {
    const app = await createApp();
    assert.equal(app.model.screen, "home");
    assert.equal(find(app.tree, (n) => n.tag === "option").length, 3);
    for (const w of WAZA) assert.equal(app.button(w).props.disabled, false);
  });

  test("filtre Attention désactive un waza sans technique correspondante", async () => {
    const app = await createApp();
    app.load(DATA);
    app.setFilter("f-attention", true);
    assert.equal(app.button("Tachi waza").props.disabled, false);
    assert.equal(app.button("Suwari waza").props.disabled, true);
    assert.equal(app.button("Hanmi Handachi waza").props.disabled, true);
    assert.match(app.text("home-msg"), /grisé/);
  });

  test("changer de grade recharge les données fusionnées", async () => {
    const app = await createApp();
    const n1 = app.model.total ?? 0;
    await app.selectGrade("3eme-kyo");
    assert.equal(app.model.gradeId, "3eme-kyo");
    assert.equal(countTechniques(app.model.data), 65);
    assert.ok(n1 >= 0);
  });

  test("tirage : carte complète, vidéo, progression", async () => {
    const app = await createApp({ random: () => 0 });
    app.load({ waza: { "Tachi waza": [{ nom: "Katate dori", order: 1, techniques: [{ nom: "Nikkyo", order: 2, formes: ["Ura"], nouveau: true, attention: true, note: "N", video: "https://v" }] }] } });
    app.click("Tachi waza");
    const c = app.card();
    assert.deepEqual([c.waza, c.attaque, c.technique, c.forme, c.note], ["Tachi waza", "Katate dori", "Nikkyo", "Ura", "N"]);
    assert.equal(c.video.props.href, "https://v");
    assert.match(c.badges, /🆕/);
    assert.match(c.badges, /⚠️/);
    assert.equal(app.text("progress"), "Tachi waza : 1 / 1");
  });

  test("sans vidéo : lien absent, champs vides conservés", async () => {
    const app = await createApp({ random: () => 0 });
    app.load({ waza: { "Tachi waza": [{ nom: "A", order: 1, techniques: [{ nom: "Ikkyo", order: 1, formes: [] }] }] } });
    app.click("Tachi waza");
    const c = app.card();
    assert.equal(c.video, undefined);
    assert.equal(c.forme, "");
    assert.equal(c.note, "");
  });

  test("aucune répétition puis « terminé »", async () => {
    const app = await createApp();
    app.load(DATA);
    app.click("Tachi waza");
    const total = app.model.total;
    const seen = new Set();
    const key = () => Object.values(app.card()).slice(0, 4).join("|");
    seen.add(key());
    for (let i = 1; i < total; i++) {
      app.click("next");
      seen.add(key());
    }
    assert.equal(seen.size, total);
    assert.equal(app.text("progress"), `Tachi waza : ${total} / ${total}`);
    app.click("next");
    assert.ok(byId(app.tree, "done"));
    assert.equal(app.button("Technique suivante"), undefined);
  });

  test("retour accueil réinitialise ; filtres appliqués au pool", async () => {
    const app = await createApp();
    app.load(DATA);
    app.setFilter("f-nouveau", true);
    app.click("Tachi waza");
    assert.equal(app.model.total, 2);
    app.click("home-btn");
    assert.equal(app.model.screen, "home");
    app.click("Tachi waza");
    assert.equal(app.model.pool.length, app.model.total - 1);
  });
});

describe("programme", () => {
  async function open() {
    const app = await createApp({ random: () => 0 });
    app.load(DATA);
    app.click("Tachi waza");
    const before = app.model.pool.length;
    app.click("prog-btn");
    return { app, before };
  }

  test("attaques triées, session intacte", async () => {
    const { app, before } = await open();
    assert.deepEqual(app.list(), ["Aï hammi katate dori", "Katate dori", "Ryote dori"]);
    assert.equal(app.model.pool.length, before);
  });

  test("attaque → techniques avec badges, triées", async () => {
    const { app } = await open();
    app.click("Katate dori");
    assert.equal(app.text("prog-sub"), "2 techniques");
    assert.match(app.list()[0], /^Nikkyo 🆕/);
    assert.match(app.list()[1], /^Kote gaeshi/);
  });

  test("technique : carte et autres attaques ; unique → message", async () => {
    const { app } = await open();
    app.click("Katate dori");
    app.click("Nikkyo");
    assert.equal(app.text("prog-technique"), "Nikkyo");
    assert.match(app.list()[0], /^Ryote dori/);
    app.click(app.list()[0]);
    assert.equal(app.text("prog-attaque"), "Ryote dori");
    app.click("prog-back");
    app.click("prog-back");
    app.click("Kote gaeshi");
    assert.deepEqual(app.list(), []);
    assert.match(app.text("prog-sub"), /Aucune autre attaque/);
  });

  test("bouton retour : remonte d'un niveau puis revient au tirage", async () => {
    const { app } = await open();
    app.click("Katate dori");
    app.click("Nikkyo");
    app.click("prog-back");
    assert.equal(app.model.program.niveau, 2);
    app.click("prog-back");
    assert.equal(app.model.program.niveau, 1);
    app.click("prog-back");
    assert.equal(app.model.screen, "draw");
    assert.ok(byId(app.tree, "card"));
  });
});
