// framework/elmer/feature.js

// Generic composition of features (no knowledge of the application).
//
// A feature is a small Elm program, defined with `defineFeature`. Write it right after the imports, like a React component:
// the handlers and views are function declarations below it (hoisted), so the definition reads first.
//   {
//     name?,                             // its name = its slice `model.<name>`; required to compose it in a list: `combine([a, b])`
//     model?,                            // initial slice of the model (without flags and commands)
//     lazy?,                             // true: no slice until a message or a subscribed event reaches the feature (then `init` runs);
//                                        // { events: [types] }: only a message or these events create it, the other events are ignored while it is unmounted;
//                                        // an update or reaction returning `UNMOUNT` as model removes the slice
//     init?(flags, model) → [model, cmds, events?],     // when the initial model depends on the flags or starts commands (`model` = the one above)
//     messages: { Type: (model, msg, root) → [model, cmds, events?] },   // the messages of the feature, the `update` is generated from it
//     on: { EventType: (model, event, root) → [model, cmds, events?] },   // reactions to events of other features
//     effects(deps) → { CmdType: (cmd, dispatch) => … },                 // `dispatch` sends messages to this feature
//     subscribe(dispatch, deps),                                         // listens to the outside world (events of the browser…), `dispatch` sends messages to this feature
//     view?, views?,                                                     // main view of the feature, other views (`views: { picker }`) for the other features
//     events?,                                                           // constructors of the events it publishes (`events: { navigated }`)
//   }
// `root` is the whole model, read-only: use it to read, never to write another slice.
//
// A handler (`messages`, `on`, `init`) may return, instead of the full `[model, [cmds], [events]]`:
//   model  |  [model]  |  [model, cmds]  |  [model, cmds, events]      (`cmds` and `events`: one item or a list)
// `cmd(type, props)` and `emit(type, props)` build `{ type, ...props }`.
//
// Root messages are envelopes `{ feature, msg }` (see `to`); commands are tagged with the `feature` that emitted them.
// A feature publishes events (`{ type, … }`) in the third item of its result: they are delivered, in order,
// to every feature that subscribed to them in `on`, and may publish events in turn.
// `init` and `update` return `[model, cmds, delivered]`; `delivered` lists the events for debugging: `{ event, from, handledBy }`.
//
// ============================================================================
//  Understanding features
// ============================================================================
//
//  Public API:
//    defineFeature(spec)      checks the shape of a feature and returns it
//    combine([feature] | { name: feature })  composes the features into one root program { init, update, subscribe, effects }
//    cmd(type, props)         builds a command { type, ...props }
//    emit(type, props)        builds an event { type, ...props }
//    embed(name, vnode)       envelopes the handlers of a feature view
//    to(name, msg)            builds the envelope { feature, msg }
//    UNMOUNT                  value to return as a model to remove the slice of a lazy feature
//
// ----------------------------------------------------------------------------
//  1. One root model, one slice per feature
// ----------------------------------------------------------------------------
//
//    combine({ catalog, quiz, program })
//
//      root model = {  catalog: <slice of catalog>,
//                      quiz:    <slice of quiz>,        (lazy: only while used)
//                      program: <slice of program>,     (lazy)
//                      elmer:   <settings of the framework, added by combine> }
//
//    A feature only writes its own slice. To read another one it uses `root`
//    (third argument of its handlers). To act on another feature, it publishes an event.
//
// ----------------------------------------------------------------------------
//  2. Messages: addressed to ONE feature
// ----------------------------------------------------------------------------
//
//    view handler          envelope                 root update
//    onclick: { type: "Next" }
//        │  embed("quiz", …)                          │
//        └──▶ { feature: "quiz", msg: { type: "Next" } } ──▶ combine.update
//                                                            │ messages.Next(slice, msg, root)
//                                                            ▼
//                                              [ slice', cmds, events ]
//
//    - the feature view only knows its own messages: `embed` adds the envelope
//    - a message that already has a `feature` (a button of another feature) is left as it is
//    - an unknown message type or feature name throws
//
// ----------------------------------------------------------------------------
//  3. Events: published by one feature, heard by the others (illustrative example)
// ----------------------------------------------------------------------------
//
//    messages.OpenProgram = (slice) => [slice, [], [ { type: "ProgramOpened" } ]]
//                                                         │
//                       settle(): delivered in order to every feature that has `on.ProgramOpened`
//                                                         │
//            ┌────────────────────┬───────────────────────┴──────┐
//            ▼                    ▼                              ▼
//       quiz.on.ProgramOpened  program.on.ProgramOpened   navigation.on.ProgramOpened
//       (→ UNMOUNT)            (mounts, shows attacks)    (→ push URL command)
//
//    - a reaction returns [slice, cmds, events] too: events can chain
//    - the queue is processed until empty; more than 1000 events = bug (throws)
//    - `delivered` ({ event, from, handledBy }) is returned for the debugger
//
// ----------------------------------------------------------------------------
//  4. One step of the root update
// ----------------------------------------------------------------------------
//
//    update(model, { feature, msg })
//      1. mount(feature)                       lazy and without slice → init first
//      2. apply(feature.update(slice, msg, root))
//           ├─ slice === UNMOUNT ? remove it : write it in the root model
//           ├─ cmds   += tagged with { feature }
//           └─ events += queued with { from }
//      3. settle(): deliver the events (each reaction is applied the same way)
//      4. return [root model, cmds, delivered]
//
// ----------------------------------------------------------------------------
//  5. Lazy features
// ----------------------------------------------------------------------------
//
//    lazy: true               slice created by the first message or ANY event it listens to
//    lazy: { events: [...] }  created only by a message or those events
//                             (the other events are ignored while it is unmounted)
//
//        (no slice) ──message / event──▶ init(flags) ──▶ slice ──UNMOUNT──▶ (no slice)
//
//    Other features see `root.quiz === undefined` while it is unmounted:
//    read it with `?.`.
//
// ----------------------------------------------------------------------------
//  6. Commands and subscriptions
// ----------------------------------------------------------------------------
//
//    cmds     { type: "Random", … } described as data, tagged with the feature
//             that emitted it. combine.effects(deps) merges the effects of all
//             the features in one table (a duplicate type throws); the answer of
//             an effect is sent back to the same feature:
//
//               effect(cmd, dispatch) ─ dispatch(msg) ─▶ to(cmd.feature, msg)
//
//    subscribe(dispatch, deps)   listens to the outside world (popstate…);
//             `dispatch(msg)` is already addressed to the feature.
//
// ----------------------------------------------------------------------------
//  7. The `elmer` feature
// ----------------------------------------------------------------------------
//
//    Reserved name, added last by combine (settings of the debugger, see elmer.js).
//    Declaring a feature called `elmer` throws.
//
// ----------------------------------------------------------------------------
//  8. Checks done by defineFeature
// ----------------------------------------------------------------------------
//
//    - unknown key (typo: `message` instead of `messages`) → error, not ignored
//    - neither `model` nor `init` → error

