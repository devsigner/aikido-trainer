// Model and pure update: update(model, msg) → [model, commands].
// Effects (network, randomness, history) are described as commands run by the runtime.
// Each feature lives in its own module (src/update-*.js) and owns a slice of the (flat) model
// plus the handlers of its messages: handler(model, msg) → [model, commands].
import { parseHash } from "./route.js";
import { initialModel as grade, updateHandler as gradeHandlers } from "./update-grade.js";
import { noSession, updateHandler as drawHandlers } from "./update-draw.js";
import { updateHandler as programHandlers } from "./update-program.js";
import { initialModel as navigation, updateHandler as navigationHandlers } from "./update-navigation.js";
import { initialModel as video, updateHandler as videoHandlers } from "./update-video.js";
import { initialModel as history, withPosition, withSlide } from "./update-history.js";

// Message type → handler. Each type belongs to exactly one feature.
const handlers = { ...gradeHandlers, ...drawHandlers, ...programHandlers, ...navigationHandlers, ...videoHandlers };

// Initial model: the slices of every feature (see each module for the field details).
export function initialModel() {
  return {
    ...grade,
    ...noSession(),
    ...navigation,
    ...video,
    ...history
  };
}

// Initializes the model from the URL hash and history position, and starts loading the grades.
export function init({ hash = "", position = 0, skipVideoWarning = false } = {}) {
  const pending = parseHash(hash);
  return [{ ...initialModel(), pending, position, skipVideoWarning }, [{ type: "LoadGrades", gradeId: pending.grade }]];
}

// Main update function: dispatches to the feature handler, then applies the history concerns.
export function update(model, msg) {
  const handler = handlers[msg.type];
  if (!handler) throw new Error(`Unknown message : ${msg.type}`);
  const [next, commands] = withPosition(model, handler(model, msg), msg);
  return [withSlide(model, next, msg), commands];
}
