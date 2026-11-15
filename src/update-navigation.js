// Feature "navigation": the URL is the source of truth (reload, browser back/forward).
// Owns: pending. Orchestrates the draw and program features to put the model in the state of a route.
import { WAZA_ORDER } from "./logic.js";
import { loadGrade } from "./update-grade.js";
import { screenOf, url } from "./update-history.js";
import { parseHash } from "./route.js";
import { initialModel as drawModel, roll, startSession } from "./update-draw.js";
import { initialModel as programModel, validProgram } from "./update-program.js";

export const initialModel = {
  pending: null, // route from the URL, applied once the data is loaded
};

// Puts the model in the state described by the route (the grade data must be loaded).
export function applyRoute(model, route) {
  // Unknown waza → home, unknown program → level above.
  if (!WAZA_ORDER.includes(route.waza)) return [{ ...model, draw: drawModel, program: programModel }, []];

  const base = screenOf(model) !== "home" && model.draw.waza === route.waza ? model : { ...model, draw: startSession(model, route.waza), program: programModel };
  const at = validProgram(base.grade.data, route);

  const next = { ...base, program: { at } };
  const { current, done, pool } = next.draw;
  const needsDraw = !at && !current && !done && pool.length > 0;

  return [next, needsDraw ? [roll] : []];
}

// A route of another grade first loads that grade (the route waits in `pending`).
function goTo(model, route) {
  const grade = model.grade.list.find((candidate) => candidate.id === route.grade);
  if (grade && grade.id !== model.grade.id) return [{ ...model, grade: { ...model.grade, id: grade.id }, pending: route }, [loadGrade(grade)]];
  return applyRoute(model, route);
}

export const updateHandler = {
  // Browser navigation: the URL is the source of truth.
  Popped: (model, msg) => (model.grade.status === "ready" ? goTo(model, parseHash(msg.hash)) : [model, []]),
};

// Reactions to the events of the standalone features (the model is still flat here): once the data is loaded, the pending route is applied.
export const reactions = {
  GradesLoaded(model) {
    const [next, cmds] = applyRoute({ ...model, pending: null }, model.pending || {});
    return [next, [url(next, "replace"), ...cmds]];
  },

  // A feature changed what the URL shows.
  Navigated: (model, event) => [model, [url(model, event.mode)]],

  GradeLoaded: (model) => (model.pending ? applyRoute({ ...model, pending: null }, model.pending) : [model, []]),
};
