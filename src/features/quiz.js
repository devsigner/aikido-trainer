// src/features/quiz.js

// Feature "quiz": a session of random techniques for one waza (pool without repetition).
// Standalone feature (see src/framework/combine.js): its model, update, view and effects are all here.
// Reads the data and filters of the catalog feature through the root model (read-only).
// Publishes `Navigated` (the URL must follow) and `ViewChanged` (the card slides). Opening the program ends the session (`ProgramOpened`); coming back from it starts a new one (`ProgramClosed`).
import { h } from "../framework/vdom.js";
import { buildPool, pickIndex } from "../shared/logic.js";
import { card } from "../layout/card.js";
import { navigated } from "./navigation.js";
import { viewChanged } from "./slide.js";
import { screenOf } from "../shared/screen.js";
import { WAZA_ORDER } from "../shared/logic.js";
import { UNMOUNT, to } from "../framework/combine.js";

// State of a quiz session. The model is reset to this state when the user goes home or changes waza.
// - `waza` = "Tachi waza" | "Hanmi Handachi waza" | "Suwari waza" ("" outside a session)
// - `pool` = list of remaining techniques to quiz (weighted)
// - `total` = total number of techniques in the pool at the start of the session
// - `current` = technique currently drawn (null if none) e.g. { waza, attack, technique, form, weight }
// - `done` = true if the pool is empty and the user has seen all techniques
export const initialModel = { waza: "", pool: [], total: 0, current: null, done: false };

// A new session of `waza` with the data and filters of the grade.
export function startSession(root, waza) {
  const pool = buildPool(root.catalog.data, waza, root.catalog.filters);
  return { ...initialModel, waza, pool, total: pool.length };
}

// Command asking this feature to quiz (for the code that has no access to its messages).
export const roll = { type: "Random", feature: "quiz" };

const messages = {
  StartSession: (_, msg, root) => [startSession(root, msg.waza), [{ type: "Random" }], [navigated("push"), viewChanged("forward")]],

  Next: (model) => (model.pool.length === 0 ? [{ ...model, current: null, done: true }, [], [viewChanged("forward")]] : [model, [{ type: "Random" }]]),

  // Answer of the `Random` effect: randomness is an effect, so `update` stays pure.
  Rolled(model, msg, root) {
    if (!model.waza) return [UNMOUNT, []]; // answer of a session that is over
    if (screenOf(root) !== "quiz" || model.pool.length === 0) return [model, []];
    const index = pickIndex(model.pool, msg.value);
    return [{ ...model, current: model.pool[index], pool: model.pool.filter((_, poolIndex) => poolIndex !== index) }, [], [viewChanged("forward")]];
  },
};

// Quiz screen: show a technique and ask if the user knows it.
function view(model, root) {
  const { current } = model;
  const shown = current ? { waza: model.waza, attack: current.attack, technique: current.technique, form: current.form || "" } : {};
  return h("section", { id: "quiz" },
    h("button", { id: "home-btn", className: "secondary", onClick: to("navigation", { type: "GoHome" }) }, "Retour à l'accueil"),
    h("p", { id: "progress", className: "hint" }, `${model.waza} : ${model.total - model.pool.length} / ${model.total}`),
    h("h3", { className: "hint" }, "Connais-tu cette technique ?"),
    model.done ? h("div", { id: "done" }, "Waza terminé 🎉") : card(root, { prefix: "card", ...shown }),
    h("div", { className: "buttons actions" },
      !model.done && h("button", { id: "next", onClick: { type: "Next" } }, "Technique suivante"),
      h("button", { id: "prog-btn", className: "secondary", onClick: to("program", { type: "OpenProgram", waza: model.waza }) }, "Voir le programme")));
}

// Waza buttons of the home screen: start a session (a waza with no technique for the filters is disabled).
function picker(root) {
  const empty = Object.fromEntries(WAZA_ORDER.map((waza) => [waza, buildPool(root.catalog.data, waza, root.catalog.filters).length === 0]));
  return h("div", { className: "group grow" },
    h("p", { className: "hint" }, "Choisis un waza et teste-toi !"),
    h("div", { id: "waza-buttons", className: "buttons grow" },
      WAZA_ORDER.map((waza) => h("button", { disabled: empty[waza], onClick: { type: "StartSession", waza } }, waza))),
    h("p", { id: "home-msg", className: "hint" }, Object.values(empty).some(Boolean) ? "Un waza grisé n'a aucune technique pour ces filtres." : ""));
}

// The URL changed (reload, browser back/forward): a session of the waza of the route, or none.
function routeChanged(model, { route, direction }, root) {
  if (!WAZA_ORDER.includes(route.waza) || route.program) return [UNMOUNT, [], model.waza && direction ? [viewChanged(direction)] : []]; // the program replaces the session

  const next = model.waza === route.waza ? model : startSession(root, route.waza);
  const needsCard = !next.current && !next.done && next.pool.length > 0;
  return [next, needsCard ? [{ type: "Random" }] : [], next !== model && direction ? [viewChanged(direction)] : []];
}

export const quiz = {
  name: "quiz",
  lazy: { events: ["RouteChanged", "ProgramClosed"] }, // the slice only exists during a session
  init: () => [initialModel, []],
  update(model, msg, root) {
    if (!messages[msg.type]) throw new Error(`Unknown message : ${msg.type}`);
    return messages[msg.type](model, msg, root);
  },
  on: {
    RouteChanged: routeChanged,
    ProgramOpened: () => [UNMOUNT, []],
    HomeRequested: () => [UNMOUNT, [], [viewChanged("forward")]],
    // Back from the program: a fresh session of the same waza.
    ProgramClosed: (_, { waza }, root) => [startSession(root, waza), [{ type: "Random" }]],
  },
  view,
  picker,
  effects: ({ random }) => ({
    Random: (_, dispatch) => dispatch({ type: "Rolled", value: random() }),
  }),
};
