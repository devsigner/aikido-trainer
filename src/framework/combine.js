// Generic composition of features (no knowledge of the application).
//
// A feature is a small Elm program:
//   {
//     name,                              // key of its slice in the root model
//     init(flags) → [model, cmds, events?],
//     update(model, msg, root) → [model, cmds, events?],
//     on: { EventType: (model, event, root) → [model, cmds, events?] },   // reactions to events of other features
//     effects(deps) → { CmdType: (cmd, dispatch) => … },                 // `dispatch` sends messages to this feature
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

export function combine(features) {
  const byName = new Map(features.map((feature) => [feature.name, feature]));
  if (byName.size !== features.length) throw new Error("Duplicate feature name");

  // Applies a feature result to the root model: writes its slice, tags its commands, queues its events.
  const apply = (state, name, [slice, cmds = [], events = []]) => {
    state.model = { ...state.model, [name]: slice };
    state.cmds.push(...cmds.map((cmd) => ({ ...cmd, feature: name })));
    state.events.push(...events.map((event) => ({ event, from: name })));
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
        apply(state, feature.name, reaction(state.model[feature.name], event, state.model));
      }
      state.delivered.push({ event, from, handledBy });
    }
    return [state.model, state.cmds, state.delivered];
  };

  const start = (model) => ({ model, cmds: [], events: [], delivered: [] });

  return {
    init(flags) {
      const state = start({});
      for (const feature of features) apply(state, feature.name, feature.init(flags));
      return settle(state);
    },

    update(model, { feature: name, msg }) {
      const feature = byName.get(name);
      if (!feature) throw new Error(`Unknown feature: ${name}`);
      const state = start(model);
      apply(state, name, feature.update(model[name], msg, model));
      return settle(state);
    },

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
    const wrap = (msg) => to(feature, msg);
    const props = Object.fromEntries(Object.entries(vnode.props).map(([key, value]) =>
      key.startsWith("on") ? [key, typeof value === "function" ? (event) => wrap(value(event)) : wrap(value)] : [key, value]));
    return { ...vnode, props, children: vnode.children.map((child) => embed(feature, child)) };
  }
  return vnode;
}
