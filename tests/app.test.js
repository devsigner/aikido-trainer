// tests/app.test.js

import { test, describe } from "node:test";
import assert from "node:assert/strict";
import { createApp, settle, readJson, resolveGrade, WAZA, keysOf, parentsOf, byId, find, text } from "./helpers.js";
import { buildPool, buildFullPool, pickIndex, mergeGrades, markNew, listAttacks, listTechniques, findSameTechnique, countTechniques } from "../src/shared/logic.js";
import { h } from "../framework/elmer/vdom.js";
import { parseHash, toHash } from "../src/features/navigation.js";
import { update, init, initialModel, debugHide } from "../src/update.js";
import { view } from "../src/view.js";
import { summarize, diffModels } from "../framework/elmer/debug/inspect.js";
import { to } from "../framework/elmer/feature.js";
import { gradeData } from "../src/shared/grades.js";
import { screenOf } from "../src/shared/screen.js";
import { resolveGrade as resolveGradeFx } from "../src/features/catalog.js";

const DATA = {
  waza: {
    "Tachi waza": [
      { name: "Katate dori", order: 2, techniques: [
        { name: "Nikkyo", order: 2, forms: ["Omote", "Ura"], isNew: true, note: "N", video: "https://v" },
        { name: "Kote gaeshi", order: 10, forms: [] },
      ] },
      { name: "Ryote dori", order: 3, techniques: [{ name: "nikkyo", order: 2, forms: [], isNew: true }, { name: "Sankyo", order: 3, forms: [] }] },
      { name: "Aï hammi katate dori", order: 1, techniques: [{ name: "Sankyo", order: 3, forms: [] }] },
    ],
    "Suwari waza": [],
  },
};
const ALL = { isNew: false };
const walkIds = (node, ids) => {
  if (typeof node === "string") return;
  if (node.props.id) ids.push(node.props.id);
  node.children.forEach((child) => walkIds(child, ids));
};

describe("logic", () => {
  test("pool: one entry per form, weights 1 / 1.5 / 2.25", () => {
    const pool = buildPool(DATA, "Tachi waza", ALL);
    assert.equal(pool.length, 6);
    const weightOf = (name, form) => pool.find((entry) => entry.technique === name && entry.form === form).weight;
    assert.equal(weightOf("Nikkyo", "Omote"), 1.5);
    assert.equal(pool.find((entry) => entry.technique === "Kote gaeshi").weight, 1);
    assert.equal(pool.find((entry) => entry.technique === "nikkyo").weight, 1.5);
  });

  test("full pool: every waza, each entry knows its waza", () => {
    const data = { waza: { ...DATA.waza, "Suwari waza": [{ name: "A", order: 1, techniques: [{ name: "Ikkyo", order: 1, forms: [] }] }] } };
    const pool = buildFullPool(data, ALL);
    assert.equal(pool.length, 7);
    assert.deepEqual([...new Set(pool.map((entry) => entry.waza))], ["Tachi waza", "Suwari waza"]);
  });

  test("full pool: only the selected waza", () => {
    const data = { waza: { ...DATA.waza, "Suwari waza": [{ name: "A", order: 1, techniques: [{ name: "Ikkyo", order: 1, forms: [], isNew: true }] }] } };
    assert.deepEqual([...new Set(buildFullPool(data, { ...ALL, waza: ["Suwari waza"] }).map((entry) => entry.waza))], ["Suwari waza"]);
    assert.equal(buildFullPool(data, { isNew: true, waza: ["Tachi waza", "Suwari waza"] }).length, 4, "waza AND marker");
  });

  test("filter: New only, or everything", () => {
    const countFor = (filters) => buildPool(DATA, "Tachi waza", filters).length;
    assert.equal(countFor({ isNew: true }), 3);
    assert.equal(countFor({ isNew: false }), 6);
  });

  test("pickIndex respects the weights", () => {
    const pool = [{ weight: 1 }, { weight: 3 }];
    assert.equal(pickIndex(pool, 0), 0);
    assert.equal(pickIndex(pool, 0.24), 0);
    assert.equal(pickIndex(pool, 0.26), 1);
    assert.equal(pickIndex(pool, 0.999), 1);
  });

  test("sorted by order then alphabetically; same technique ignoring case and accents", () => {
    assert.deepEqual(listAttacks(DATA, "Tachi waza").map((attack) => attack.name), ["Aï hammi katate dori", "Katate dori", "Ryote dori"]);
    assert.deepEqual(listTechniques(DATA, "Tachi waza", "Ryote dori").map((technique) => technique.name), ["nikkyo", "Sankyo"]);
    assert.deepEqual(findSameTechnique(DATA, "Tachi waza", "Katate dori", "Nikkyo").map((other) => other.attack), ["Ryote dori"]);
  });

  test("inheritance: counts 167 / 108 / 65 and 1st ⊇ 2nd ⊇ 3rd", () => {
    assert.deepEqual(["1er-kyo", "2eme-kyo", "3eme-kyo"].map((grade) => countTechniques(resolveGrade(grade))), [167, 108, 65]);
    const firstKyoKeys = new Set(keysOf(resolveGrade("1er-kyo")));
    for (const key of keysOf(resolveGrade("2eme-kyo"))) assert.ok(firstKyoKeys.has(key), key);
    assert.ok(keysOf(parentsOf("2eme-kyo")).length === 65);
  });

  test("mergeGrades does not mutate the base", () => {
    const base = structuredClone(DATA);
    mergeGrades(base, { waza: { "Tachi waza": [{ name: "Katate dori", techniques: [{ name: "Nikkyo", forms: ["X"] }] }] } });
    assert.deepEqual(base, DATA);
  });
});

