// framework/elmer/runtime.js
//
// ============================================================================
//  Runtime: the Elm loop
// ============================================================================
//
//  run({ init, update, view, render, effects, subscribe, flags, debug, devtools })
//  wires the pure pieces of the app together and returns `dispatch`.
//
//      ┌───────────────────────────────────────────────────────────────┐
//      │                                                               │
//      │   msg ──▶ update(model, msg) ──▶ [ model', cmds, events ]     │
//      │                                        │      │               │
//      │                       view(model') ◀───┘      │               │
//      │                           │                   │               │
//      │                     render(vnode, dispatch)   │               │
//      │                           │                   ▼               │
//      │                           ▼              effects[cmd.type]    │
//      │                       real DOM            (side effects)      │
//      │                           │                   │               │
//      │      user events ─────────┴─── dispatch ◀─────┘               │
//      │   subscriptions (popstate…) ──▶ dispatch                      │
//      │                                                               │
//      └───────────────────────────────────────────────────────────────┘
//
// ----------------------------------------------------------------------------
//  Parameters
// ----------------------------------------------------------------------------
//
//    init(flags)          → [model, cmds, events?]    initial state, run once
//    update(model, msg)   → [model, cmds, events?]    pure: no DOM, network, randomness
//    view(model)          → vnode                     pure
//    render(vnode, dispatch)                          see vdom.js (createRenderer)
//    effects              { [cmd.type]: (cmd, dispatch) => void }
//                         executes a command and sends its result back with dispatch
//    subscribe(dispatch)  optional; connects outside events (popstate…) to the loop
//    flags                passed to init (environment values read at startup)
//    devtools             { hide }: debugger panel and `__elmer` console API
//    debug                optional explicit observer { record, attach }
//
// ----------------------------------------------------------------------------
//  Startup
// ----------------------------------------------------------------------------
//
//    createDevtools(…)               prepares the debugger (it may mount itself)
//    apply(init(flags), "@init")     first model, first render, first commands
//    subscribe(dispatch)             from here on, outside events send messages
//    return dispatch
//
// ----------------------------------------------------------------------------
//  One step: dispatch(msg) → apply(update(model, msg), msg)
// ----------------------------------------------------------------------------
//
//    1. model = next                  the new model replaces the old one
//    2. render(view(model))           the screen is up to date BEFORE the effects
//    3. tools.record({ msg, before, after, cmds, events })
//                                     logged before the effects run, so the
//                                     messages they send come AFTER this one
//    4. exec(cmds)                    each command → effects[cmd.type](cmd, dispatch)
//
//    An effect usually answers later (fetch, timer…) by calling dispatch,
//    which starts a new step:
//
//      Msg StartSession ─▶ update ─▶ cmds [ Random ]
//                                      └─▶ effects.Random ─▶ dispatch(Rolled 0.42)
//                                                               └─▶ update …
//
// ----------------------------------------------------------------------------
//  Errors in effects
// ----------------------------------------------------------------------------
//
//    Every command of a step is executed even if one fails. The first failure
//    is then thrown, as "Effect <type> (feature <name>) failed : <cause>"
//    (the original error is kept in `cause`). An unknown command type is a failure.
//
// ----------------------------------------------------------------------------
//  Time travel (debugger)
// ----------------------------------------------------------------------------
//
//    restore(pastModel): model = keepSettings(model, pastModel), then render.
//    The effects of the past messages are NOT replayed, and the `elmer`
//    settings (debug, persist…) of the current model are kept.
//
// ----------------------------------------------------------------------------
//  Elm loop: message → update → view → render, then run the commands.
// The `run` function returns the `dispatch` function, which can be used to send messages to the loop.
// Debugging is delegated to devtools.js: `devtools` = { hide } mounts the panel and the `__elmer` console API;
// `debug` = optional explicit observer: `record({ msg, before, after, cmds, events })` after each step, and `attach({ getModel, restore })` once.
import { createDevtools } from "./devtools.js";
import { keepSettings } from "./elmer.js";

export function run({ init, update, view, render, effects, subscribe, flags, debug, devtools }) {
  let model;

  // Every command is run even if one fails; the first failure is then reported with its command and its feature.
  const exec = (cmds) => {
    const failures = [];
    cmds.forEach((cmd) => {
      try {
        if (!effects[cmd.type]) throw new Error(`Unknown effect : ${cmd.type}`);
        effects[cmd.type](cmd, dispatch);
      } catch (cause) {
        failures.push(new Error(`Effect ${cmd.type}${cmd.feature ? ` (feature ${cmd.feature})` : ""} failed : ${cause.message}`, { cause }));
      }
    });
    if (failures.length) throw failures[0];
  };

  // Apply the next model and commands, then render the view and execute the commands.
  const apply = ([next, cmds, events = []], msg) => {
    const before = model;
    model = next;
    render(view(model), dispatch);
    // Recorded before the effects run, so that their own messages come after this one in the log.
    tools.record({ msg, before, after: next, cmds, events });
    exec(cmds);
  };
  // The dispatch function is passed to the view and the effects, and is used to send messages to the loop.
  function dispatch(msg) {
    apply(update(model, msg), msg);
  }

  const tools = createDevtools({
    config: devtools,
    observer: debug,
    control: {
      getModel: () => model,
      // Time travel: puts a past model back and redraws it (no effect is replayed). 
      restore: (past) => {
        model = keepSettings(model, past);
        render(view(model), dispatch);
      },
      dispatch,
    },
  });
  apply(init(flags), { type: "@init" });
  subscribe?.(dispatch);

  return dispatch;
}
