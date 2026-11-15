// framework/elmer/debug/mount.js

// Debug mode (mounted by `run`, see `devtools.js`): a panel with the current model, the message log,
// the commands and events each message produced, a diff of the model (per feature slice), and time travel.
// Loaded only when the mode is on. The panel is rendered outside the app tree.
import { createRenderer } from "../vdom.js";
import { initialPanel, panelUpdate, panelView } from "./panel.js";
import { STYLE } from "./style.js";

// Console helpers added to `__elmer.debug` while the panel is mounted: `log` (message entries), `restore(id)` (time travel; returns the restored model, or null for an unknown id).
function consoleApi(getControl, getEntries, restore) {
  return {
    log: { configurable: true, get: () => getEntries() },
    restore: {
      configurable: true,
      value(id) {
        if (!getEntries().some((entry) => entry.id === id)) {
          console.warn(`__elmer.debug.restore: unknown id ${id} (see __elmer.debug.log)`);
          return null;
        }
        restore(id);
        return getControl().getModel();
      },
    },
  };
}

// Mounts the panel and returns the observer expected by `run({ debug })`.
// `hide` = see `summarize`. The feature slices are learned from the recorded models.
export function mountDebugger(hide = {}, doc = document) {
  const style = doc.createElement("style");
  style.textContent = STYLE;
  doc.head.appendChild(style);
  const root = doc.createElement("div");
  doc.body.appendChild(root);
  const render = createRenderer(root);

  const start = initialPanel(hide);
  let panel = { ...start, box: { ...start.box, w: Math.min(start.box.w, innerWidth - 16), h: Math.min(start.box.h, innerHeight - 96) } };
  let control = null;
  const paint = () => render(panelView(panel, control?.getModel()), dispatch);
  const clock = () => new Date().toLocaleTimeString("fr-FR");

  function dispatch(msg) {
    if (msg.type === "Restore") {
      const entry = panel.entries.find((e) => e.id === msg.id);
      if (entry) {
        control.restore(entry.after);
        // The steps after it are gone: the log shows the history up to the restored state, and the next step follows it.
        panel = panelUpdate(panel, { type: "Restored", id: entry.id });
        paint();
        // The newest entry is at the top of the list.
        const body = root.querySelector(".dbg-body");
        if (body) body.scrollTop = 0;
        return;
      }
    }
    else if (msg.type === "Copy") globalThis.navigator?.clipboard?.writeText(msg.text);
    else {
      panel = panelUpdate(panel, msg);
      if (msg.type === "DragStart") follow();
    }
    paint();
  }

  // Follows the pointer on the whole document until it is released.
  function follow() {
    const move = (event) => dispatch({ type: "Drag", x: event.clientX, y: event.clientY, viewport: { width: innerWidth, height: innerHeight } });
    const stop = () => {
      doc.removeEventListener("pointermove", move);
      doc.removeEventListener("pointerup", stop);
      doc.removeEventListener("pointercancel", stop);
      dispatch({ type: "DragEnd" });
    };
    doc.addEventListener("pointermove", move);
    doc.addEventListener("pointerup", stop);
    doc.addEventListener("pointercancel", stop);
  }

  return {
    attach(handle) {
      control = handle;
      if (globalThis.__elmer) Object.defineProperties(globalThis.__elmer.debug, consoleApi(() => control, () => panel.entries, (id) => dispatch({ type: "Restore", id })));
    },
    record(entry) {
      panel = panelUpdate(panel, { type: "Recorded", entry, time: entry.time ?? clock() });
      paint();
    },
    // Removes the panel and the console helpers.
    unmount() {
      style.remove();
      root.remove();
      if (globalThis.__elmer) {
        delete globalThis.__elmer.debug.log;
        delete globalThis.__elmer.debug.restore;
      }
    },
  };
}
