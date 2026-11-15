// Feature "draw": a session of random techniques for one waza (pool without repetition).
// Standalone feature (see src/framework/combine.js): its model, update, view and effects are all here.
// Reads the data and filters of the grade feature through the root model (read-only).
// Publishes `SessionReset` (the session is over: the program closes) and `Navigated` (the URL must follow).
import { h } from "./vdom.js";
import { badgesOf, buildPool, pickIndex } from "./logic.js";
import { card, slideProps } from "./card.js";
import { navigated, screenOf } from "./update-history.js";
import { WAZA_ORDER } from "./logic.js";
import { to } from "./framework/combine.js";

// State of a draw session. The model is reset to this state when the user goes home or changes waza.
// - `waza` = "Tachi waza" | "Hanmi Handachi waza" | "Suwari waza" ("" outside a session)
// - `pool` = list of remaining techniques to draw (weighted)
// - `total` = total number of techniques in the pool at the start of the session
// - `current` = technique currently drawn (null if none) e.g. { waza, attack, technique, form, weight }
// - `done` = true if the pool is empty and the user has seen all techniques
export const initialModel = { waza: "", pool: [], total: 0, current: null, done: false };

// A new session of `waza` with the data and filters of the grade.
export function startSession(root, waza) {
  const pool = buildPool(root.grade.data, waza, root.grade.filters);
  return { ...initialModel, waza, pool, total: pool.length };
}

// Command asking this feature to draw (for the code that has no access to its messages).
export const roll = { type: "Random", feature: "draw" };

const SESSION_RESET = { type: "SessionReset" };

const messages = {
  StartSession: (_, msg, root) => [startSession(root, msg.waza), [{ type: "Random" }], [SESSION_RESET, navigated("push")]],

  Next: (model) => (model.pool.length === 0 ? [{ ...model, current: null, done: true }, []] : [model, [{ type: "Random" }]]),

  // Answer of the `Random` effect: randomness is an effect, so `update` stays pure.
  Rolled(model, msg, root) {
    if (screenOf(root) !== "draw" || model.pool.length === 0) return [model, []];
    const index = pickIndex(model.pool, msg.value);
    return [{ ...model, current: model.pool[index], pool: model.pool.filter((_, poolIndex) => poolIndex !== index) }, []];
  },

  GoHome: (model, _, root) => (screenOf(root) === "home" ? [model, []] : [initialModel, [], [SESSION_RESET, navigated("push")]]),
};

// Draw screen: show a technique and ask if the user knows it.
function view(model, root) {
  const { current } = model;
  const shown = current && {
    waza: model.waza,
    attack: current.attack,
    technique: current.technique.name,
    form: current.form || "",
    badges: badgesOf(current.technique),
    note: current.technique.note || "",
    video: current.technique.video || "",
    warnVideo: !root.video.skipWarning,
  };
  return h("section", { id: "draw" },
    h("button", { id: "home-btn", className: "secondary", onClick: { type: "GoHome" } }, "Retour à l'accueil"),
    h("p", { id: "progress", className: "hint" }, `${model.waza} : ${model.total - model.pool.length} / ${model.total}`),
    h("h3", { className: "hint" }, "Connais-tu cette technique ?"),
    model.done ? h("div", { id: "done" }, "Waza terminé 🎉") : card("card", shown || {}, "card", slideProps(root.slide)),
    h("div", { className: "buttons actions" },
      !model.done && h("button", { id: "next", onClick: { type: "Next" } }, "Technique suivante"),
      h("button", { id: "prog-btn", className: "secondary", onClick: to("program", { type: "OpenProgram" }) }, "Voir le programme")));
}

// Waza buttons of the home screen: start a session (a waza with no technique for the filters is disabled).
function picker(root) {
  const empty = Object.fromEntries(WAZA_ORDER.map((waza) => [waza, buildPool(root.grade.data, waza, root.grade.filters).length === 0]));
  return h("div", { className: "group grow" },
    h("p", { className: "hint" }, "Choisis un waza et teste-toi !"),
    h("div", { id: "waza-buttons", className: "buttons grow" },
      WAZA_ORDER.map((waza) => h("button", { disabled: empty[waza], onClick: { type: "StartSession", waza } }, waza))),
    h("p", { id: "home-msg", className: "hint" }, Object.values(empty).some(Boolean) ? "Un waza grisé n'a aucune technique pour ces filtres." : ""));
}

// The URL changed (reload, browser back/forward): a session of the waza of the route, or none.
function routeChanged(model, { route }, root) {
  if (!WAZA_ORDER.includes(route.waza)) return [initialModel, []];

  const next = model.waza === route.waza ? model : startSession(root, route.waza);
  const needsDraw = !route.program && !next.current && !next.done && next.pool.length > 0;
  return [next, needsDraw ? [{ type: "Random" }] : []];
}

export const draw = {
  name: "draw",
  init: () => [initialModel, []],
  update(model, msg, root) {
    if (!messages[msg.type]) throw new Error(`Unknown message : ${msg.type}`);
    return messages[msg.type](model, msg, root);
  },
  on: { RouteChanged: routeChanged },
  view,
  picker,
  effects: ({ random }) => ({
    Random: (_, dispatch) => dispatch({ type: "Rolled", value: random() }),
  }),
};
