// Boucle Elm : message → update → view → rendu, puis exécution des commandes.
export function run({ init, update, view, render, effects, subscribe }) {
  let model;
  const exec = (cmds) =>
    cmds.forEach((cmd) => {
      if (!effects[cmd.type]) throw new Error(`Effet inconnu : ${cmd.type}`);
      effects[cmd.type](cmd, dispatch);
    });
  function dispatch(msg) {
    const [next, cmds] = update(model, msg);
    model = next;
    render(view(model), dispatch);
    exec(cmds);
  }
  const [first, cmds] = init();
  model = first;
  render(view(model), dispatch);
  exec(cmds);
  subscribe?.(dispatch);
  return dispatch;
}
