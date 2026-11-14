// Entry point: wires the model, the view and the effects together (see src/).
import { createRenderer } from "./src/vdom.js";
// Elmish architecture: init, update, view, render, effects, subscribe.
import { init, update } from "./src/update.js";
import { run } from "./src/runtime.js";
import { DEBUG_KEY, SKIP_VIDEO_WARNING_KEY, createEffects } from "./src/effects.js";
import { view } from "./src/view.js";

// Render, and scroll back to the top when the displayed tree actually changed.
const root = document.getElementById("app");
root.replaceChildren(); // remove the static splash from index.html

// The renderer is a function that takes a virtual node and a dispatch function,
// and renders the virtual node into the root element.
const renderer = createRenderer(root);

let lastSnapshot = "";
// custom render function that compares the current virtual node with the last one,
// and scrolls to the top if they are different.
const render = (vnode, dispatch) => {
  // The modal is an overlay: opening or closing it must not scroll the page.
  const snapshot = JSON.stringify(vnode, (_key, value) => (value?.props?.id === "video-modal" ? undefined : value));
  renderer(vnode, dispatch);
  if (snapshot !== lastSnapshot) window.scrollTo(0, 0);
  lastSnapshot = snapshot;
};

// Debug mode: `?debug` turns it on (and remembers it), `?debug=0` turns it off. The module is loaded only when on.
const debugParam = new URLSearchParams(location.search).get("debug");
if (debugParam !== null) writeFlag(DEBUG_KEY, debugParam !== "0");
const debug = debugParam === null ? readFlag(DEBUG_KEY) : debugParam !== "0";
const debugObserver = debug ? (await import("./src/debug.js")).mountDebugger() : undefined;

// launch the app with the initial flags (hash, history position, skip video warning).
run({
  init,
  update,
  view,
  render,
  subscribe: subscriber,
  debug: debugObserver,
  effects: createEffects(),
  flags: {
    hash: location.hash,
    position: history.state?.position ?? 0,
    skipVideoWarning: readFlag(SKIP_VIDEO_WARNING_KEY)
  },
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

function writeFlag(key, value) {
  try {
    if (value) localStorage.setItem(key, "1");
    else localStorage.removeItem(key);
  } catch {
    // Storage unavailable (private mode): the flag only lasts for this visit.
  }
}

// Read a boolean flag from localStorage, returning false if unavailable (private mode).
function readFlag(key) {
  try {
    return localStorage.getItem(key) === "1";
  } catch {
    return false;
  }
}
