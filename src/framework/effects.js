// Effects table of the features, with the browser services they may need (`deps`, passed to each feature's `effects(deps)`).
// Every service can be replaced (tests, other environments): `overrides` wins over the browser default.
import { combine } from "./combine.js";

const defaultFetchJson = async (url) => {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`${url} : ${res.status}`);
  return res.json();
};

export function createEffects(features, overrides = {}) {
  const deps = {
    fetchJson: defaultFetchJson,
    random: Math.random,
    history: globalThis.history,
    storage: globalThis.localStorage,
    open: globalThis.open,
    ...overrides,
  };
  return combine(features).effects(deps);
}
