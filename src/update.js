// Model and pure update: update(model, msg) → [model, commands].
// Effects (network, randomness, history) are described as commands run by the runtime.
import { WAZA_ORDER, buildPool, listAttacks, listTechniques, pickIndex } from "./logic.js";
import { parseHash, toHash } from "./route.js";

// State of a draw session; `program` = { level, attack?, technique? }.
const noSession = () => ({ screen: "home", waza: "", pool: [], total: 0, current: null, done: false, program: null });

export const initialModel = () => ({
  status: "loading", // loading | ready | error
  error: "",
  grades: [], // [{ id, label, file, includes?, count }]
  gradeId: "",
  data: null,
  filters: { isNew: false, isWarning: false },
  ...noSession(),
  pending: null, // route from the URL, applied once the data is loaded
});

export const init = ({ hash = "" } = {}) => {
  const pending = parseHash(hash);
  return [{ ...initialModel(), pending }, [{ type: "LoadGrades", gradeId: pending.grade }]];
};

const session = (model, waza) => {
  const pool = buildPool(model.data, waza, model.filters);
  return { ...model, ...noSession(), screen: "draw", waza, pool, total: pool.length };
};

const url = (model, mode) => ({ type: "Url", mode, hash: toHash(model) });

// URL route narrowed to what the data contains (unknown attack or technique → level above).
const validProgram = (data, { waza, program }) => {
  if (!program) return null;
  const attack = listAttacks(data, waza).find((candidate) => candidate.name === program.attack);
  if (!attack) return { level: 1 };
  const technique = listTechniques(data, waza, attack.name).find((candidate) => candidate.name === program.technique);
  return technique ? { level: 3, attack: attack.name, technique: technique.name } : { level: 2, attack: attack.name };
};

// Puts the model in the state described by the route (the grade data must be loaded).
const applyRoute = (model, route) => {
  if (!WAZA_ORDER.includes(route.waza)) return [{ ...model, ...noSession() }, []];
  const base = model.screen !== "home" && model.waza === route.waza ? model : session(model, route.waza);
  const program = validProgram(base.data, route);
  const next = program ? { ...base, screen: "program", program } : { ...base, screen: "draw", program: null };
  const needsDraw = next.screen === "draw" && !next.current && !next.done && next.pool.length > 0;
  return [next, needsDraw ? [{ type: "Random" }] : []];
};

const goTo = (model, route) => {
  const grade = model.grades.find((candidate) => candidate.id === route.grade);
  if (grade && grade.id !== model.gradeId) return [{ ...model, gradeId: grade.id, pending: route }, [{ type: "LoadGrade", grade }]];
  return applyRoute(model, route);
};

export function update(model, msg) {
  switch (msg.type) {
    case "GradesLoaded": {
      const ready = { ...model, status: "ready", grades: msg.grades, gradeId: msg.gradeId, data: msg.data, pending: null };
      const [next, cmds] = applyRoute(ready, model.pending || {});
      return [next, [url(next, "replace"), ...cmds]];
    }
    case "Failed":
      return [{ ...model, status: "error", error: msg.message }, []];
    case "SelectGrade": {
      const grade = model.grades.find((candidate) => candidate.id === msg.id);
      const next = { ...model, gradeId: msg.id };
      return [next, [{ type: "LoadGrade", grade }, url(next, "replace")]];
    }
    case "GradeLoaded":
      // Stale response if the user changed grade in the meantime.
      if (msg.id !== model.gradeId) return [model, []];
      return model.pending ? applyRoute({ ...model, data: msg.data, pending: null }, model.pending) : [{ ...model, data: msg.data }, []];
    case "SetFilter":
      return [{ ...model, filters: { ...model.filters, [msg.name]: msg.checked } }, []];
    case "StartSession": {
      const next = session(model, msg.waza);
      return [next, [url(next, "push"), { type: "Random" }]];
    }
    case "Next":
      return model.pool.length === 0
        ? [{ ...model, current: null, done: true }, []]
        : [model, [{ type: "Random" }]];
    case "Rolled": {
      if (model.screen !== "draw" || model.pool.length === 0) return [model, []];
      const index = pickIndex(model.pool, msg.value);
      return [{ ...model, current: model.pool[index], pool: model.pool.filter((_, poolIndex) => poolIndex !== index) }, []];
    }
    case "GoHome": {
      if (model.screen === "home") return [model, []];
      const next = { ...model, ...noSession() };
      return [next, [url(next, "push")]];
    }
    case "OpenProgram":
    case "Navigate": {
      const program = msg.type === "OpenProgram" ? { level: 1 } : msg.to;
      const next = { ...model, screen: "program", program };
      return [next, [url(next, "push")]];
    }
    case "Back":
      return [model, [{ type: "HistoryBack" }]];
    case "Popped":
      // Browser navigation: the URL is the source of truth.
      return model.status === "ready" ? goTo(model, parseHash(msg.hash)) : [model, []];
    default:
      throw new Error(`Unknown message : ${msg.type}`);
  }
}