describe("update (pure)", () => {
  test("Rolled of another session is ignored", async () => {
    const app = await createApp({ random: () => 0 });
    app.load(DATA);
    const before = app.model.quiz;
    app.dispatch(to("quiz", { type: "Rolled", value: 0.5, session: before.session - 1 }));
    assert.equal(app.model.quiz, before);
  });
});

describe("vdom", () => {
  test("h() normalizes children (null/false ignored, arrays flattened)", () => {
    const node = h("div", { id: "x" }, "a", null, false, [h("b", {}, "c")], 3);
    assert.equal(node.children.length, 3);
    assert.equal(text(node), "ac3");
  });
});

describe("isNew is computed", () => {
  const isNew = (data) => data.waza["Tachi waza"].find((attack) => attack.name === "Katate dori").techniques.find((technique) => technique.name === "Sankyo").isNew;

  test("only the techniques absent from the lower grades are new", () => {
    const data = { waza: { "Tachi waza": [{ name: "Katate dori", techniques: [{ name: "Sankyo" }, { name: "Nikkyo" }] }] } };
    const lower = { waza: { "Tachi waza": [{ name: "Katate dori", techniques: [{ name: "Nikkyo" }] }] } };
    assert.deepEqual(markNew(data, lower).waza["Tachi waza"][0].techniques.map((technique) => technique.isNew), [true, false]);
    assert.deepEqual(markNew(data, null).waza["Tachi waza"][0].techniques.map((technique) => technique.isNew), [false, false], "lowest grade: nothing is new");
  });

  test("Sankyo (Tachi, Katate dori) is new in the 2nd Kyo only", () => {
    assert.equal(isNew(resolveGrade("2eme-kyo")), true);
    assert.equal(isNew(resolveGrade("1er-kyo")), false);
    assert.equal(resolveGrade("3eme-kyo").waza["Tachi waza"].flatMap((attack) => attack.techniques).some((technique) => technique.isNew), false);
  });

  test("the data files carry no isNew key", () => {
    for (const id of ["1er-kyo", "2eme-kyo", "3eme-kyo"]) assert.doesNotMatch(JSON.stringify(readJson(`data/${id}.json`)), /isNew/);
  });
});

describe("resolveGrade", () => {
  test("merges the parents then the grade", async () => {
    const grades = readJson("data/grades.json");
    const data = await resolveGradeFx(grades.find((grade) => grade.id === "2eme-kyo"), async (url) => readJson(url));
    assert.equal(countTechniques(data), 108);
    assert.equal(data.waza["Tachi waza"].flatMap((attack) => attack.techniques).filter((technique) => technique.isNew).length > 0, true);
  });
});