import { feature as elmer } from "./elmer.js";

const KEYS = ["name", "model", "lazy", "init", "messages", "on", "effects", "subscribe", "view", "views", "events"];

// Declares a feature: checks the shape (a typo in a key would otherwise be silently ignored) and returns it.
export function defineFeature(spec) {
  for (const key of Object.keys(spec)) {
    if (!KEYS.includes(key)) throw new Error(`Unknown feature key: ${key} (expected: ${KEYS.join(", ")})`);
  }
  if (!("model" in spec) && !spec.init) throw new Error("A feature needs a `model` or an `init`");
  return spec;
}

const MAX_EVENTS = 1000; // an event loop is a bug: fail loudly rather than freeze the page

// Command and event constructors: `cmd("Random")` = `{ type: "Random" }`, `emit("ProgramOpened", { waza })` = `{ type: "ProgramOpened", waza }`.
export const cmd = (type, props) => ({ type, ...props });
export const emit = cmd;

// A handler may return a short form: the model alone, `[model]`, `[model, cmds]` or `[model, cmds, events]`,
// where `cmds` and `events` may be a single item or a list. The full form is always `[model, [cmds], [events]]`.
const asList = (value) => (value === undefined ? [] : Array.isArray(value) ? value : [value]);
export function normalize(result) {
  if (!Array.isArray(result)) return [result, [], []];
  const [model, cmds, events] = result;
  return [model, asList(cmds), asList(events)];
}

// Message addressed to a feature.
export const to = (feature, msg) => ({ feature, msg });

// Returned as the model by the update or a reaction of a lazy feature: its slice is removed from the root model.
// A later message or event mounts it again with `init` (the other features see `root[name]` undefined meanwhile).
export const UNMOUNT = Symbol("unmount");

