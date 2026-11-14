// Feature "draw": a session of random techniques for one waza (pool without repetition).
// Owns: screen (home | draw), waza, pool, total, current, done.
import { buildPool, pickIndex } from "./logic.js";
import { initialModel as programModel } from "./update-program.js";
import { url } from "./update-history.js";

// State of a draw session. The model is reset to this state when the user goes home or changes waza.
// - `screen` = "home" | "draw" | "program"
// - `waza` = "Tachi waza" | "Hanmi Handachi waza" | "Suwari waza"
// - `pool` = list of remaining techniques to draw (weighted)
// - `total` = total number of techniques in the pool at the start of the session
// - `current` = technique currently drawn (null if none) e.g. { waza, attack, technique, form, weight }
// - `done` = true if the pool is empty and the user has seen all techniques
export function noSession() {
  return { screen: "home", waza: "", pool: [], total: 0, current: null, done: false, ...programModel };
}

export function session(model, waza) {
  const pool = buildPool(model.data, waza, model.filters);
  return { ...model, ...noSession(), screen: "draw", waza, pool, total: pool.length };
}

export const updateHandler = {
  StartSession(model, msg) {
    const next = session(model, msg.waza);
    return [next, [url(next, "push"), { type: "Random" }]];
  },

  Next(model) {
    return model.pool.length === 0
      ? [{ ...model, current: null, done: true }, []]
      : [model, [{ type: "Random" }]];
  },

  // Answer of the `Random` effect: randomness is an effect, so `update` stays pure.
  Rolled(model, msg) {
    if (model.screen !== "draw" || model.pool.length === 0) return [model, []];
    const index = pickIndex(model.pool, msg.value);
    return [{ ...model, current: model.pool[index], pool: model.pool.filter((_, poolIndex) => poolIndex !== index) }, []];
  },

  GoHome(model) {
    if (model.screen === "home") return [model, []];
    const next = { ...model, ...noSession() };
    return [next, [url(next, "push")]];
  },
};