describe("application", () => {
  test("home: grades, program button, and a technique already drawn", async () => {
    const app = await createApp();
    assert.equal(screenOf(app.model), "home");
    assert.equal(app.byId("grade").children.length, 3);
    assert.ok(app.button("Programme"));
    assert.equal(app.button("Tachi waza"), undefined, "no waza choice on the home screen");
    assert.ok(WAZA.includes(app.card().waza));
    assert.equal(app.model.quiz.total - app.model.quiz.pool.length, 1);
  });

  test("the program button sits right under the grade select, before the filters", async () => {
    const app = await createApp();
    const ids = [];
    walkIds(app.tree, ids);
    const position = (id) => ids.indexOf(id);
    assert.ok(position("grade") >= 0 && position("grade") < position("prog-btn"));
    assert.ok(position("prog-btn") < position("f-new") && position("f-new") < position("quiz"));
  });

  test("filters restart the session on the filtered pool", async () => {
    const app = await createApp({ random: () => 0 });
    app.load(DATA);
    assert.equal(app.model.quiz.total, 6);
    app.setFilter("f-new", true);
    assert.equal(app.model.quiz.total, 3);
    assert.equal(app.card().technique, "Nikkyo");
    app.setFilter("f-new", false);
    assert.equal(app.model.quiz.total, 6);
    assert.equal(app.model.quiz.total - app.model.quiz.pool.length, 1);
  });

  test("waza filter: a select, restarts the session on that waza; empty value = all", async () => {
    const app = await createApp({ random: () => 0 });
    app.load({ waza: {
      "Tachi waza": [{ name: "A", order: 1, techniques: [{ name: "Ikkyo", order: 1, forms: [] }] }],
      "Suwari waza": [{ name: "B", order: 1, techniques: [{ name: "Nikkyo", order: 1, forms: [] }] }],
    } });
    assert.equal(app.model.quiz.total, 2);
    app.fire(app.byId("f-waza"), { target: { value: "Suwari waza" } });
    assert.equal(app.model.quiz.total, 1);
    assert.equal(app.card().waza, "Suwari waza");
    app.fire(app.byId("f-waza"), { target: { value: "" } });
    assert.equal(app.model.quiz.total, 2);
  });

  test("filters with no technique: message, no next button", async () => {
    const app = await createApp({ random: () => 0 });
    app.load({ waza: { "Tachi waza": [{ name: "A", order: 1, techniques: [{ name: "Ikkyo", order: 1, forms: [] }] }] } });
    app.setFilter("f-new", true);
    assert.equal(app.model.quiz.total, 0);
    assert.match(app.text("empty"), /Aucune technique/);
    assert.equal(app.byId("next"), undefined);
  });

  test("changing grade reloads the merged data", async () => {
    const app = await createApp();
    const n1 = app.model.quiz?.total ?? 0;
    await app.selectGrade("3eme-kyo");
    assert.equal(app.model.catalog.id, "3eme-kyo");
    assert.equal(countTechniques(gradeData(app.model)), 65);
    assert.equal("data" in app.model.catalog, false);
    assert.ok(app.model.quiz.current, "a new session is drawn for the new grade");
    assert.ok(n1 >= 0);
  });

  test("quiz: full card, video, progress", async () => {
    const app = await createApp({ random: () => 0 });
    app.load({ waza: { "Tachi waza": [{ name: "Katate dori", order: 1, techniques: [{ name: "Nikkyo", order: 2, forms: ["Ura"], isNew: true, note: "N", video: "https://v" }] }] } });
    const card = app.card();
    assert.deepEqual([card.waza, card.attack, card.technique, card.form, card.note], ["Tachi waza", "Katate dori", "Nikkyo", "Ura", "N"]);
    assert.equal(card.video.props.href, "https://v");
    assert.match(card.badges, /🆕/);
    assert.equal(app.text("progress"), "1 / 1");
  });

  test("no video: link absent, empty fields kept", async () => {
    const app = await createApp({ random: () => 0 });
    app.load({ waza: { "Tachi waza": [{ name: "A", order: 1, techniques: [{ name: "Ikkyo", order: 1, forms: [] }] }] } });
    const card = app.card();
    assert.equal(card.video, undefined);
    assert.equal(card.form, "");
    assert.equal(card.note, "");
  });

  test("no repetition, then done", async () => {
    const app = await createApp();
    app.load(DATA);
    const total = app.model.quiz.total;
    const seen = new Set();
    const key = () => Object.values(app.card()).slice(0, 4).join("|");
    seen.add(key());
    for (let i = 1; i < total; i++) {
      app.click("next");
      seen.add(key());
    }
    assert.equal(seen.size, total);
    assert.equal(app.text("progress"), `${total} / ${total}`);
    app.click("next");
    assert.ok(byId(app.tree, "done"));
    assert.equal(app.button("Technique suivante"), undefined);
  });

  test("the draw covers every waza, without repetition", async () => {
    const app = await createApp();
    app.load({ waza: {
      "Tachi waza": [{ name: "A", order: 1, techniques: [{ name: "Ikkyo", order: 1, forms: [] }] }],
      "Suwari waza": [{ name: "B", order: 1, techniques: [{ name: "Nikkyo", order: 1, forms: [] }] }],
    } });
    const wazas = new Set([app.card().waza]);
    app.click("next");
    wazas.add(app.card().waza);
    assert.deepEqual([...wazas].sort(), ["Suwari waza", "Tachi waza"]);
  });
});

