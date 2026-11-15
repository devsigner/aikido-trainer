// Side effects: network, randomness, history. They receive `dispatch` and send messages back.
// Each feature module (src/update-*.js) defines its own effects (`effectHandler`); this file only composes them.
import { resolveGrade } from "./update-grade.js";
import { SKIP_VIDEO_WARNING_KEY } from "./update-video.js";
import { features } from "./update.js";
import { combine } from "./framework/combine.js";
import { effectHandler as historyEffects } from "./update-history.js";

export { resolveGrade, SKIP_VIDEO_WARNING_KEY };
export const DEBUG_KEY = "aikido.debug";

const defaultFetchJson = async (url) => {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`${url} : ${res.status}`);
  return res.json();
};

export function createEffects({ fetchJson = defaultFetchJson, random = Math.random, history = globalThis.history, storage = globalThis.localStorage, open = globalThis.open } = {}) {
  const deps = { fetchJson, random, history, storage, open };
  return { ...combine(features).effects(deps), ...historyEffects(deps) };
}
