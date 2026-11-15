// framework/elmer/combine.js

// Generic composition of features (no knowledge of the application).
//
// A feature is a small Elm program, defined with `defineFeature` (its name is its key in `combine({ name: feature })`):
//   {
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
// Root messages are envelopes `{ feature, msg }` (see `to`); commands are tagged with the `feature` that emitted them.
// A feature publishes events (`{ type, … }`) in the third item of its result: they are delivered, in order,
// to every feature that subscribed to them in `on`, and may publish events in turn.
// `init` and `update` return `[model, cmds, delivered]`; `delivered` lists the events for debugging: `{ event, from, handledBy }`.

const KEYS = ["model", "lazy", "init", "messages", "on", "effects", "subscribe", "view", "views", "events"];

// Declares a feature: checks the shape (a typo in a key would otherwise be silently ignored) and returns it.
export function defineFeature(spec) {
  for (const key of Object.keys(spec)) {
    if (!KEYS.includes(key)) throw new Error(`Unknown feature key: ${key} (expected: ${KEYS.join(", ")})`);
  }
  if (!("model" in spec) && !spec.init) throw new Error("A feature needs a `model` or an `init`");
  return spec;
}

const MAX_EVENTS = 1000; // an event loop is a bug: fail loudly rather than freeze the page

// Message addressed to a feature.
export const to = (feature, msg) => ({ feature, msg });

// Returned as the model by the update or a reaction of a lazy feature: its slice is removed from the root model.
// A later message or event mounts it again with `init` (the other features see `root[name]` undefined meanwhile).
export const UNMOUNT = Symbol("unmount");

// Composes several features, an object `{ name: feature }`, into one root program: the slices of every feature are merged
// in the root model (`model[name]`, in the order of the object), and the messages of every feature are enveloped in `{ feature, msg }`.
//
// The root program is used by the runtime (framework/elmer/runtime.js) to run the Elm loop.
export function combine(definitions) {
  const features = Object.entries(definitions).map(([name, spec]) => ({
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
  const apply = (state, name, [slice, cmds = [], events = []]) => {
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
