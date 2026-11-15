// Model and pure update: update(model, msg) → [model, commands].
// Effects (network, randomness, history) are described as commands run by the runtime.
// Each feature lives in its own module (src/update-*.js) and owns a slice of the (flat) model
// plus the handlers of its messages: handler(model, msg) → [model, commands].
import { parseHash } from "./route.js";
import { initialModel as grade, updateHandler as gradeHandlers } from "./update-grade.js";
import { noSession, updateHandler as drawHandlers } from "./update-draw.js";
import { updateHandler as programHandlers } from "./update-program.js";
import { initialModel as navigation, updateHandler as navigationHandlers } from "./update-navigation.js";
import { video } from "./update-video.js";
import { combine } from "./framework/combine.js";
import { initialModel as history, withPosition, withSlide } from "./update-history.js";

// Message type → handler. Each type belongs to exactly one feature.
const handlers = { ...gradeHandlers, ...drawHandlers, ...programHandlers, ...navigationHandlers };

// Standalone features, with their own model slice (`model.<name>`), messages `{ feature, msg }`, view and effects.
// The other features are still handled by the flat model above, until they are migrated too.
export const features = [video];
const standalone = combine(features);

// Initial model: the slices of every feature (see each module for the field details).
export function initialModel() {
  return {
    ...grade,
    ...noSession(),
    ...navigation,
    ...history,
    ...standalone.init({})[0],
  };
}

// Initializes the model from the URL hash and history position, and starts loading the grades.
export function init({ hash = "", position = 0, skipVideoWarning = false } = {}) {
  const pending = parseHash(hash);
  const [slices, commands, events] = standalone.init({ skipVideoWarning });
  return [{ ...initialModel(), ...slices, pending, position }, [{ type: "LoadGrades", gradeId: pending.grade }, ...commands], events];
}

// Main update function: dispatches to the feature handler, then applies the history concerns.
export function update(model, msg) {
  const [stepped, commands, events = []] = step(model, msg);
  const [next, stamped] = withPosition(model, [stepped, commands], msg);
  return [withSlide(model, next, msg), stamped, events];
}

function step(model, msg) {
  if (msg.feature) return standalone.update(model, msg);
  const handler = handlers[msg.type];
  if (!handler) throw new Error(`Unknown message : ${msg.type}`);
  return handler(model, msg);
}
