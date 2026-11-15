// src/update.js

// Model and pure update: update(model, msg) → [model, commands].
// Effects (network, randomness, history) are described as commands run by the runtime.
// Each feature lives in its own module (src/features/*.js) and owns a slice of the model (`model.<name>`):
// its init, update, view and effects, composed by `combine` (src/framework/combine.js).
import { countTechniques } from "./shared/logic.js";
import { grade } from "./features/grade.js";
import { quiz } from "./features/quiz.js";
import { program } from "./features/program.js";
import { navigation } from "./features/navigation.js";
import { video } from "./features/video.js";
import { slide } from "./features/slide.js";
import { combine } from "./framework/combine.js";

// Standalone features, with their own model slice (`model.<name>`), messages `{ feature, msg }`, view and effects.
export const features = [
  grade,
  quiz,
  program,
  video,
  navigation,
  slide
];
const standalone = combine(features);

// Bulky fields of the model shown as a summary in the debug panel.
export const debugHide = {
  data: (data) => (data ? `[données : ${countTechniques(data)} techniques]` : data),
  pool: (pool) => (Array.isArray(pool) ? `[${pool.length} éléments]` : pool),
};

// Initial model: the slices of every feature (see each module for the field details).
export function initialModel() {
  return standalone.init({})[0];
}

// Initializes the model from the URL hash and history position, and starts loading the grades.
export function init({ hash = "", position = 0, skipVideoWarning = false } = {}) {
  return standalone.init({ skipVideoWarning, hash, position });
}

// Main update function: dispatches to the feature.
export const update = standalone.update;
