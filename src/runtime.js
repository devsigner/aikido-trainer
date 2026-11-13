// Elm loop: message → update → view → render, then run the commands.
export function run({ init, update, view, render, effects, subscribe, flags }) {
  let model;
  const exec = (cmds) =>
    cmds.forEach((cmd) => {
      if (!effects[cmd.type]) throw new Error(`Unknown effect : ${cmd.type}`);
      effects[cmd.type](cmd, dispatch);
    });
  const apply = ([next, cmds]) => {
    model = next;
    render(view(model), dispatch);
    exec(cmds);
  };
  function dispatch(msg) {
    apply(update(model, msg));
  }
  apply(init(flags));
  subscribe?.(dispatch);
  return dispatch;
}
