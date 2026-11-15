// src/framework/runtime.js
// Elm loop: message → update → view → render, then run the commands.
// The `run` function returns the `dispatch` function, which can be used to send messages to the loop.
// Optional `debug` observer: `record({ msg, before, after, cmds, events })` (`events`: published by the features, optional) after each step, and `attach({ getModel, restore })` once.
export function run({ init, update, view, render, effects, subscribe, flags, debug }) {
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
    debug?.record({ msg, before, after: next, cmds, events });
    exec(cmds);
  };
  // The dispatch function is passed to the view and the effects, and is used to send messages to the loop.
  function dispatch(msg) {
    apply(update(model, msg), msg);
  }

  debug?.attach({
    getModel: () => model,
    // Time travel: puts a past model back and redraws it (no effect is replayed).
    restore: (past) => {
      model = past;
      render(view(model), dispatch);
    },
  });
  apply(init(flags), { type: "@init" });
  subscribe?.(dispatch);

  return dispatch;
}
