// framework/elmer/runtime.js

// Elm loop: message → update → view → render, then run the commands.
// The `run` function returns the `dispatch` function, which can be used to send messages to the loop.
// Debugging is delegated to devtools.js: `devtools` = { slices, hide } mounts the panel and the `__elmer` console API;
// `debug` = optional explicit observer: `record({ msg, before, after, cmds, events })` after each step, and `attach({ getModel, restore })` once.
import { createDevtools } from "./devtools.js";
import { settingsFromEnvironment } from "./elmer.js";

export function run({ init, update, view, render, effects, subscribe, flags, debug, devtools }) {
  let model;

  const exec = (cmds) =>
    cmds.forEach((cmd) => {
      if (!effects[cmd.type]) throw new Error(`Unknown effect : ${cmd.type}`);
      effects[cmd.type](cmd, dispatch);
    });

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
      // Time travel: puts a past model back and redraws it (no effect is replayed). The settings of the framework (`elmer`) stay as they are.
      restore: (past) => {
        model = model.elmer ? { ...past, elmer: model.elmer } : past;
        render(view(model), dispatch);
      },
      dispatch,
    },
  });
  apply(init({ ...flags, elmer: settingsFromEnvironment() }), { type: "@init" });
  subscribe?.(dispatch);

  return dispatch;
}