// Composes several features, an object `{ name: feature }`, into one root program: the slices of every feature are merged
// in the root model (`model[name]`, in the order of the object), and the messages of every feature are enveloped in `{ feature, msg }`.
//
// `definitions` is an object `{ name: feature }`, or a list of features that declare their own `name`.
// The feature `elmer` (the settings of the framework, see elmer.js) is added to the application features.
//
// The root program is used by the runtime (framework/elmer/runtime.js) to run the Elm loop.
export function combine(definitions) {
  const named = Array.isArray(definitions)
    ? definitions.map((spec) => {
        if (!spec.name) throw new Error("A feature composed in a list needs a `name`");
        return [spec.name, spec];
      })
    : Object.entries(definitions);
  const names = named.map(([name]) => name);
  if (names.includes("elmer")) throw new Error("The feature name `elmer` is reserved by the framework");
  const duplicate = names.find((name, index) => names.indexOf(name) !== index);
  if (duplicate) throw new Error(`Duplicate feature name: ${duplicate}`);
  const features = [...named, ["elmer", elmer]].map(([name, spec]) => ({
    ...defineFeature(spec),
    name,
    init: (flags) => (spec.init ? spec.init(flags, spec.model) : [spec.model, []]),
    update(model, msg, root) {
      const handler = spec.messages?.[msg.type];
      if (!handler) throw new Error(`Unknown message : ${msg.type}`);
      return handler(model, msg, root);
    },
  }));
  const byName = new Map(features.map((feature) => [feature.name, feature]));

  // Applies a feature result to the root model: writes its slice, tags its commands, queues its events.
  const apply = (state, name, result) => {
    const [slice, cmds, events] = normalize(result);
    if (slice === UNMOUNT) {
      state.model = Object.fromEntries(Object.entries(state.model).filter(([key]) => key !== name));
    } else {
      state.model = { ...state.model, [name]: slice };
    }
    state.cmds.push(...cmds.map((cmd) => ({ ...cmd, feature: name })));
    state.events.push(...events.map((event) => ({ event, from: name })));
  };

  // An unmounted lazy feature only reacts to the events that may mount it.
  const awake = (state, feature, type) => !feature.lazy || feature.name in state.model || feature.lazy === true || feature.lazy.events?.includes(type);

  // A lazy feature without slice is mounted (with the flags of `init`) before it handles a message or an event.
  const mount = (state, feature) => {
    if (feature.lazy && !(feature.name in state.model)) apply(state, feature.name, feature.init(flags));
  };

  // Delivers the queued events until none is left.
  const settle = (state) => {
    for (let count = 0; state.events.length > 0; count++) {
      if (count >= MAX_EVENTS) throw new Error(`Event loop: more than ${MAX_EVENTS} events (last: ${state.events[0].event.type})`);
      const { event, from } = state.events.shift();
      const handledBy = [];
      for (const feature of features) {
        const reaction = feature.on?.[event.type];
        if (!reaction || !awake(state, feature, event.type)) continue;
        handledBy.push(feature.name);
        mount(state, feature);
        apply(state, feature.name, reaction(state.model[feature.name], event, state.model));
      }
      state.delivered.push({ event, from, handledBy });
    }
    return [state.model, state.cmds, state.delivered];
  };

  let flags = {}; // the flags of `init`, for the lazy features mounted later

  const start = (model) => ({ model, cmds: [], events: [], delivered: [] });

  return {
    init(initFlags) {
      flags = initFlags;
      const state = start({});
      for (const feature of features) if (!feature.lazy) apply(state, feature.name, feature.init(flags));
      return settle(state);
    },

    update(model, { feature: name, msg }) {
      const feature = byName.get(name);
      if (!feature) throw new Error(`Unknown feature: ${name}`);
      const state = start(model);
      mount(state, feature);
      apply(state, name, feature.update(state.model[name], msg, state.model));
      return settle(state);
    },

    // Starts the subscriptions of every feature; each one dispatches to its own feature.
    subscribe: (deps) => (dispatch) => features.forEach((feature) => feature.subscribe?.((msg) => dispatch(to(feature.name, msg)), deps)),

    // Effects of every feature in one table; each effect answers to its own feature.
    effects(deps) {
      const table = {};
      for (const feature of features) {
        for (const [type, run] of Object.entries(feature.effects?.(deps) ?? {})) {
          if (table[type]) throw new Error(`Duplicate effect: ${type}`);
          table[type] = (cmd, dispatch) => run(cmd, (msg) => dispatch(to(cmd.feature, msg)));
        }
      }
      return table;
    },
  };
}

// Embeds the view of a feature in the root view: its handlers (messages or functions returning messages)
// are enveloped, so that the feature view only knows its own messages.
export function embed(feature, vnode) {
  if (typeof vnode !== "string" && vnode) {
    // A message already addressed to a feature (e.g. a button of another feature) is left as it is.
    const wrap = (msg) => (msg?.feature ? msg : to(feature, msg));
    const props = Object.fromEntries(Object.entries(vnode.props).map(([key, value]) =>
      key.startsWith("on") ? [key, typeof value === "function" ? (event) => wrap(value(event)) : wrap(value)] : [key, value]));
    return { ...vnode, props, children: vnode.children.map((child) => embed(feature, child)) };
  }
  return vnode;
}
