// Feature "navigation": the URL is the source of truth (reload, browser back/forward).
// Owns: pending (the route waiting for the data). Does not write other slices: it publishes events.
// Publishes `RouteChanged` ({ route }: draw and program put themselves in its state) and `GradeWanted` ({ id }: the route is of another grade).
// Reacts to `Navigated` (a feature changed what the URL shows) by writing the URL.
import { parseHash, toHash } from "./route.js";

export const initialModel = {
  pending: null, // route from the URL, applied once the data is loaded
};

const routeChanged = (route) => ({ type: "RouteChanged", route });

// Applies a route: a route of another grade first loads that grade (the route waits in `pending`).
function goTo(model, route, root) {
  if (route.grade && route.grade !== root.grade.id && root.grade.list.some((candidate) => candidate.id === route.grade)) {
    return [{ pending: route }, [], [{ type: "GradeWanted", id: route.grade }]];
  }
  return [model, [], [routeChanged(route)]];
}

const messages = {
  // Browser navigation: the URL is the source of truth.
  Popped: (model, msg, root) => (root.grade.status === "ready" ? goTo(model, parseHash(msg.hash), root) : [model, []]),
};

export const navigation = {
  name: "navigation",
  init: ({ hash = "" } = {}) => [{ pending: parseHash(hash) }, []],
  update(model, msg, root) {
    if (!messages[msg.type]) throw new Error(`Unknown message : ${msg.type}`);
    return messages[msg.type](model, msg, root);
  },
  on: {
    // Once the data is loaded, the pending route is applied and written in the URL (without a history entry).
    GradesLoaded: (model) => [{ pending: null }, [], [routeChanged(model.pending || {}), { type: "Navigated", mode: "replace" }]],

    GradeLoaded: (model) => (model.pending ? [{ pending: null }, [], [routeChanged(model.pending)]] : [model, []]),

    Navigated: (model, event, root) => [model, [{ type: "Url", mode: event.mode, hash: toHash(root) }]],
  },
  effects: ({ history }) => ({
    Url: ({ mode, hash, position }) => (mode === "push" ? history.pushState({ position }, "", hash) : history.replaceState({ position }, "", hash)),
  }),
};
