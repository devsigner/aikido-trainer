// src/features/navigation.js

// Feature "navigation": the URL is the source of truth (reload, browser back/forward).
// Owns: pending (the route waiting for the data) and position (index of the current history entry, tells back from forward).
// Does not write other slices: it publishes events.
// Publishes `HomeRequested` (quiz and program close), `RouteChanged` ({ route }: quiz and program put themselves in its state) and `GradeWanted` ({ id }: the route is of another grade).
// Reacts to `Navigated` (a feature changed what the URL shows) by writing the URL, stamped with the position (+1 on a push).
import { parseHash, toHash } from "../route.js";
import { screenOf } from "../shared/screen.js";

export const initialModel = {
  pending: null, // route from the URL, applied once the data is loaded
  position: 0, // index of the current history entry
};

// Event published by a feature when the URL must follow its change (`mode`: "push" | "replace").
export const navigated = (mode) => ({ type: "Navigated", mode });

// `direction` ("back" | "forward") is only known for a browser pop: the cards slide that way (no slide otherwise).
const routeChanged = (route, direction) => ({ type: "RouteChanged", route, direction });

// Applies a route: a route of another grade first loads that grade (the route waits in `pending`).
function goTo(model, route, root, direction) {
  if (route.grade && route.grade !== root.grade.id && root.grade.list.some((candidate) => candidate.id === route.grade)) {
    return [{ pending: route }, [], [{ type: "GradeWanted", id: route.grade }]];
  }
  return [model, [], [routeChanged(route, direction)]];
}

const messages = {
  GoHome: (model, _, root) => (screenOf(root) === "home" ? [model, []] : [model, [], [{ type: "HomeRequested" }, navigated("push")]]),

  // Browser navigation: the URL is the source of truth.
  Popped(model, msg, root) {
    const next = { ...model, position: msg.position };
    return root.grade.status === "ready" ? goTo(next, parseHash(msg.hash), root, msg.position < model.position ? "back" : "forward") : [next, []];
  },
};

export const navigation = {
  name: "navigation",
  init: ({ hash = "", position = 0 } = {}) => [{ pending: parseHash(hash), position }, []],
  update(model, msg, root) {
    if (!messages[msg.type]) throw new Error(`Unknown message : ${msg.type}`);
    return messages[msg.type](model, msg, root);
  },
  on: {
    // Once the data is loaded, the pending route is applied and written in the URL (without a history entry).
    GradesLoaded: (model) => [{ ...model, pending: null }, [], [routeChanged(model.pending || {}), { type: "Navigated", mode: "replace" }]],

    GradeLoaded: (model) => (model.pending ? [{ ...model, pending: null }, [], [routeChanged(model.pending)]] : [model, []]),

    Navigated(model, { mode }, root) {
      const position = model.position + (mode === "push" ? 1 : 0);
      return [{ ...model, position }, [{ type: "Url", mode, hash: toHash(root), position }]];
    },
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
};
