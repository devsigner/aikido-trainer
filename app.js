// Point d'entrée : assemble le modèle, la vue et les effets (voir src/).
import { createEffects } from "./src/effects.js";
import { createRenderer } from "./src/vdom.js";
import { run } from "./src/runtime.js";
import { init, update } from "./src/update.js";
import { view } from "./src/view.js";

run({
  init,
  update,
  view,
  render: createRenderer(document.getElementById("app")),
  effects: createEffects(),
  subscribe: (dispatch) => window.addEventListener("popstate", (e) => dispatch({ type: "Popped", state: e.state })),
});
