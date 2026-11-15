// Entry point: wires the model, the view and the effects together (see src/).
import { createRenderer } from "./src/framework/vdom.js";
// Elmish architecture: init, update, view, render, effects, subscribe.
import { debugHide, features, init, update } from "./src/update.js";
import { run } from "./src/framework/runtime.js";
import { createEffects, createSubscriptions } from "./src/framework/effects.js";
import { SKIP_VIDEO_WARNING_KEY } from "./src/features/video.js";
import { view } from "./src/view.js";
import { readFlag, writeFlag } from "./src/shared/logic.js";

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
const DEBUG_KEY = "aikido.debug";
const debugParam = new URLSearchParams(location.search).get("debug");
if (debugParam !== null) writeFlag(DEBUG_KEY, debugParam !== "0");
const debug = debugParam === null ? readFlag(DEBUG_KEY) : debugParam !== "0";
const debugObserver = debug ? (await import("./src/framework/debug.js")).mountDebugger(features.map((feature) => feature.name), debugHide) : undefined;

// launch the app with the initial flags (hash, history position, skip video warning).
run({
  init,
  update,
  view,
  render,
  subscribe: createSubscriptions(features),
  debug: debugObserver,
  effects: createEffects(features),
  flags: {
    hash: location.hash,
    position: history.state?.position ?? 0,
    skipVideoWarning: readFlag(SKIP_VIDEO_WARNING_KEY)
  },
});
