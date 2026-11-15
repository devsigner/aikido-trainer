// src/framework/combine.js

// Generic composition of features (no knowledge of the application).
//
// A feature is a small Elm program:
//   {
//     name,                              // key of its slice in the root model
//     lazy?,                             // true: no slice until a message or a subscribed event reaches the feature (then `init` runs); an update or reaction returning `UNMOUNT` as model removes the slice
//     init(flags) → [model, cmds, events?],
//     update(model, msg, root) → [model, cmds, events?],
//     on: { EventType: (model, event, root) → [model, cmds, events?] },   // reactions to events of other features
//     effects(deps) → { CmdType: (cmd, dispatch) => … },                 // `dispatch` sends messages to this feature
//     subscribe(dispatch, deps),                                         // listens to the outside world (events of the browser…), `dispatch` sends messages to this feature
//   }
// `root` is the whole model, read-only: use it to read, never to write another slice.
//
// Root messages are envelopes `{ feature, msg }` (see `to`); commands are tagged with the `feature` that emitted them.
// A feature publishes events (`{ type, … }`) in the third item of its result: they are delivered, in order,
// to every feature that subscribed to them in `on`, and may publish events in turn.
// `init` and `update` return `[model, cmds, delivered]`; `delivered` lists the events for debugging: `{ event, from, handledBy }`.

const MAX_EVENTS = 1000; // an event loop is a bug: fail loudly rather than freeze the page

// Message addressed to a feature.
export const to = (feature, msg) => ({ feature, msg });

// Returned as the model by the update or a reaction of a lazy feature: its slice is removed from the root model.
// A later message or event mounts it again with `init` (the other features see `root[name]` undefined meanwhile).
export const UNMOUNT = Symbol("unmount");

// Composes several features into one root program: the slices of every feature are merged in the root model,
// and the messages of every feature are enveloped in `{ feature, msg }`.
//
// The root program is used by the runtime (src/framework/runtime.js) to run the Elm loop.
export function combine(features) {
  const byName = new Map(features.map((feature) => [feature.name, feature]));
  if (byName.size !== features.length) throw new Error("Duplicate feature name");

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
        if (!reaction) continue;
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
