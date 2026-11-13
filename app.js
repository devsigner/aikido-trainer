// Entry point: wires the model, the view and the effects together (see src/).
import { createEffects } from "./src/effects.js";
import { swipeDirection } from "./src/gesture.js";
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

// Swipe right = history back, swipe left = history forward (touch devices).
let touchStart = null;
const point = (touch) => ({ x: touch.clientX, y: touch.clientY, time: Date.now() });
document.addEventListener("touchstart", (event) => {
  const onField = event.target.closest?.("input, select, textarea");
  touchStart = event.touches.length === 1 && !onField ? point(event.touches[0]) : null;
}, { passive: true });
document.addEventListener("touchend", (event) => {
  if (!touchStart) return;
  const direction = swipeDirection(touchStart, point(event.changedTouches[0]), window.innerWidth);
  touchStart = null;
  if (direction === "left") history.forward();
  else if (direction === "right" && (history.state?.position ?? 0) > 0) history.back();
}, { passive: true });
