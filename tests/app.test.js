// tests/app.test.js

import { test, describe } from "node:test";
import assert from "node:assert/strict";
import { createApp, settle, readJson, resolveGrade, WAZA, keysOf, parentsOf, byId, find, text } from "./helpers.js";
import { buildPool, pickIndex, mergeGrades, listAttacks, listTechniques, findSameTechnique, countTechniques } from "../src/shared/logic.js";
import { h } from "../framework/elmer/vdom.js";
import { parseHash, toHash } from "../src/features/navigation.js";
import { update, init, initialModel, debugHide } from "../src/update.js";
import { view } from "../src/view.js";
import { summarize, diffModels, labelOf, panelUpdate, panelView, initialPanel } from "../framework/elmer/debug.js";
import { run } from "../framework/elmer/runtime.js";
import { to } from "../framework/elmer/feature.js";
import { screenOf } from "../src/shared/screen.js";
import { resolveGrade as resolveGradeFx } from "../src/features/catalog.js";

const DATA = {
  waza: {
    "Tachi waza": [
      { name: "Katate dori", order: 2, techniques: [
        { name: "Nikkyo", order: 2, forms: ["Omote", "Ura"], isNew: true, isWarning: false, note: "N", video: "https://v" },
        { name: "Kote gaeshi", order: 10, forms: [] },
      ] },
      { name: "Ryote dori", order: 3, techniques: [{ name: "nikkyo", order: 2, forms: [], isWarning: true }, { name: "Sankyo", order: 3, forms: [] }] },
      { name: "Aï hammi katate dori", order: 1, techniques: [{ name: "Sankyo", order: 3, forms: [] }] },
    ],
    "Suwari waza": [],
  },
};
const ALL = { isNew: false, isWarning: false };

