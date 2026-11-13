// Boucle Elm : message → update → view → rendu, puis exécution des commandes.
export function run({ init, update, view, render, effects, subscribe }) {
  let model;
  const exec = (cmds) =>
    cmds.forEach((cmd) => {
      if (!effects[cmd.type]) throw new Error(`Effet inconnu : ${cmd.type}`);
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
  apply(init());
  subscribe?.(dispatch);
  return dispatch;
}