describe("program", () => {
  async function open() {
    const app = await createApp({ random: () => 0 });
    app.load(DATA);
    app.click("prog-btn");
    app.click("Tachi waza");
    return { app };
  }

  test("first step: the waza, one without attack is disabled; the session is kept", async () => {
    const app = await createApp({ random: () => 0 });
    app.load(DATA);
    const quiz = app.model.quiz;
    app.click("prog-btn");
    assert.deepEqual(app.list(), ["Tachi waza", "Hanmi Handachi waza", "Suwari waza"]);
    assert.deepEqual(app.byId("prog-list").children.map((button) => button.props.disabled), [false, true, true]);
    assert.equal(app.byId("prog-back"), undefined);
    assert.equal(app.model.quiz, quiz);
  });

  test("the (i) button of the quiz card opens the technique in the program; the session is kept", async () => {
    const app = await createApp({ random: () => 0 });
    app.load(DATA);
    const quiz = app.model.quiz;
    const { waza, attack, technique } = quiz.current;
    app.click("card-info");
    assert.deepEqual(app.model.program.current, { level: 3, waza, attack, technique });
    assert.equal(app.model.quiz, quiz);
  });

  test("attacks of the waza, sorted", async () => {
    const { app } = await open();
    assert.deepEqual(app.list(), ["Aï hammi katate dori", "Katate dori", "Ryote dori"]);
    assert.equal(app.model.program.current.waza, "Tachi waza");
  });

  test("attack → techniques with badges, sorted", async () => {
    const { app } = await open();
    app.click("Katate dori");
    assert.equal(app.text("prog-sub"), "2 techniques");
    assert.match(app.list()[0], /^Nikkyo 🆕/);
    assert.match(app.list()[1], /^Kote gaeshi/);
  });

  test("technique: card and other attacks; unique → message", async () => {
    const { app } = await open();
    app.click("Katate dori");
    app.click("Nikkyo");
    assert.equal(app.text("prog-technique"), "Nikkyo");
    assert.match(app.list()[0], /^Ryote dori/);
    app.click(app.list()[0]);
    assert.equal(app.text("prog-attack"), "Ryote dori");
    app.click("prog-back");
    app.click("prog-back");
    app.click("Katate dori");
    app.click("Kote gaeshi");
    assert.deepEqual(app.list(), []);
    assert.match(app.text("prog-sub"), /Aucune autre attaque/);
  });

  test("next button: next technique of the same attack, wrapping to the first one", async () => {
    const { app } = await open();
    app.click("Katate dori");
    app.click("Nikkyo");
    assert.equal(app.byId("prog-next").props.disabled, false);
    app.click("prog-next");
    assert.equal(app.text("prog-technique"), "Kote gaeshi");
    assert.equal(app.text("prog-attack"), "Katate dori");
    app.click("prog-next");
    assert.equal(app.text("prog-technique"), "Nikkyo");
    app.click("prog-prev");
    assert.equal(app.text("prog-technique"), "Kote gaeshi");
    assert.equal(app.model.slide.direction, "back");
    app.click("prog-prev");
    assert.equal(app.text("prog-technique"), "Nikkyo");
    app.click("prog-back");
    assert.equal(app.model.program.current.level, 2);
    assert.equal(app.model.program.current.attack, "Katate dori");
  });

  test("level 2 back button always lists the attacks, even after other navigation", async () => {
    const { app } = await open();
    app.click("Katate dori");
    app.click("Nikkyo");
    app.click("prog-back");
    assert.equal(app.model.program.current.level, 2);
    app.click("prog-back");
    assert.equal(app.model.program.current.level, 1);
    assert.equal(app.model.slide.direction, "back");
  });

  test("back button: goes up one level up to the waza, then the home button returns to the same quiz", async () => {
    const { app } = await open();
    app.click("Katate dori");
    app.click("Nikkyo");
    app.click("prog-back");
    assert.equal(app.model.program.current.level, 2);
    app.click("prog-back");
    assert.equal(app.model.program.current.level, 1);
    app.click("prog-back");
    assert.equal(app.model.program.current.level, 0);
    const quiz = app.model.quiz;
    app.click("home-btn");
    assert.equal(screenOf(app.model), "home");
    assert.equal(app.model.quiz, quiz);
    assert.ok(byId(app.tree, "card"));
  });

  test("slide direction: in-app back slides back, browser back and forward follow the history", async () => {
    const { app } = await open();
    app.click("Katate dori");
    app.click("Nikkyo");
    app.click(app.list()[0]);
    assert.equal(app.model.slide.direction, "forward");
    app.click("prog-back");
    assert.equal(app.model.program.current.level, 2);
    assert.equal(app.model.slide.direction, "back");
    app.history.back();
    assert.equal(app.model.program.current.level, 3);
    assert.equal(app.model.slide.direction, "back");
    app.history.forward();
    assert.equal(app.model.program.current.level, 2);
    assert.equal(app.model.slide.direction, "forward");
  });
});