describe("logic", () => {
  test("pool: one entry per form, weights 1 / 1.5 / 2.25", () => {
    const pool = buildPool(DATA, "Tachi waza", ALL);
    assert.equal(pool.length, 6);
    const weightOf = (name, form) => pool.find((entry) => entry.technique === name && entry.form === form).weight;
    assert.equal(weightOf("Nikkyo", "Omote"), 1.5);
    assert.equal(pool.find((entry) => entry.technique === "Kote gaeshi").weight, 1);
    assert.equal(pool.find((entry) => entry.technique === "nikkyo").weight, 1.5);
  });

  test("filters: New, Warning, or both (OR)", () => {
    const countFor = (filters) => buildPool(DATA, "Tachi waza", filters).length;
    assert.equal(countFor({ isNew: true, isWarning: false }), 2);
    assert.equal(countFor({ isNew: false, isWarning: true }), 1);
    assert.equal(countFor({ isNew: true, isWarning: true }), 3);
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
  test("Rolled is ignored outside a quiz", () => {
    const [model] = init();
    const [next, cmds] = update(model, to("quiz", { type: "Rolled", value: 0.5 }));
    assert.equal("quiz" in next, false, "the quiz feature stays unmounted");
    assert.deepEqual(cmds, []);
  });
});

describe("vdom", () => {
  test("h() normalizes children (null/false ignored, arrays flattened)", () => {
    const node = h("div", { id: "x" }, "a", null, false, [h("b", {}, "c")], 3);
    assert.equal(node.children.length, 3);
    assert.equal(text(node), "ac3");
  });
});

describe("resolveGrade", () => {
  test("merges the parents then the grade", async () => {
    const grades = readJson("data/grades.json");
    const data = await resolveGradeFx(grades.find((grade) => grade.id === "2eme-kyo"), async (url) => readJson(url));
    assert.equal(countTechniques(data), 108);
  });
});

describe("application", () => {
  test("home: grades, enabled waza buttons", async () => {
    const app = await createApp();
    assert.equal(screenOf(app.model), "home");
    assert.equal(find(app.tree, (node) => node.tag === "option").length, 3);
    for (const waza of WAZA) assert.equal(app.button(waza).props.disabled, false);
  });

  test("Warning filter disables a waza with no matching technique", async () => {
    const app = await createApp();
    app.load(DATA);
    app.setFilter("f-warning", true);
    assert.equal(app.button("Tachi waza").props.disabled, false);
    assert.equal(app.button("Suwari waza").props.disabled, true);
    assert.equal(app.button("Hanmi Handachi waza").props.disabled, true);
    assert.match(app.text("home-msg"), /grisé/);
  });

  test("changing grade reloads the merged data", async () => {
    const app = await createApp();
    const n1 = app.model.quiz?.total ?? 0;
    await app.selectGrade("3eme-kyo");
    assert.equal(app.model.catalog.id, "3eme-kyo");
    assert.equal(countTechniques(app.model.catalog.data), 65);
    assert.ok(n1 >= 0);
  });

  test("quiz: full card, video, progress", async () => {
    const app = await createApp({ random: () => 0 });
    app.load({ waza: { "Tachi waza": [{ name: "Katate dori", order: 1, techniques: [{ name: "Nikkyo", order: 2, forms: ["Ura"], isNew: true, isWarning: true, note: "N", video: "https://v" }] }] } });
    app.click("Tachi waza");
    const card = app.card();
    assert.deepEqual([card.waza, card.attack, card.technique, card.form, card.note], ["Tachi waza", "Katate dori", "Nikkyo", "Ura", "N"]);
    assert.equal(card.video.props.href, "https://v");
    assert.match(card.badges, /🆕/);
    assert.match(card.badges, /⚠️/);
    assert.equal(app.text("progress"), "Tachi waza : 1 / 1");
  });

  test("no video: link absent, empty fields kept", async () => {
    const app = await createApp({ random: () => 0 });
    app.load({ waza: { "Tachi waza": [{ name: "A", order: 1, techniques: [{ name: "Ikkyo", order: 1, forms: [] }] }] } });
    app.click("Tachi waza");
    const card = app.card();
    assert.equal(card.video, undefined);
    assert.equal(card.form, "");
    assert.equal(card.note, "");
  });

  test("no repetition, then done", async () => {
    const app = await createApp();
    app.load(DATA);
    app.click("Tachi waza");
    const total = app.model.quiz.total;
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

  test("going home resets; filters apply to the pool", async () => {
    const app = await createApp();
    app.load(DATA);
    app.setFilter("f-new", true);
    app.click("Tachi waza");
    assert.equal(app.model.quiz.total, 2);
    app.click("home-btn");
    assert.equal(screenOf(app.model), "home");
    app.click("Tachi waza");
    assert.equal(app.model.quiz.pool.length, app.model.quiz.total - 1);
  });
});

describe("program", () => {
  async function open() {
    const app = await createApp({ random: () => 0 });
    app.load(DATA);
    app.click("Tachi waza");
    const before = app.model.quiz.pool.length;
    app.click("prog-btn");
    return { app, before };
  }

  test("attacks sorted, the session is over", async () => {
    const { app } = await open();
    assert.deepEqual(app.list(), ["Aï hammi katate dori", "Katate dori", "Ryote dori"]);
    assert.equal("quiz" in app.model, false);
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

  test("back button: goes up one level then returns to the quiz", async () => {
    const { app } = await open();
    app.click("Katate dori");
    app.click("Nikkyo");
    app.click("prog-back");
    assert.equal(app.model.program.current.level, 2);
    app.click("prog-back");
    assert.equal(app.model.program.current.level, 1);
    app.click("prog-back");
    assert.equal(screenOf(app.model), "quiz");
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
    const model = { catalog: { id: "2eme-kyo" }, quiz: { waza: "Tachi waza" }, program: { current: { level: 3, attack: "Aï hammi katate dori", technique: "Nikkyo" } } };
    assert.equal(toHash(model), "#/2eme-kyo/Tachi%20waza/program/A%C3%AF%20hammi%20katate%20dori/Nikkyo");
    assert.deepEqual(parseHash(toHash(model)), { grade: "2eme-kyo", waza: "Tachi waza", program: { level: 3, attack: "Aï hammi katate dori", technique: "Nikkyo" } });
    assert.deepEqual(parseHash("#/%E0%A4%A"), {});
  });

  test("the URL follows navigation: home, quiz, program, back", async () => {
    const app = await createApp();
    assert.equal(app.history.url, "#/1er-kyo");
    app.click("Tachi waza");
    assert.equal(app.history.url, "#/1er-kyo/Tachi%20waza");
    app.click("prog-btn");
    assert.equal(app.history.url, "#/1er-kyo/Tachi%20waza/program");
    app.click(app.list()[0]);
    assert.match(app.history.url, /\/program\/A%C3%AF%20hammi%20katate%20dori$/);
    app.click("prog-back");
    app.click("prog-back");
    assert.equal(app.history.url, "#/1er-kyo/Tachi%20waza");
    assert.equal(screenOf(app.model), "quiz");
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
    const hash = "#/2eme-kyo/Suwari%20waza/program/Katate%20dori/Nikkyo";
    const app = await createApp({ hash });
    assert.deepEqual([app.model.catalog.id, app.model.program.waza, screenOf(app.model)], ["2eme-kyo", "Suwari waza", "program"]);
    assert.equal(app.model.program.current.technique, "Nikkyo");
    assert.equal(app.text("prog-technique"), "Nikkyo");
    assert.equal(app.history.url, hash);
  });

  test("reloading on a quiz URL starts a new quiz of that waza", async () => {
    const app = await createApp({ hash: "#/3eme-kyo/Tachi%20waza" });
    assert.equal(screenOf(app.model), "quiz");
    assert.equal(app.model.catalog.id, "3eme-kyo");
    assert.ok(app.model.quiz.current);
    assert.equal(app.card().waza, "Tachi waza");
  });

  test("after reloading on the program, going back to the quiz starts a quiz", async () => {
    const app = await createApp({ hash: "#/1er-kyo/Tachi%20waza/program" });
    assert.equal("quiz" in app.model, false);
    app.dispatch(to("navigation", { type: "Popped", hash: "#/1er-kyo/Tachi%20waza" }));
    assert.equal(screenOf(app.model), "quiz");
    assert.ok(app.model.quiz.current);
  });

  test("opening the program ends the session; coming back starts a new one at 0", async () => {
    const app = await createApp({ random: () => 0 });
    app.load(DATA);
    app.click("Tachi waza");
    app.click("Technique suivante");
    assert.ok(app.model.quiz.total - app.model.quiz.pool.length >= 2);
    const total = app.model.quiz.total;
    app.click("Voir le programme");
    assert.equal("quiz" in app.model, false);
    assert.equal(app.model.program.waza, "Tachi waza");
    app.click("← Tirage");
    assert.equal("program" in app.model, false);
    assert.equal(app.model.quiz.total, total);
    assert.equal(app.model.quiz.total - app.model.quiz.pool.length, 1);
    assert.equal(app.history.url.endsWith("Tachi%20waza"), true);
  });

  test("invalid URL: unknown grade or waza → home, unknown attack → level 1", async () => {
    assert.equal(screenOf((await createApp({ hash: "#/xx/Foo" })).model), "home");
    const app = await createApp({ hash: "#/1er-kyo/Tachi%20waza/program/Nimporte/Quoi" });
    assert.deepEqual(app.model.program?.current, { level: 1 });
    assert.equal(app.history.url, "#/1er-kyo/Tachi%20waza/program");
  });

  test("popstate to another grade loads its data", async () => {
    const app = await createApp();
    app.dispatch(to("navigation", { type: "Popped", hash: "#/3eme-kyo/Tachi%20waza/program" }));
    await settle();
    assert.equal(app.model.catalog.id, "3eme-kyo");
    assert.equal(countTechniques(app.model.catalog.data), 65);
    assert.equal(screenOf(app.model), "program");
  });
});

describe("title and loading", () => {
  test("the quiz and program slices only exist while they are used", async () => {
    const app = await createApp({ random: () => 0 });
    app.load(DATA);
    const slices = () => ["quiz", "program"].filter((name) => name in app.model);
    assert.deepEqual(slices(), []);
    app.click("Tachi waza");
    assert.deepEqual(slices(), ["quiz"]);
    app.click("prog-btn");
    assert.deepEqual(slices(), ["program"]);
    app.click("prog-back");
    assert.deepEqual(slices(), ["quiz"]);
    app.fire(app.byId("title"));
    assert.deepEqual(slices(), []);
  });

  test("the title goes home, and does nothing when already home", async () => {
    const app = await createApp({ random: () => 0 });
    app.load(DATA);
    const entries = app.history.states.length;
    app.fire(app.byId("title"));
    assert.equal(app.history.states.length, entries);
    app.click("Tachi waza");
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

  test("no slide while loading, a new quiz slides forward with a new key", async () => {
    const app = await open();
    assert.equal(app.model.slide.count, 0);
    app.click("Tachi waza");
    const first = app.byId("card").props;
    assert.equal(first.className, "card slide-forward");
    app.click("next");
    assert.notEqual(app.byId("card").props.key, first.key);
  });

  test("program card: key changes with each navigation, class follows the direction", async () => {
    const app = await open();
    app.click("Tachi waza");
    app.click("prog-btn");
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
    app.click("Tachi waza");
    const { count } = app.model.slide;
    app.dispatch(to("catalog", { type: "SetFilter", name: "isNew", checked: true }));
    assert.equal(app.model.slide.count, count);
  });

  test("a message can force the direction", () => {
    const [model] = init();
    const ready = { ...model, catalog: { ...model.catalog, status: "ready", data: DATA }, program: { waza: "Tachi waza", current: { level: 3, attack: "Katate dori", technique: "Nikkyo" } } };
    const [next] = update(ready, to("program", { type: "Navigate", to: { level: 3, attack: "Katate dori", technique: "Kote gaeshi" }, direction: "back" }));
    assert.equal(next.slide.direction, "back");
  });
});

describe("history position", () => {
  test("push increments the position, replace keeps it, a pop restores it", async () => {
    const app = await createApp({ random: () => 0 });
    app.load(DATA);
    assert.equal(app.model.navigation.position, 0);
    app.click("Tachi waza");
    app.click("prog-btn");
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
    const [pushed, pushes] = update(ready, to("quiz", { type: "StartSession", waza: "Tachi waza" }));
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
    app.click("Tachi waza");
    app.click("prog-btn");
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
    assert.equal(screenOf(app.model), "quiz");
    assert.equal(app.history.url, "#/t/Tachi%20waza");
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
    app.click("Tachi waza");
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
    model.catalog = { ...model.catalog, data: readJson("data/2eme-kyo.json") };
    const summary = summarize(model, debugHide);
    assert.match(summary.catalog.data, /techniques/);
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

  test("diffModels goes inside the feature slices, and the log labels enveloped messages", () => {
    const before = { screen: "home", video: { skipWarning: false, prompt: null } };
    const after = { screen: "home", video: { skipWarning: false, prompt: { url: "u" } } };
    assert.deepEqual(diffModels(before, after, ["video"]).map(({ key }) => key), ["video.prompt"]);
    assert.deepEqual(diffModels(before, after).map(({ key }) => key), ["video"]);
    assert.equal(labelOf({ feature: "video", msg: { type: "AskVideo" } }), "video/AskVideo");
    assert.equal(labelOf({ type: "Next" }), "Next");
  });

  test("the state tab shows one foldable section per slice, and the events of a message in its detail", () => {
    let panel = panelUpdate(initialPanel(["video"]), { type: "Tab", tab: "state" });
    const model = { screen: "home", video: { skipWarning: false, prompt: null } };
    const folds = (current) => find(panelView(current, model), (node) => node.props.className === "dbg-fold").map(text);
    assert.deepEqual(folds(panelUpdate(panel, { type: "Toggle" })), ["▾ video", "▾ (...)"]);
    panel = panelUpdate(panelUpdate(panel, { type: "Toggle" }), { type: "Fold", name: "video" });
    assert.deepEqual(folds(panel), ["▸ video", "▾ (...)"]);
    const entry = { msg: { feature: "a", msg: { type: "X" } }, before: {}, after: {}, cmds: [], events: [{ event: { type: "Changed" }, from: "a", handledBy: ["b"] }] };
    panel = panelUpdate(panelUpdate(panelUpdate(panel, { type: "Recorded", entry, time: "t" }), { type: "Tab", tab: "log" }), { type: "Select", id: 1 });
    assert.match(find(panelView(panel, model), (node) => node.props.className === "dbg-detail").map(text)[0], /a → Changed : reçu par b/);
  });

  test("the runtime reports each step, effects after the message that caused them, and can restore a past model", () => {
    const records = [];
    let handle;
    const rendered = [];
    const dispatch = run({
      init: () => [{ n: 0 }, []],
      update: (model, msg) => (msg.type === "Inc" ? [{ n: model.n + 1 }, [{ type: "Echo" }]] : [model, []]),
      view: (model) => model.n,
      render: (tree) => rendered.push(tree),
      effects: { Echo: (_, send) => send({ type: "Noop" }) },
      debug: { attach: (control) => (handle = control), record: (entry) => records.push(entry) },
    });
    dispatch({ type: "Inc" });
    assert.deepEqual(records.map((entry) => entry.msg.type), ["@init", "Inc", "Noop"]);
    assert.deepEqual(records[1].cmds, [{ type: "Echo" }]);
    assert.deepEqual(records[1].events, []);
    assert.deepEqual([records[1].before, records[1].after], [{ n: 0 }, { n: 1 }]);
    handle.restore(records[0].after);
    assert.deepEqual(handle.getModel(), { n: 0 });
    assert.equal(rendered.at(-1), 0);
  });

  test("the panel can be moved and resized with the pointer, kept inside the viewport", () => {
    const viewport = { width: 500, height: 800 };
    const base = initialPanel();
    const moved = panelUpdate(panelUpdate(base, { type: "DragStart", mode: "move", x: 100, y: 100 }), { type: "Drag", x: 160, y: 130, viewport });
    assert.deepEqual([moved.box.x, moved.box.y, moved.box.w, moved.box.h], [base.box.x + 60, base.box.y + 30, base.box.w, base.box.h]);
    const away = panelUpdate(moved, { type: "Drag", x: 9999, y: -9999, viewport });
    assert.deepEqual([away.box.x, away.box.y], [440, 0]);
    const resized = panelUpdate(panelUpdate(base, { type: "DragStart", mode: "resize", x: 0, y: 0 }), { type: "Drag", x: 50, y: -9999, viewport });
    assert.deepEqual([resized.box.x, resized.box.w, resized.box.h], [base.box.x, base.box.w + 50, 140]);
    assert.equal(panelUpdate(panelUpdate(moved, { type: "DragEnd" }), { type: "Drag", x: 300, y: 300, viewport }).box.x, moved.box.x);
  });

  test("the panel keeps a numbered log, shows the selected entry and toggles", () => {
    const entry = { msg: { type: "Next" }, before: { a: 1 }, after: { a: 2 }, cmds: [{ type: "Random" }] };
    let panel = panelUpdate(initialPanel(), { type: "Recorded", entry, time: "10:00:00" });
    panel = panelUpdate(panel, { type: "Recorded", entry, time: "10:00:01" });
    assert.deepEqual(panel.entries.map((recorded) => recorded.id), [1, 2]);
    assert.equal(panel.entries[0].changes[0].key, "a");
    assert.equal(find(panelView(panel, {}), (node) => node.props.className === "dbg-panel").length, 0);
    panel = panelUpdate(panel, { type: "Toggle" });
    const close = find(panelView(panel, {}), (node) => node.props.className === "dbg-close")[0];
    assert.equal(panelUpdate(panel, close.props.onClick).open, false);
    const bar = find(panelView(panel, {}), (node) => node.props.className === "dbg-bar")[0];
    const onButton = { target: { closest: () => ({}) }, clientX: 1, clientY: 1 };
    assert.equal(bar.props.onPointerDown(onButton).type, "Noop");
    assert.equal(bar.props.onPointerDown({ target: { closest: () => null }, clientX: 1, clientY: 1 }).type, "DragStart");
    panel = panelUpdate(panel, { type: "Tab", tab: "log" });
    panel = panelUpdate(panel, { type: "Select", id: 2 });
    assert.equal(find(panelView(panel, {}), (node) => node.props.className === "dbg-detail").length, 1);
    assert.equal(find(panelView(panel, {}), (node) => node.props.className === "dbg-copy").length, 0);
    const onState = panelView(panelUpdate(panel, { type: "Tab", tab: "state" }), { screen: "home" });
    const copy = find(onState, (node) => node.props.className === "dbg-copy")[0];
    assert.equal(text(copy), "📋");
    assert.match(copy.props.onClick.text, /"screen": "home"/);
    assert.equal(panelUpdate(panelUpdate(panel, { type: "Select", id: 2 }), { type: "Clear" }).entries.length, 0);
    const back = panelUpdate(panel, { type: "Restored", id: 1 });
    assert.deepEqual(back.entries.map((recorded) => recorded.id), [1], "the steps after the restored one are forgotten");
    assert.equal(back.selected, null);
    assert.equal(panelUpdate(back, { type: "Recorded", entry, time: "10:00:02" }).entries[1].id, 2, "the next step follows the restored one");
  });
});
