// Model and pure update: update(model, msg) → [model, commands].
// Effects (network, randomness, history) are described as commands run by the runtime.
// Each feature lives in its own module (src/update-*.js) and owns a slice of the model (`model.<name>`):
// its init, update, view and effects, composed by `combine` (src/framework/combine.js).
import { grade } from "./update-grade.js";
import { draw } from "./update-draw.js";
import { program } from "./update-program.js";
import { navigation } from "./update-navigation.js";
import { video } from "./update-video.js";
import { combine } from "./framework/combine.js";
import { initialModel as history, withPosition, withSlide } from "./update-history.js";

// Standalone features, with their own model slice (`model.<name>`), messages `{ feature, msg }`, view and effects.
// Position in the history and card animation (`update-history.js`) still wrap the result of every update.
export const features = [grade, draw, program, video, navigation];
const standalone = combine(features);

// Initial model: the slices of every feature (see each module for the field details).
export function initialModel() {
  return {
    ...history,
    ...standalone.init({})[0],
  };
}

// Initializes the model from the URL hash and history position, and starts loading the grades.
export function init({ hash = "", position = 0, skipVideoWarning = false } = {}) {
  const [slices, commands, events] = standalone.init({ skipVideoWarning, hash });
  return [{ ...initialModel(), ...slices, position }, commands, events];
}

// Main update function: dispatches to the feature, then applies the history concerns.
export function update(model, msg) {
  const [stepped, commands, events = []] = standalone.update(model, msg);
  const plain = msg.feature ? msg.msg : msg; // the history concerns read the message of the feature
  const [next, stamped] = withPosition(model, [stepped, commands], plain);
  return [withSlide(model, next, plain), stamped, events];
}
