// framework/elmer/elmer.js

// Feature "elmer": the settings and configuration of the framework itself, in the slice `model.elmer`.
// It is added by `combine` to every application (the application does not declare it, and cannot use this name).
// Settings:
// - `debug` = "on" | "off": the debugger panel. Messages `DebugOn` / `DebugOff`; devtools.js mounts or unmounts the panel when it changes.
// - `persist` = true | false: whether `debug` is saved in the storage. Messages `PersistOn` (saves the current choice) / `PersistOff` (forgets the saved choice). Not saved itself: it is true at each start.
// - `historySize` = number of steps kept for the debugger.
// While `persist` is true, a choice made by the user is saved in the storage (`elmer.<key>`) and read again at the next start (see `settingsFromEnvironment`).
// A plain spec (not `defineFeature`): feature.js imports this module, `combine` validates it like any other feature.

const STORAGE_PREFIX = "elmer.";
const isLocal = () => /^(localhost|127\..*|\[::1\]|.*\.local)$/.test(globalThis.location?.hostname ?? "");

// Settings that depend on the environment: the saved choice, else the default (the debugger is on for a local host).
// Called by `run`, which gives them to the feature as `flags.elmer`.
export function settingsFromEnvironment() {
  let debug = null;
  try { debug = globalThis.localStorage?.getItem(`${STORAGE_PREFIX}debug`); } catch { /* storage unavailable */ }
  return { debug: debug === "on" || debug === "off" ? debug : isLocal() ? "on" : "off" };
}

const setDebug = (debug) => (model) => [{ ...model, debug }, model.persist ? [{ type: "SaveSetting", key: "debug", value: debug }] : []];

export const feature = {
  model: { debug: "off", persist: true, historySize: 200 },
  init: (flags, model) => [{ ...model, ...flags?.elmer }, []],
  messages: {
    DebugOn: setDebug("on"),
    DebugOff: setDebug("off"),
    PersistOn: (model) => [{ ...model, persist: true }, [{ type: "SaveSetting", key: "debug", value: model.debug }]],
    PersistOff: (model) => [{ ...model, persist: false }, [{ type: "ForgetSetting", key: "debug" }]],
  },
  effects: (deps) => ({
    ForgetSetting({ key }) {
      try { deps?.storage?.removeItem(`${STORAGE_PREFIX}${key}`); } catch { /* storage unavailable */ }
    },
    SaveSetting({ key, value }) {
      try { deps?.storage?.setItem(`${STORAGE_PREFIX}${key}`, value); } catch { /* storage unavailable: the choice is not kept */ }
    },
  }),
};
