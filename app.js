// Entry point: wires the model, the view and the effects together (see src/).
import { swipeDirection } from "./src/gesture.js";
import { createRenderer } from "./src/vdom.js";
// Elmish architecture: init, update, view, render, effects, subscribe.
import { init, update } from "./src/update.js";
import { run } from "./src/runtime.js";
import { SKIP_VIDEO_WARNING_KEY, createEffects } from "./src/effects.js";
import { view } from "./src/view.js";

// Render, and scroll back to the top when the displayed tree actually changed.
const root = document.getElementById("app");
root.replaceChildren(); // remove the static splash from index.html

// The renderer is a function that takes a virtual node and a dispatch function,
// and renders the virtual node into the root element.
const renderer = createRenderer(root);

let last = "";
const render = (vnode, dispatch) => {
  // The modal is an overlay: opening or closing it must not scroll the page.
  const snapshot = JSON.stringify(vnode, (_key, value) => (value?.props?.id === "video-modal" ? undefined : value));
  renderer(vnode, dispatch);
  if (snapshot !== last) window.scrollTo(0, 0);
  last = snapshot;
};

// launch the app with the initial flags (hash, history position, skip video warning).
run({
  init,
  update,
  view,
  render,
  effects: createEffects(),
  subscribe: subscriber,
  flags: { hash: location.hash, position: history.state?.position ?? 0, skipVideoWarning: readFlag(SKIP_VIDEO_WARNING_KEY) },
});

function subscriber(dispatch) {
  window.addEventListener("popstate", () => {
    return dispatch({
      type: "Popped",
      hash: location.hash,
      position: history.state?.position ?? 0
    })
  });
}

// Read a boolean flag from localStorage, returning false if unavailable (private mode).
function readFlag(key) {
  try {
    return localStorage.getItem(key) === "1";
  } catch {
    return false;
  }
}

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
