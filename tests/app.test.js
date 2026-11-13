import { test, describe } from "node:test";
import assert from "node:assert/strict";
import { createApp, settle, readJson, resolveGrade, WAZA, keysOf, parentsOf, byId, find, text } from "./helpers.js";
import { buildPool, pickIndex, mergeGrades, listAttacks, listTechniques, findSameTechnique, countTechniques } from "../src/logic.js";
import { h } from "../src/vdom.js";
import { parseHash, toHash } from "../src/route.js";
import { update, init, initialModel } from "../src/update.js";
import { view } from "../src/view.js";
import { resolveGrade as resolveGradeFx } from "../src/effects.js";

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
    const weightOf = (name, form) => pool.find((entry) => entry.technique.name === name && entry.form === form).weight;
    assert.equal(weightOf("Nikkyo", "Omote"), 1.5);
    assert.equal(pool.find((entry) => entry.technique.name === "Kote gaeshi").weight, 1);
    assert.equal(pool.find((entry) => entry.technique.name === "nikkyo").weight, 1.5);
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
  test("Rolled is ignored outside a draw", () => {
    const [model] = init();
    const [next, cmds] = update(model, { type: "Rolled", value: 0.5 });
    assert.equal(next.current, model.current);
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

describe("effects.resolveGrade", () => {
  test("merges the parents then the grade", async () => {
    const grades = readJson("data/grades.json");
    const data = await resolveGradeFx(grades.find((grade) => grade.id === "2eme-kyo"), async (url) => readJson(url));
    assert.equal(countTechniques(data), 108);
  });
});

describe("application", () => {
  test("home: grades, enabled waza buttons", async () => {
    const app = await createApp();
    assert.equal(app.model.screen, "home");
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
    const n1 = app.model.total ?? 0;
    await app.selectGrade("3eme-kyo");
    assert.equal(app.model.gradeId, "3eme-kyo");
    assert.equal(countTechniques(app.model.data), 65);
    assert.ok(n1 >= 0);
  });

  test("draw: full card, video, progress", async () => {
    const app = await createApp({ random: () => 0 });
    app.load({ waza: { "Tachi waza": [{ name: "Katate dori", order: 1, techniques: [{ name: "Nikkyo", order: 2, forms: ["Ura"], isNew: true, isWarning: true, note: "N", video: "https://v" }] }] } });
    app.click("Tachi waza");
    const card = app.card();
    assert.deepEqual([card.waza, card.attack, card.technique, card.form, card.note], ["Tachi waza", "Katate dori", "Nikkyo", "Ura", "N"]);
    assert.equal(card.video.props.href, "https://v");
    assert.match(card.badges, /🆕/);
    assert.match(card.badges, /⚠️/);
    assert.equal(app.text("progress"), "Tachi waza : 1 / 1 - Connais-tu cette technique ?");
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
    const total = app.model.total;
    const seen = new Set();
    const key = () => Object.values(app.card()).slice(0, 4).join("|");
    seen.add(key());
    for (let i = 1; i < total; i++) {
      app.click("next");
      seen.add(key());
    }
    assert.equal(seen.size, total);
    assert.equal(app.text("progress"), `Tachi waza : ${total} / ${total} - Connais-tu cette technique ?`);
    app.click("next");
    assert.ok(byId(app.tree, "done"));
    assert.equal(app.button("Technique suivante"), undefined);
  });

  test("going home resets; filters apply to the pool", async () => {
    const app = await createApp();
    app.load(DATA);
    app.setFilter("f-new", true);
    app.click("Tachi waza");
    assert.equal(app.model.total, 2);
    app.click("home-btn");
    assert.equal(app.model.screen, "home");
    app.click("Tachi waza");
    assert.equal(app.model.pool.length, app.model.total - 1);
  });
});

describe("program", () => {
  async function open() {
    const app = await createApp({ random: () => 0 });
    app.load(DATA);
    app.click("Tachi waza");
    const before = app.model.pool.length;
    app.click("prog-btn");
    return { app, before };
  }

  test("attacks sorted, session untouched", async () => {
    const { app, before } = await open();
    assert.deepEqual(app.list(), ["Aï hammi katate dori", "Katate dori", "Ryote dori"]);
    assert.equal(app.model.pool.length, before);
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
    assert.equal(app.model.program.level, 2);
    assert.equal(app.model.program.attack, "Katate dori");
  });

  test("level 2 back button always lists the attacks, even after other navigation", async () => {
    const { app } = await open();
    app.click("Katate dori");
    app.click("Nikkyo");
    app.click("prog-back");
    assert.equal(app.model.program.level, 2);
    app.click("prog-back");
    assert.equal(app.model.program.level, 1);
    assert.equal(app.model.slide.direction, "back");
  });

  test("back button: goes up one level then returns to the draw", async () => {
    const { app } = await open();
    app.click("Katate dori");
    app.click("Nikkyo");
    app.click("prog-back");
    assert.equal(app.model.program.level, 2);
    app.click("prog-back");
    assert.equal(app.model.program.level, 1);
    app.click("prog-back");
    assert.equal(app.model.screen, "draw");
    assert.ok(byId(app.tree, "card"));
  });

  test("slide direction: in-app back slides back, browser back and forward follow the history", async () => {
    const { app } = await open();
    app.click("Katate dori");
    app.click("Nikkyo");
    app.click(app.list()[0]);
    assert.equal(app.model.slide.direction, "forward");
    app.click("prog-back");
    assert.equal(app.model.program.level, 2);
    assert.equal(app.model.slide.direction, "back");
    app.history.back();
    assert.equal(app.model.program.level, 3);
    assert.equal(app.model.slide.direction, "back");
    app.history.forward();
    assert.equal(app.model.program.level, 2);
    assert.equal(app.model.slide.direction, "forward");
  });
});

describe("URL and history", () => {
  test("parseHash / toHash: round trip, accents and spaces encoded", () => {
    const model = { gradeId: "2eme-kyo", screen: "program", waza: "Tachi waza", program: { level: 3, attack: "Aï hammi katate dori", technique: "Nikkyo" } };
    assert.equal(toHash(model), "#/2eme-kyo/Tachi%20waza/program/A%C3%AF%20hammi%20katate%20dori/Nikkyo");
    assert.deepEqual(parseHash(toHash(model)), { grade: "2eme-kyo", waza: "Tachi waza", program: { level: 3, attack: "Aï hammi katate dori", technique: "Nikkyo" } });
    assert.deepEqual(parseHash("#/%E0%A4%A"), {});
  });

  test("the URL follows navigation: home, draw, program, back", async () => {
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
    assert.equal(app.model.screen, "draw");
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
    assert.deepEqual([app.model.gradeId, app.model.waza, app.model.screen], ["2eme-kyo", "Suwari waza", "program"]);
    assert.equal(app.model.program.technique, "Nikkyo");
    assert.equal(app.text("prog-technique"), "Nikkyo");
    assert.equal(app.history.url, hash);
  });

  test("reloading on a draw URL starts a new draw of that waza", async () => {
    const app = await createApp({ hash: "#/3eme-kyo/Tachi%20waza" });
    assert.equal(app.model.screen, "draw");
    assert.equal(app.model.gradeId, "3eme-kyo");
    assert.ok(app.model.current);
    assert.equal(app.card().waza, "Tachi waza");
  });

  test("after reloading on the program, going back to the draw starts a draw", async () => {
    const app = await createApp({ hash: "#/1er-kyo/Tachi%20waza/program" });
    assert.equal(app.model.current, null);
    app.dispatch({ type: "Popped", hash: "#/1er-kyo/Tachi%20waza" });
    assert.equal(app.model.screen, "draw");
    assert.ok(app.model.current);
  });

  test("invalid URL: unknown grade or waza → home, unknown attack → level 1", async () => {
    assert.equal((await createApp({ hash: "#/xx/Foo" })).model.screen, "home");
    const app = await createApp({ hash: "#/1er-kyo/Tachi%20waza/program/Nimporte/Quoi" });
    assert.deepEqual(app.model.program, { level: 1 });
    assert.equal(app.history.url, "#/1er-kyo/Tachi%20waza/program");
  });

  test("popstate to another grade loads its data", async () => {
    const app = await createApp();
    app.dispatch({ type: "Popped", hash: "#/3eme-kyo/Tachi%20waza/program" });
    await settle();
    assert.equal(app.model.gradeId, "3eme-kyo");
    assert.equal(countTechniques(app.model.data), 65);
    assert.equal(app.model.screen, "program");
  });
});

describe("title and loading", () => {
  test("the title goes home, and does nothing when already home", async () => {
    const app = await createApp({ random: () => 0 });
    app.load(DATA);
    const entries = app.history.states.length;
    app.fire(app.byId("title"));
    assert.equal(app.history.states.length, entries);
    app.click("Tachi waza");
    app.fire(app.byId("title"));
    assert.equal(app.model.screen, "home");
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

  test("no slide while loading, a new draw slides forward with a new key", async () => {
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
    app.dispatch({ type: "SetFilter", name: "isNew", checked: true });
    assert.equal(app.model.slide.count, count);
  });

  test("a message can force the direction", () => {
    const [model] = init();
    const ready = { ...model, status: "ready", data: DATA, screen: "program", waza: "Tachi waza", program: { level: 3, attack: "Katate dori", technique: "Nikkyo" } };
    const [next] = update(ready, { type: "Navigate", to: { level: 3, attack: "Katate dori", technique: "Kote gaeshi" }, direction: "back" });
    assert.equal(next.slide.direction, "back");
  });
});

describe("history position", () => {
  test("push increments the position, replace keeps it, a pop restores it", async () => {
    const app = await createApp({ random: () => 0 });
    app.load(DATA);
    assert.equal(app.model.position, 0);
    app.click("Tachi waza");
    app.click("prog-btn");
    assert.equal(app.model.position, 2);
    app.history.back();
    assert.equal(app.model.position, 1);
    app.history.forward();
    assert.equal(app.model.position, 2);
  });

  test("Url commands carry the position; init restores it after a reload", () => {
    const [model] = init({ position: 3 });
    assert.equal(model.position, 3);
    const ready = { ...model, status: "ready", data: DATA, grades: [], gradeId: "t" };
    const [pushed, [push]] = update(ready, { type: "StartSession", waza: "Tachi waza" });
    assert.equal(pushed.position, 4);
    assert.deepEqual([push.type, push.mode, push.position], ["Url", "push", 4]);
    const [selected, commands] = update({ ...ready, grades: [{ id: "t" }] }, { type: "SelectGrade", id: "t" });
    const replace = commands.find((command) => command.type === "Url");
    assert.deepEqual([replace.mode, replace.position, selected.position], ["replace", 3, 3]);
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
    assert.deepEqual([app.model.program.level, app.model.program.attack], [2, "Katate dori"]);
    assert.equal(app.model.slide.direction, "back");
    app.click("prog-back");
    assert.equal(app.model.program.level, 1);
    app.click("prog-back");
    assert.equal(app.model.screen, "draw");
    assert.equal(app.model.slide.direction, "back");
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
