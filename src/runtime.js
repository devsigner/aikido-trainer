// Elm loop: message → update → view → render, then run the commands.
// The `run` function returns the `dispatch` function, which can be used to send messages to the loop.
export function run({ init, update, view, render, effects, subscribe, flags }) {
  let model;

  const exec = (cmds) =>
    cmds.forEach((cmd) => {
      if (!effects[cmd.type]) throw new Error(`Unknown effect : ${cmd.type}`);
      effects[cmd.type](cmd, dispatch);
    });

  // Apply the next model and commands, then render the view and execute the commands.
  const apply = ([next, cmds]) => {
    model = next;
    render(view(model), dispatch);
    exec(cmds);
  };
  // The dispatch function is passed to the view and the effects, and is used to send messages to the loop.
  function dispatch(msg) {
    apply(update(model, msg));
  }

  apply(init(flags));
  subscribe?.(dispatch);

  return dispatch;
}