describe("URL and history", () => {
  test("parseHash / toHash: round trip, accents and spaces encoded", () => {
    const model = { catalog: { id: "2eme-kyo" }, program: { current: { level: 3, waza: "Tachi waza", attack: "Aï hammi katate dori", technique: "Nikkyo" } } };
    assert.equal(toHash(model), "#/2eme-kyo/program/Tachi%20waza/A%C3%AF%20hammi%20katate%20dori/Nikkyo");
    assert.deepEqual(parseHash(toHash(model)), { grade: "2eme-kyo", program: { level: 3, waza: "Tachi waza", attack: "Aï hammi katate dori", technique: "Nikkyo" } });
    assert.equal(toHash({ catalog: { id: "2eme-kyo" }, program: { current: { level: 0 } } }), "#/2eme-kyo/program");
    assert.equal(parseHash("#/2eme-kyo/program").program.level, 0);
    assert.deepEqual(parseHash("#/2eme-kyo"), { grade: "2eme-kyo", program: null });
    assert.deepEqual(parseHash("#/%E0%A4%A"), {});
  });

  test("the URL follows navigation: home, program, back", async () => {
    const app = await createApp();
    assert.equal(app.history.url, "#/1er-kyo");
    app.click("prog-btn");
    assert.equal(app.history.url, "#/1er-kyo/program");
    app.click("Tachi waza");
    assert.equal(app.history.url, "#/1er-kyo/program/Tachi%20waza");
    app.click(app.list()[0]);
    assert.match(app.history.url, /\/program\/Tachi%20waza\/A%C3%AF%20hammi%20katate%20dori$/);
    app.click("prog-back");
    app.click("prog-back");
    assert.equal(app.history.url, "#/1er-kyo/program");
    app.click("home-btn");
    assert.equal(app.history.url, "#/1er-kyo");
  });

  test("changing grade updates the URL without a new history entry", async () => {
    const app = await createApp();
    await app.selectGrade("3eme-kyo");
    assert.equal(app.history.url, "#/3eme-kyo");
    assert.equal(app.history.index, 0);
  });

  test("reloading on a program URL restores the same state", async () => {
    const hash = "#/2eme-kyo/program/Suwari%20waza/Katate%20dori/Nikkyo";
    const app = await createApp({ hash });
    assert.deepEqual([app.model.catalog.id, app.model.program.current.waza, screenOf(app.model)], ["2eme-kyo", "Suwari waza", "program"]);
    assert.equal(app.model.program.current.technique, "Nikkyo");
    assert.equal(app.text("prog-technique"), "Nikkyo");
    assert.equal(app.history.url, hash);
    assert.ok(app.model.quiz.current, "the quiz runs behind the program");
  });

  test("an old URL with a waza falls back to the home of its grade", async () => {
    const app = await createApp({ hash: "#/3eme-kyo/Tachi%20waza" });
    assert.equal(screenOf(app.model), "home");
    assert.equal(app.model.catalog.id, "3eme-kyo");
    assert.ok(app.model.quiz.current);
    assert.equal(app.history.url, "#/3eme-kyo");
  });

  test("after reloading on the program, going back to the home shows the quiz", async () => {
    const app = await createApp({ hash: "#/1er-kyo/program/Tachi%20waza" });
    assert.equal(app.model.program.current.level, 1);
    app.dispatch(to("navigation", { type: "Popped", hash: "#/1er-kyo" }));
    assert.equal(screenOf(app.model), "home");
    assert.ok(app.model.quiz.current);
  });

  test("opening the program keeps the session: nothing is drawn again, nothing repeats", async () => {
    const app = await createApp({ random: () => 0 });
    app.load(DATA);
    app.click("next");
    const quiz = app.model.quiz;
    assert.equal(quiz.total - quiz.pool.length, 2);
    app.click("prog-btn");
    app.click("Tachi waza");
    app.click("home-btn");
    assert.equal(app.model.quiz, quiz);
    assert.equal(app.history.url, "#/t");
  });

  test("invalid URL: unknown grade → home, unknown waza → level 0, unknown attack → level 1", async () => {
    assert.equal(screenOf((await createApp({ hash: "#/xx/Foo" })).model), "home");
    const waza = await createApp({ hash: "#/1er-kyo/program/Foo" });
    assert.deepEqual(waza.model.program?.current, { level: 0 });
    assert.equal(waza.history.url, "#/1er-kyo/program");
    const app = await createApp({ hash: "#/1er-kyo/program/Tachi%20waza/Nimporte/Quoi" });
    assert.deepEqual(app.model.program?.current, { level: 1, waza: "Tachi waza" });
    assert.equal(app.history.url, "#/1er-kyo/program/Tachi%20waza");
  });

  test("popstate to another grade loads its data", async () => {
    const app = await createApp();
    app.dispatch(to("navigation", { type: "Popped", hash: "#/3eme-kyo/program/Tachi%20waza" }));
    await settle();
    assert.equal(app.model.catalog.id, "3eme-kyo");
    assert.equal(countTechniques(gradeData(app.model)), 65);
    assert.equal(screenOf(app.model), "program");
  });
});

