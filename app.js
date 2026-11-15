// app.js

// Entry point: wires the model, the view and the effects together (see src/).
import { createRenderer } from "./framework/elmer/vdom.js";
// Elmish architecture: init, update, view, render, effects, subscribe.
import { debugHide, features, init, update } from "./src/update.js";
import { run } from "./framework/elmer/runtime.js";
import { createEffects, createSubscriptions } from "./framework/elmer/effects.js";
import { SKIP_VIDEO_WARNING_KEY } from "./src/features/video.js";
import { view } from "./src/view.js";
import { readFlag } from "./src/shared/logic.js";

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

// launch the app with the initial flags (hash, history position, skip video warning).
run({
  init,
  update,
  view,
  render,
  subscribe: createSubscriptions(features),
  devtools: { hide: debugHide },
  effects: createEffects(features),
  flags: {
    hash: location.hash,
    position: history.state?.position ?? 0,
    skipVideoWarning: readFlag(SKIP_VIDEO_WARNING_KEY)
  },
});
