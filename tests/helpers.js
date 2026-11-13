import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createEffects } from "../src/effects.js";
import { mergeGrades } from "../src/logic.js";
import { run } from "../src/runtime.js";
import { init, update } from "../src/update.js";
import { view } from "../src/view.js";

export const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
export const read = (file) => fs.readFileSync(path.join(ROOT, file), "utf8");
export const readJson = (file) => JSON.parse(read(file));
export const WAZA = ["Tachi waza", "Suwari waza", "Hanmi Handachi waza"];

export const keysOf = (data) =>
  Object.entries(data.waza).flatMap(([waza, list]) => list.flatMap((attack) => attack.techniques.map((technique) => `${waza}|${attack.name}|${technique.name}`)));

// Files of a grade in inheritance order (parents first).
export const chain = (id) => {
  const grade = readJson("data/grades.json").find((candidate) => candidate.id === id);
  return [...(grade.includes || []), grade.file].map((file) => readJson(`data/${file}`));
};
const fold = (list) => list.reduce((merged, data) => (merged ? mergeGrades(merged, data) : data), null);
export const resolveGrade = (id) => fold(chain(id));
export const parentsOf = (id) => fold(chain(id).slice(0, -1));

// ---------- Virtual tree ----------
export const walk = (node, visit) => {
  if (typeof node === "string") return;
  visit(node);
  node.children.forEach((child) => walk(child, visit));
};
export const find = (node, predicate) => {
  const found = [];
  walk(node, (current) => predicate(current) && found.push(current));
  return found;
};
export const byId = (node, id) => find(node, (current) => current.props.id === id)[0];
export const text = (node) => (node === undefined ? undefined : typeof node === "string" ? node : node.children.map(text).join(""));

// ---------- Full app (real runtime, real data, simulated history) ----------
export const settle = () => new Promise((resolve) => setImmediate(resolve));

export async function createApp({ random = Math.random, hash = "" } = {}) {
  let tree;
  let model;
  let popstate;
  const states = [hash];
  let index = 0;
  const history = {
    pushState(_state, _title, url) {
      states.splice(index + 1, Infinity, url);
      index++;
    },
    replaceState(_state, _title, url) {
      states[index] = url;
    },
    back() {
      index = Math.max(0, index - 1);
      popstate({ type: "Popped", hash: states[index] });
    },
  };
  const dispatch = run({
    init,
    update: (current, msg) => {
      const result = update(current, msg);
      model = result[0];
      return result;
    },
    view,
    flags: { hash },
    render: (vnode) => (tree = vnode),
    effects: createEffects({ fetchJson: async (url) => readJson(url), random, history }),
    subscribe: (listener) => (popstate = listener),
  });
  await settle();
  const app = {
    dispatch,
    history: { states, get index() { return index; }, get url() { return states[index]; } },
    get tree() {
      return tree;
    },
    get model() {
      return model;
    },
    byId: (id) => byId(tree, id),
    text: (id) => text(byId(tree, id)),
    button: (label) => find(tree, (current) => current.tag === "button" && text(current).startsWith(label))[0],
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
        attack: get("card-attack"),
        technique: get("card-technique"),
        form: get("card-form"),
        badges: get("card-badges"),
        note: get("card-note"),
        video: byId(tree, "card-video"),
      };
    },
    // Loads test data in place of the JSON files.
    load(data) {
      dispatch({ type: "GradesLoaded", grades: [{ id: "t", label: "Test", count: 1 }], gradeId: "t", data });
    },
  };
  return app;
}