describe("title and loading", () => {
  test("the program slice only exists while it is open; the quiz runs on the home", async () => {
    const app = await createApp({ random: () => 0 });
    app.load(DATA);
    const slices = () => ["quiz", "program"].filter((name) => name in app.model);
    assert.deepEqual(slices(), ["quiz"]);
    app.click("prog-btn");
    assert.deepEqual(slices(), ["quiz", "program"]);
    app.click("home-btn");
    assert.deepEqual(slices(), ["quiz"]);
  });

  test("the title goes home, and does nothing when already home", async () => {
    const app = await createApp({ random: () => 0 });
    app.load(DATA);
    const entries = app.history.states.length;
    app.fire(app.byId("title"));
    assert.equal(app.history.states.length, entries);
    app.click("prog-btn");
    app.fire(app.byId("title"));
    assert.equal(screenOf(app.model), "home");
    assert.equal(app.history.url, "#/t");
  });

  test("a spinner is displayed while loading", () => {
    const tree = view(initialModel());
    assert.ok(byId(tree, "loading"));
    assert.equal(find(tree, (node) => node.props.className === "spinner").length, 1);
  });
});

describe("card transitions", () => {
  async function open() {
    const app = await createApp({ random: () => 0 });
    app.load(DATA);
    return app;
  }

  test("the first card of a session does not slide, the next ones slide forward with a new key", async () => {
    const app = await open();
    const first = app.byId("card").props;
    assert.equal(first.className, "card");
    app.click("next");
    assert.equal(app.byId("card").props.className, "card slide-forward");
    assert.notEqual(app.byId("card").props.key, first.key);
  });

  test("program card: key changes with each navigation, class follows the direction", async () => {
    const app = await open();
    app.click("prog-btn");
    app.click("Tachi waza");
    app.click("Katate dori");
    const forward = app.byId("prog-card").props;
    assert.equal(forward.className, "card slide-forward");
    app.click("prog-back");
    const back = app.byId("prog-card").props;
    assert.equal(back.className, "card slide-back");
    assert.notEqual(back.key, forward.key);
  });

  test("an unchanged view does not restart the animation", async () => {
    const app = await open();
    app.click("prog-btn");
    app.click("Tachi waza");
    const { count } = app.model.slide;
    app.dispatch(to("navigation", { type: "Popped", hash: app.history.url }));
    assert.equal(app.model.slide.count, count);
  });

  test("a message can force the direction", () => {
    const [model] = init();
    const ready = { ...model, catalog: { ...model.catalog, status: "ready", data: DATA }, program: { current: { level: 3, waza: "Tachi waza", attack: "Katate dori", technique: "Nikkyo" } } };
    const [next] = update(ready, to("program", { type: "Navigate", to: { level: 3, waza: "Tachi waza", attack: "Katate dori", technique: "Kote gaeshi" }, direction: "back" }));
    assert.equal(next.slide.direction, "back");
  });
});

