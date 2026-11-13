// Entry point: wires the model, the view and the effects together (see src/).
import { createEffects } from "./src/effects.js";
import { createRenderer } from "./src/vdom.js";
import { run } from "./src/runtime.js";
import { init, update } from "./src/update.js";
import { view } from "./src/view.js";

// Render, and scroll back to the top when the displayed tree actually changed.
const root = document.getElementById("app");
root.replaceChildren(); // remove the static splash from index.html
const renderer = createRenderer(root);

let last = "";
const render = (vnode, dispatch) => {
  const snapshot = JSON.stringify(vnode);
  renderer(vnode, dispatch);
  if (snapshot !== last) window.scrollTo(0, 0);
  last = snapshot;
};

run({
  init,
  flags: { hash: location.hash, position: history.state?.position ?? 0 },
  update,
  view,
  render,
  effects: createEffects(),
  subscribe: (dispatch) => window.addEventListener("popstate", () => dispatch({ type: "Popped", hash: location.hash, position: history.state?.position ?? 0 })),
});
