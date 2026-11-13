import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createEffects } from "../src/effects.js";
import { mergeGrades } from "../src/logic.js";
import { run } from "../src/runtime.js";
import { init, update } from "../src/update.js";
import { view } from "../src/view.js";

export const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
export const read = (f) => fs.readFileSync(path.join(ROOT, f), "utf8");
export const readJson = (f) => JSON.parse(read(f));
export const WAZA = ["Tachi waza", "Suwari waza", "Hanmi Handachi waza"];

export const keysOf = (d) =>
  Object.entries(d.waza).flatMap(([w, l]) => l.flatMap((a) => a.techniques.map((t) => `${w}|${a.nom}|${t.nom}`)));

// Fichiers d'un grade dans l'ordre d'héritage (parents d'abord).
export const chain = (id) => {
  const g = readJson("data/grades.json").find((x) => x.id === id);
  return [...(g.inclut || []), g.fichier].map((f) => readJson(`data/${f}`));
};
const fold = (list) => list.reduce((acc, d) => (acc ? mergeGrades(acc, d) : d), null);
export const resolveGrade = (id) => fold(chain(id));
export const parentsOf = (id) => fold(chain(id).slice(0, -1));

// ---------- Arbre virtuel ----------
export const walk = (node, fn) => {
  if (typeof node === "string") return;
  fn(node);
  node.children.forEach((c) => walk(c, fn));
};
export const find = (node, pred) => {
  const found = [];
  walk(node, (n) => pred(n) && found.push(n));
  return found;
};
export const byId = (node, id) => find(node, (n) => n.props.id === id)[0];
export const text = (node) => (node === undefined ? undefined : typeof node === "string" ? node : node.children.map(text).join(""));

// ---------- Application complète (vrai runtime, vraies données, historique simulé) ----------
export const settle = () => new Promise((r) => setImmediate(r));

export async function createApp({ random = Math.random } = {}) {
  let tree;
  let model;
  let popstate;
  const states = [null];
  let index = 0;
  const history = {
    pushState(s) {
      states.splice(index + 1, Infinity, s);
      index++;
    },
    replaceState(s) {
      states[index] = s;
    },
    back() {
      index = Math.max(0, index - 1);
      popstate({ type: "Popped", state: states[index] });
    },
  };
  const dispatch = run({
    init,
    update: (m, msg) => {
      const r = update(m, msg);
      model = r[0];
      return r;
    },
    view,
    render: (v) => (tree = v),
    effects: createEffects({ fetchJson: async (u) => readJson(u), random, history }),
    subscribe: (d) => (popstate = d),
  });
  await settle();
  const app = {
    dispatch,
    history: { states, get index() { return index; } },
    get tree() {
      return tree;
    },
    get model() {
      return model;
    },
    byId: (id) => byId(tree, id),
    text: (id) => text(byId(tree, id)),
    button: (label) => find(tree, (n) => n.tag === "button" && text(n).startsWith(label))[0],
    fire(node, event = {}) {
      const handler = node.props.onClick ?? node.props.onChange;
      dispatch(typeof handler === "function" ? handler(event) : handler);
    },
    click(idOrLabel) {
      app.fire(byId(tree, idOrLabel) ?? app.button(idOrLabel));
    },
    async selectGrade(id) {
      app.fire(byId(tree, "grade"), { target: { value: id } });
      await settle();
    },
    setFilter(id, checked) {
      app.fire(byId(tree, id), { target: { checked } });
    },
    list: () => byId(tree, "prog-list").children.map(text),
    card() {
      const get = (id) => text(byId(tree, id));
      return {
        waza: get("card-waza"),
        attaque: get("card-attaque"),
        technique: get("card-technique"),
        forme: get("card-forme"),
        badges: get("card-badges"),
        note: get("card-note"),
        video: byId(tree, "card-video"),
      };
    },
    // Charge des données de test à la place des JSON.
    load(data) {
      dispatch({ type: "GradesLoaded", grades: [{ id: "t", label: "Test", count: 1 }], gradeId: "t", data });
    },
  };
  return app;
}