describe("history position", () => {
  test("push increments the position, replace keeps it, a pop restores it", async () => {
    const app = await createApp({ random: () => 0 });
    app.load(DATA);
    assert.equal(app.model.navigation.position, 0);
    app.click("prog-btn");
    app.click("Tachi waza");
    assert.equal(app.model.navigation.position, 2);
    app.history.back();
    assert.equal(app.model.navigation.position, 1);
    app.history.forward();
    assert.equal(app.model.navigation.position, 2);
  });

  test("Url commands carry the position; init restores it after a reload", () => {
    const [model] = init({ position: 3 });
    assert.equal(model.navigation.position, 3);
    const ready = { ...model, catalog: { ...model.catalog, status: "ready", data: DATA, list: [], id: "t" } };
    const [pushed, pushes] = update(ready, to("program", { type: "OpenProgram" }));
    const push = pushes.find((command) => command.type === "Url");
    assert.equal(pushed.navigation.position, 4);
    assert.deepEqual([push.type, push.mode, push.position], ["Url", "push", 4]);
    const [selected, commands] = update({ ...ready, catalog: { ...ready.catalog, list: [{ id: "t" }] } }, to("catalog", { type: "SelectGrade", id: "t" }));
    const replace = commands.find((command) => command.type === "Url");
    assert.deepEqual([replace.mode, replace.position, selected.navigation.position], ["replace", 3, 3]);
  });
});

