// src/elmer/effects.js

// Effects and subscriptions of the features, with the browser services they may need (`deps`, passed to each feature).
// Every service can be replaced (tests, other environments): `overrides` wins over the browser default.
import { combine } from "./combine.js";

const defaultFetchJson = async (url) => {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`${url} : ${res.status}`);
  return res.json();
};

const servicesOf = (overrides) => ({
  fetchJson: defaultFetchJson,
  random: Math.random,
  history: globalThis.history,
  storage: globalThis.localStorage,
  open: globalThis.open,
  window: globalThis.window,
  ...overrides,
});

export const createEffects = (features, overrides = {}) => combine(features).effects(servicesOf(overrides));

// `subscribe` argument of `run`.
export const createSubscriptions = (features, overrides = {}) => combine(features).subscribe(servicesOf(overrides));
