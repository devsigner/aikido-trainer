// src/features/navigation.js

// Feature "navigation": the URL is the source of truth (reload, browser back/forward).
// Also owns the URL format `#/grade[/waza[/program[/attack[/technique]]]]` (`toHash`, `parseHash`: pure helpers).
// Owns: pending (the route waiting for the data) and position (index of the current history entry, tells back from forward).
// Does not write other slices: it publishes events.
// Publishes `HomeRequested` (quiz and program close), `RouteChanged` ({ route }: quiz and program put themselves in its state) and `GradeWanted` ({ id }: the route is of another grade).
// Reacts to `Navigated` (a feature changed what the URL shows) by writing the URL, stamped with the position (+1 on a push).
import { cmd, defineFeature, emit } from "../../framework/elmer/index.js";
import { screenOf } from "../shared/screen.js";

export const feature = defineFeature({
  name: "navigation",
  initialState: {
    pending: null, // route from the URL, applied once the data is loaded
    position: 0, // index of the current history entry
  },
  init: ({ hash = "", position = 0 } = {}, model) => ({ ...model, pending: parseHash(hash), position }),
  messages: { GoHome: goHomeMessage, Popped: poppedMessage },
  events: { navigated },
  on: {
    GradesLoaded: whenGradesLoaded,
    GradeLoaded: whenGradeLoaded,
    Navigated: whenNavigated
  },
  // Browser back/forward: the URL and the history position are read when the entry changes.
  subscribe: (dispatch, { window, history }) => window.addEventListener("popstate", () => dispatch({
    type: "Popped",
    hash: window.location.hash,
    position: history.state?.position ?? 0,
  })),
  effects: ({ history }) => ({
    Url: ({ mode, hash, position }) => (mode === "push" ? history.pushState({ position }, "", hash) : history.replaceState({ position }, "", hash)),
  }),
});

function goHomeMessage(model, _, root) {
  return screenOf(root) === "home" ? model : [model, [], [emit("HomeRequested"), navigated("push")]];
}

// Browser navigation: the URL is the source of truth.
function poppedMessage(model, msg, root) {
  const next = { ...model, position: msg.position };
  return root.catalog.status === "ready" ? goTo(next, parseHash(msg.hash), root, msg.position < model.position ? "back" : "forward") : next;
}

// Once the data is loaded, the pending route is applied and written in the URL (without a history entry).
function whenGradesLoaded(model) {
  return [{ ...model, pending: null }, [], [routeChanged(model.pending || {}), navigated("replace")]];
}

function whenGradeLoaded(model) {
  return model.pending ? [{ ...model, pending: null }, [], routeChanged(model.pending)] : model;
}

function whenNavigated(model, { mode }, root) {
  const position = model.position + (mode === "push" ? 1 : 0);
  return [{ ...model, position }, cmd("Url", { mode, hash: toHash(root), position })];
}

// Event published by a feature when the URL must follow its change (`mode`: "push" | "replace").
function navigated(mode) {
  return emit("Navigated", { mode });
}

// `direction` ("back" | "forward") is only known for a browser pop: the cards slide that way (no slide otherwise).
function routeChanged(route, direction) {
  return emit("RouteChanged", { route, direction });
}

// Applies a route: a route of another grade first loads that grade (the route waits in `pending`).
// Returns the events: either `GradeWanted` or `RouteChanged`.
function goTo(model, route, root, direction) {
  if (route.grade && route.grade !== root.catalog.id && root.catalog.list.some((candidate) => candidate.id === route.grade)) {
    return [{ pending: route }, [], emit("GradeWanted", { id: route.grade })];
  }
  return [model, [], routeChanged(route, direction)];
}

// URL ⇄ model: #/grade[/waza[/program[/attack[/technique]]]] (hash routing works on GitHub Pages).
export function toHash(model) {
  const parts = [model.catalog.id];
  const waza = model.program?.waza || model.quiz?.waza;
  if (waza) parts.push(waza);
  if (model.program?.current) {
    const { level, attack, technique } = model.program.current;
    parts.push("program");
    if (level >= 2) parts.push(attack);
    if (level === 3) parts.push(technique);
  }
  return `#/${parts.map(encodeURIComponent).join("/")}`;
}

// Returns { grade?, waza?, program? }; an unreadable URL gives an empty route (home).
export function parseHash(hash) {
  let parts;
  try {
    parts = String(hash || "").replace(/^#\/?/, "").split("/").filter(Boolean).map(decodeURIComponent);
  } catch {
    return {};
  }
  const [grade, waza, segment, attack, technique] = parts;
  const program = segment === "program" ? { level: technique ? 3 : attack ? 2 : 1, attack, technique } : null;
  return { grade, waza, program };
}