describe("program buttons", () => {
  async function open() {
    const app = await createApp({ random: () => 0 });
    app.load(DATA);
    app.click("prog-btn");
    app.click("Tachi waza");
    return app;
  }

  test("each back button goes up exactly one level and slides back", async () => {
    const app = await open();
    app.click("Katate dori");
    app.click("Nikkyo");
    app.click("prog-next");
    app.click("prog-back");
    assert.deepEqual([app.model.program.current.level, app.model.program.current.attack], [2, "Katate dori"]);
    assert.equal(app.model.slide.direction, "back");
    app.click("prog-back");
    assert.equal(app.model.program.current.level, 1);
    app.click("prog-back");
    assert.equal(app.model.program.current.level, 0);
    assert.equal(app.history.url, "#/t/program");
    app.click("home-btn");
    assert.equal(screenOf(app.model), "home");
    assert.equal(app.history.url, "#/t");
  });

  test("pager: counter, previous and next wrap around, both slide in their direction", async () => {
    const app = await open();
    app.click("Katate dori");
    app.click("Nikkyo");
    assert.ok(find(app.tree, (node) => node.tag === "p" && text(node) === "1 / 2").length === 1);
    app.click("prog-prev");
    assert.equal(app.text("prog-technique"), "Kote gaeshi");
    assert.equal(app.model.slide.direction, "back");
    app.click("prog-next");
    assert.equal(app.text("prog-technique"), "Nikkyo");
    assert.equal(app.model.slide.direction, "forward");
  });

  test("pager: disabled when the attack has a single technique", async () => {
    const app = await open();
    app.click("Aï hammi katate dori");
    app.click("Sankyo");
    assert.equal(app.byId("prog-prev").props.disabled, true);
    assert.equal(app.byId("prog-next").props.disabled, true);
  });
});

describe("video confirmation", () => {
  const data = { waza: { "Tachi waza": [{ name: "A", order: 1, techniques: [{ name: "Ikkyo", order: 1, forms: [], video: "https://v" }] }] } };
  const setup = async (options = {}) => {
    const opened = [];
    const saved = [];
    const app = await createApp({ random: () => 0, open: (...args) => opened.push(args), storage: { setItem: (...args) => saved.push(args) }, ...options });
    app.load(data);
    return { app, opened, saved };
  };
  const clickVideo = (app) => {
    let prevented = false;
    app.fire({ props: { onClick: app.card().video.props.onClick } }, { preventDefault: () => (prevented = true) });
    return prevented;
  };

  test("the link asks for confirmation instead of opening the video", async () => {
    const { app, opened } = await setup();
    assert.equal(clickVideo(app), true);
    assert.match(app.text("video-modal-text"), /pas exactement celle attendue/);
    assert.equal(opened.length, 0);
  });

  test("cancel closes the modal without opening", async () => {
    const { app, opened } = await setup();
    clickVideo(app);
    app.click("video-cancel");
    assert.equal(app.byId("video-modal"), undefined);
    assert.equal(opened.length, 0);
  });

  test("confirm opens the video, and the preference is saved only when checked", async () => {
    const first = await setup();
    clickVideo(first.app);
    first.app.click("video-confirm");
    assert.deepEqual(first.opened, [["https://v", "_blank", "noopener"]]);
    assert.equal(first.saved.length, 0);
    assert.equal(first.app.byId("video-modal"), undefined);

    const second = await setup();
    clickVideo(second.app);
    second.app.setFilter("video-dont-ask", true);
    second.app.click("video-confirm");
    assert.deepEqual(second.saved, [["aikido.skipVideoWarning", "1"]]);
    assert.equal(second.app.card().video.props.onClick, undefined);
  });

  test("with the preference set, the link is a plain link", async () => {
    const { app } = await setup({ skipVideoWarning: true });
    assert.equal(app.card().video.props.onClick, undefined);
    assert.equal(app.card().video.props.href, "https://v");
  });
});

describe("debug mode", () => {
  test("summarize hides the bulky parts of the model", () => {
    const model = { ...initialModel(), pool: [1, 2, 3] };
    const summary = summarize(model, debugHide);
    assert.equal(summary.pool, "[...3 éléments]");
    assert.equal(summary.catalog.status, "loading");
  });

  test("diffModels lists only the changed fields", () => {
    const before = { ...initialModel(), waza: "", pool: [1, 2] };
    const after = { ...before, waza: "Tachi waza", pool: [1] };
    assert.deepEqual(diffModels(before, after, [], debugHide).map(({ key, from, to }) => [key, from, to]), [["waza", "", "Tachi waza"], ["pool", "[...2 éléments]", "[...1 éléments]"]]);
    assert.deepEqual(diffModels(before, before), []);
    assert.ok(diffModels(null, before).length > 0);
  });
});
