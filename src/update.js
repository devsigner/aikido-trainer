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
  slide: { direction: "", count: 0 }, // transition between program levels
  position: 0, // index of the current history entry (tells back from forward)
  pending: null, // route from the URL, applied once the data is loaded
  skipVideoWarning: false, // persisted preference: open videos without the confirmation
  videoPrompt: null, // { url, dontAsk } while the confirmation modal is open
});

export const init = ({ hash = "", position = 0, skipVideoWarning = false } = {}) => {
  const pending = parseHash(hash);
  return [{ ...initialModel(), pending, position, skipVideoWarning }, [{ type: "LoadGrades", gradeId: pending.grade }]];
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

const sameProgram = (from, to) => from?.level === to?.level && from?.attack === to?.attack && from?.technique === to?.technique;

const sameView = (before, after) => before.screen === after.screen && before.current === after.current && sameProgram(before.program, after.program);

// Direction of the card animation: a history pop follows the history (back or forward),
// a message may force it (`direction`), otherwise going up a program level is "back" and everything else is "forward".
const slideDirection = (before, after, msg) => {
  if (msg.direction) return msg.direction;
  if (msg.type === "Popped" && msg.position !== before.position) return msg.position < before.position ? "back" : "forward";
  return before.program && (!after.program || after.program.level < before.program.level) ? "back" : "forward";
};

const withSlide = (before, after, msg) => {
  if (before.status !== "ready" || sameView(before, after)) return after;
  return { ...after, slide: { direction: slideDirection(before, after, msg), count: after.slide.count + 1 } };
};

// Position in the history: +1 on each push, the popped entry's position on a pop. Stamped on Url commands.
const withPosition = (before, [after, commands], msg) => {
  const pushes = commands.some((command) => command.type === "Url" && command.mode === "push");
  const position = msg.type === "Popped" ? msg.position : before.position + (pushes ? 1 : 0);
  return [{ ...after, position }, commands.map((command) => (command.type === "Url" ? { ...command, position } : command))];
};

export function update(model, msg) {
  const [next, commands] = withPosition(model, step(model, msg), msg);
  return [withSlide(model, next, msg), commands];
}

function step(model, msg) {
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
    case "CloseProgram": {
      const next = { ...model, screen: "draw", program: null };
      return [next, [url(next, "push")]];
    }
    case "AskVideo":
      return [{ ...model, videoPrompt: { url: msg.url, dontAsk: false } }, []];
    case "SetDontAsk":
      return [{ ...model, videoPrompt: { ...model.videoPrompt, dontAsk: msg.checked } }, []];
    case "CancelVideo":
      return [{ ...model, videoPrompt: null }, []];
    case "ConfirmVideo": {
      const { url, dontAsk } = model.videoPrompt;
      const save = dontAsk ? [{ type: "SaveSkipVideoWarning" }] : [];
      return [{ ...model, videoPrompt: null, skipVideoWarning: model.skipVideoWarning || dontAsk }, [...save, { type: "OpenUrl", url }]];
    }
    case "Popped":
      // Browser navigation: the URL is the source of truth.
      return model.status === "ready" ? goTo(model, parseHash(msg.hash)) : [model, []];
    default:
      throw new Error(`Unknown message : ${msg.type}`);
  }
}
