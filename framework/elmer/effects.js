// framework/elmer/effects.js
//
// ============================================================================
//  Effects and subscriptions: the bridge to the outside world
// ============================================================================
//
//  `update` is pure: it never fetches, rolls a die, writes the URL or opens a
//  window. It returns commands (data) and the effects execute them.
//  This module supplies the browser services (`deps`) that effects and
//  subscriptions of the features may use.
//
//    createEffects(program, overrides?)        → table for `run({ effects })`
//    createSubscriptions(program, overrides?)  → function for `run({ subscribe })`
//
//        program = combine({ … })      (see feature.js)
//
// ----------------------------------------------------------------------------
//  1. Where the services come from
// ----------------------------------------------------------------------------
//
//        browser defaults                 overrides (tests, other environments)
//   ┌─────────────────────────────┐       ┌───────────────────────────────┐
//   │ fetchJson  fetch + res.json │       │ { fetchJson: readFromDisk,    │
//   │ random     Math.random      │       │   random: () => 0.5,          │
//   │ history    window.history   │ ◀──── │   history: fakeHistory }      │
//   │ storage    localStorage     │ wins  └───────────────────────────────┘
//   │ open       window.open      │
//   │ window     window           │
//   └─────────────┬───────────────┘
//                 ▼
//          servicesOf(overrides) = { ...defaults, ...overrides }   → `deps`
//
//    fetchJson(url)   resolves with the parsed JSON; throws `${url} : ${status}` when not ok
//
// ----------------------------------------------------------------------------
//  2. How `deps` reach the features
// ----------------------------------------------------------------------------
//
//    createEffects(program, overrides)
//        └─▶ program.effects(deps)
//               └─▶ feature.effects(deps)  → { CmdType: (cmd, dispatch) => … }   one per feature
//
//    createSubscriptions(program, overrides)
//        └─▶ program.subscribe(deps)  → (dispatch) => feature.subscribe(dispatch, deps)
//
//    A feature takes only what it needs:
//
//      effects: ({ random }) => ({ Random: (_, dispatch) => dispatch({ type: "Rolled", value: random() }) })
//      subscribe: (dispatch, { window, history }) => window.addEventListener("popstate", …)
//
// ----------------------------------------------------------------------------
//  3. Life of a command
// ----------------------------------------------------------------------------
//
//    update ──▶ cmds: [ { type: "Random" } ]
//                 │  combine tags it: { type: "Random", feature: "quiz" }
//                 ▼
//    runtime.exec ──▶ table["Random"](cmd, dispatch)
//                        │  the feature effect runs the side effect
//                        └─ dispatch({ type: "Rolled", value }) ─▶ to("quiz", msg) ─▶ update …
//
//    (the answer goes back to the feature that emitted the command)
//
// ----------------------------------------------------------------------------
//  4. Testing without a browser
// ----------------------------------------------------------------------------
//
//    createEffects(app, { fetchJson: async (url) => readJson(url), random: () => 0.1, history, open, storage })
//    createSubscriptions(app, { history, window })
//
//    Replaced services make the effects deterministic (the random draw, the
//    data, the history are under the control of the test).
//
// ----------------------------------------------------------------------------
//  Rules
// ----------------------------------------------------------------------------
//
//    - a command type is unique across all the features (otherwise `combine` throws)
//    - an effect never changes the model: it answers by dispatching a message
//    - a missing service (e.g. no `storage` in a private tab) is a feature concern: guard with `?.`
//
// ----------------------------------------------------------------------------

// Effects and subscriptions of the features of a program (the result of `combine`), with the browser services they may need (`deps`, passed to each feature).
// Every service can be replaced (tests, other environments): `overrides` wins over the browser default.
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

export const createEffects = (program, overrides = {}) => program.effects(servicesOf(overrides));

// `subscribe` argument of `run`.
export const createSubscriptions = (program, overrides = {}) => program.subscribe(servicesOf(overrides));
