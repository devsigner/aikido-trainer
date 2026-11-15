// src/elmer/debug.js

// Debug mode (`?debug` in the URL): a panel with the current model, the message log,
// the commands and events each message produced, a diff of the model (per feature slice), and time travel.
// Loaded only when the mode is on. The panel is its own tiny Elm app, rendered outside the app tree.
import { createRenderer, h } from "./vdom.js";

const MAX_ENTRIES = 200;

// `hide` = { field: (value) => short text }: the bulky fields of the model (at the root or in a slice) shown as a summary.
const bulky = (fields, hide) => Object.fromEntries(Object.entries(fields).map(([key, value]) => [key, key in hide ? hide[key](value) : value]));

// The model without its bulky parts, readable in a panel.
export function summarize(model, hide = {}) {
  if (!model) return model;
  const plain = (value) => value && typeof value === "object" && !Array.isArray(value);
  const slices = Object.entries(model).filter(([, value]) => plain(value)).map(([key, value]) => [key, bulky(value, hide)]);
  return { ...bulky(model, hide), ...Object.fromEntries(slices) };
}

// Fields that differ between two models: [{ key, from, to }].
// `slices` = names of the features that own a slice of the model: their fields are diffed one by one (key "video.prompt").
export function diffModels(before, after, slices = [], hide = {}) {
  const a = summarize(before, hide) ?? {};
  const b = summarize(after, hide) ?? {};
  const differ = (from, to) => JSON.stringify(from) !== JSON.stringify(to);
  const fields = (from, to, prefix, keys) => keys.filter((key) => differ(from[key], to[key])).map((key) => ({ key: prefix + key, from: from[key], to: to[key] }));
  const keysOf = (from, to) => [...new Set([...Object.keys(from ?? {}), ...Object.keys(to ?? {})])];

  const flat = fields(a, b, "", keysOf(a, b).filter((key) => !slices.includes(key)));
  const inSlices = slices.flatMap((name) => fields(a[name] ?? {}, b[name] ?? {}, `${name}.`, keysOf(a[name], b[name])));
  return [...flat, ...inSlices];
}

// Label of a message in the log: `feature/Type` for an enveloped message.
export const labelOf = (msg) => (msg.feature ? `${msg.feature}/${msg.msg.type}` : msg.type);

const json = (value) => JSON.stringify(value, null, 2) ?? "undefined";
const short = (value) => (typeof value === "string" ? value : JSON.stringify(value) ?? "undefined");

// ---------- Panel state (pure) ----------
const MIN_WIDTH = 200;
const MIN_HEIGHT = 140;
const clamp = (value, min, max) => Math.max(min, Math.min(value, Math.max(min, max)));

// `box` = position and size of the panel in px; `drag` = pointer gesture in progress ({ mode: "move" | "resize", x, y, box }).
export const initialPanel = (slices = [], hide = {}) => ({ open: false, tab: "state", selected: null, folded: [], slices, hide, entries: [], counter: 0, box: { x: 8, y: 48, w: 340, h: 420 }, drag: null });

// Keeps at least a grabbable part of the panel inside the viewport.
function dragged({ drag }, { x, y, viewport }) {
  const dx = x - drag.x;
  const dy = y - drag.y;
  const { box } = drag;
  if (drag.mode === "move") return { ...box, x: clamp(box.x + dx, 0, viewport.width - 60), y: clamp(box.y + dy, 0, viewport.height - 40) };
  return { ...box, w: clamp(box.w + dx, MIN_WIDTH, viewport.width - box.x), h: clamp(box.h + dy, MIN_HEIGHT, viewport.height - box.y) };
}

export function panelUpdate(panel, msg) {
  switch (msg.type) {
    case "Recorded": {
      const entry = { ...msg.entry, id: panel.counter + 1, time: msg.time, changes: diffModels(msg.entry.before, msg.entry.after, panel.slices, panel.hide) };
      return { ...panel, counter: entry.id, entries: [...panel.entries, entry].slice(-MAX_ENTRIES) };
    }
    case "Toggle":
      return { ...panel, open: !panel.open };
    case "Tab":
      return { ...panel, tab: msg.tab };
    case "Fold":
      return { ...panel, folded: panel.folded.includes(msg.name) ? panel.folded.filter((name) => name !== msg.name) : [...panel.folded, msg.name] };
    case "Select":
      return { ...panel, selected: panel.selected === msg.id ? null : msg.id };
    case "Clear":
      return { ...panel, entries: [], selected: null };
    case "DragStart":
      return { ...panel, drag: { mode: msg.mode, x: msg.x, y: msg.y, box: panel.box } };
    case "Drag":
      return panel.drag ? { ...panel, box: dragged(panel, msg) } : panel;
    case "DragEnd":
      return { ...panel, drag: null };
    default:
      return panel;
  }
}

// ---------- Panel view ----------
// Starts a move or a resize; the pointer is then followed on the document (see `mountDebugger`).
const grab = (mode) => (event) => {
  if (event.target.closest?.("button")) return { type: "Noop" };
  event.preventDefault?.();
  return { type: "DragStart", mode, x: event.clientX, y: event.clientY };
};

const tab = (panel, id, label) => h("button", { className: panel.tab === id ? "on" : "", onClick: { type: "Tab", tab: id } }, label);

const detail = (entry) => h("div", { className: "dbg-detail" },
  h("div", { className: "dbg-title" }, "Message"),
  h("pre", {}, json(entry.msg)),
  h("div", { className: "dbg-title" }, `Commandes (${entry.cmds.length})`),
  h("pre", {}, entry.cmds.length ? json(entry.cmds) : "aucune"),
  h("div", { className: "dbg-title" }, `Événements (${(entry.events ?? []).length})`),
  (entry.events ?? []).length
    ? entry.events.map(({ event, from, handledBy }) => h("div", { className: "dbg-change" }, h("b", {}, `${from} → ${event.type}`), ` : reçu par ${handledBy.join(", ") || "personne"}`))
    : h("pre", {}, "aucun"),
  h("div", { className: "dbg-title" }, `Changements du modèle (${entry.changes.length})`),
  entry.changes.length
    ? entry.changes.map((change) => h("div", { className: "dbg-change" }, h("b", {}, change.key), ` : ${short(change.from)} → ${short(change.to)}`))
    : h("pre", {}, "aucun"),
  h("div", { className: "dbg-actions" },
    h("button", { onClick: { type: "Restore", id: entry.id } }, "⏪ Revenir à l'état après ce message"),
    h("button", { onClick: { type: "Copy", text: json({ msg: entry.msg, cmds: entry.cmds, events: entry.events, changes: entry.changes }) } }, "Copier")));

const logTab = (panel) => [
  h("div", { className: "dbg-actions" },
    h("button", { onClick: { type: "Clear" } }, "Vider"),
    h("button", { onClick: { type: "Copy", text: json(panel.entries.map(({ id, time, msg, cmds, events, changes }) => ({ id, time, msg, cmds, events, changes }))) } }, "Copier le journal")),
  [...panel.entries].reverse().map((entry) => [
    h("button", { className: `dbg-entry${panel.selected === entry.id ? " on" : ""}`, onClick: { type: "Select", id: entry.id } },
      h("span", { className: "dbg-id" }, `#${entry.id}`),
      h("b", {}, labelOf(entry.msg)),
      h("span", { className: "dbg-meta" }, `${entry.time} · ${entry.cmds.length} cmd · ${(entry.events ?? []).length} evt · ${entry.changes.map((change) => change.key).join(", ") || "—"}`)),
    panel.selected === entry.id ? detail(entry) : null,
  ]),
];

// One foldable section per feature slice, then the fields of the model not owned by a feature yet.
const section = (panel, name, content) => [
  h("button", { className: "dbg-fold", onClick: { type: "Fold", name } }, `${panel.folded.includes(name) ? "▸" : "▾"} ${name}`),
  panel.folded.includes(name) ? null : h("pre", {}, content === undefined ? "(non chargée)" : json(content)),
];

const stateTab = (panel, model) => {
  const summary = summarize(model, panel.hide) ?? {};
  const rest = Object.fromEntries(Object.entries(summary).filter(([key]) => !panel.slices.includes(key)));
  return [
    panel.slices.map((name) => section(panel, name, summary[name])),
    section(panel, "(...)", rest),
  ];
};

// Icon button pinned to the top right of the content: it stays visible while the state scrolls.
const copyButton = (model, hide) => h("button", { className: "dbg-copy", title: "Copier l'état", "aria-label": "Copier l'état", onClick: { type: "Copy", text: json(summarize(model, hide)) } }, "📋");

export function panelView(panel, model) {
  return h("div", { id: "debug" },
    h("button", { className: "dbg-toggle", onClick: { type: "Toggle" } }, panel.open ? "✕" : `🐞 ${panel.counter}`),
    panel.open && h("div", { className: "dbg-panel", style: `left:${panel.box.x}px;top:${panel.box.y}px;width:${panel.box.w}px;height:${panel.box.h}px` },
      h("div", { className: "dbg-bar", onPointerDown: grab("move") },
        h("span", {}, "🐞 Debug · glisser pour déplacer"),
        h("button", { className: "dbg-close", title: "Fermer le panneau", "aria-label": "Fermer le panneau", onClick: { type: "Toggle" } }, "✕")),
      h("div", { className: "dbg-tabs" }, tab(panel, "state", "État"), tab(panel, "log", `Messages (${panel.entries.length})`)),
      h("div", { className: "dbg-content" },
        h("div", { className: "dbg-body" }, panel.tab === "state" ? stateTab(panel, model) : logTab(panel)),
        panel.tab === "state" ? copyButton(model, panel.hide) : null),
      h("div", { className: "dbg-resize", onPointerDown: grab("resize") })));
}

const STYLE = `
#debug { position: fixed; right: 0; bottom: 0; left: 0; z-index: 20; font: 12px/1.4 ui-monospace, Menlo, monospace; pointer-events: none; }
#debug > * { pointer-events: auto; }
#debug button { all: unset; box-sizing: border-box; cursor: pointer; padding: .4rem .7rem; border-radius: 6px; background: #3a4150; color: #eceff4; font: inherit; pointer-events: auto; }
#debug button.on { background: #c0392b; }
#debug .dbg-toggle { position: absolute; right: .5rem; bottom: .5rem; background: #000c; border: 1px solid #555; }
#debug .dbg-panel { position: fixed; display: flex; flex-direction: column; background: #0d1117f2; color: #c9d1d9; border: 2px solid #c0392b; border-radius: 8px; overflow: hidden; }
#debug .dbg-bar { display: flex; align-items: center; justify-content: space-between; gap: .5rem; padding: .35rem .5rem; background: #c0392b; color: #fff; cursor: move; user-select: none; -webkit-user-select: none; touch-action: none; }
#debug .dbg-close { padding: .1rem .5rem; background: #0004; }
#debug .dbg-tabs { display: flex; gap: .4rem; padding: .5rem .5rem 0; }
#debug .dbg-content { position: relative; flex: 1; min-height: 0; display: flex; }
#debug .dbg-body { flex: 1; min-height: 0; overflow: auto; padding: .5rem; }
#debug .dbg-copy { position: absolute; top: .4rem; right: 1.2rem; padding: .3rem .45rem; background: #30363d; }
#debug .dbg-resize { position: absolute; right: 0; bottom: 0; width: 18px; height: 18px; cursor: nwse-resize; touch-action: none; background: linear-gradient(135deg, transparent 50%, #c0392b 50%); }
#debug .dbg-fold { display: block; width: 100%; margin-bottom: .2rem; background: #161b22; color: #e8a39b; }
#debug .dbg-actions { display: flex; gap: .4rem; margin-bottom: .5rem; }
#debug pre { margin: 0 0 .5rem; white-space: pre-wrap; word-break: break-all; }
#debug .dbg-entry { display: flex; gap: .5rem; width: 100%; margin-bottom: .2rem; background: #161b22; }
#debug .dbg-entry.on { background: #30363d; }
#debug .dbg-id { color: #8b95a5; }
#debug .dbg-meta { margin-left: auto; color: #8b95a5; text-align: right; }
#debug .dbg-detail { margin: 0 0 .6rem; padding: .5rem; border-left: 2px solid #c0392b; }
#debug .dbg-title { margin: .3rem 0; color: #e8a39b; }
#debug .dbg-change { word-break: break-all; }
`;

// Browser console helper (`__debug`): `model` (current), `log` (message entries), `restore(id)` (time travel; returns the restored model, or null for an unknown id).
function consoleApi(getControl, getEntries, restore) {
  return {
    get model() {
      return getControl().getModel();
    },
    get log() {
      return getEntries();
    },
    restore(id) {
      if (!getEntries().some((entry) => entry.id === id)) {
        console.warn(`__debug.restore: unknown id ${id} (see __debug.log)`);
        return null;
      }
      restore(id);
      return getControl().getModel();
    },
  };
}

// Mounts the panel and returns the observer expected by `run({ debug })`.
// `slices` = names of the features that own a slice of the model (see src/elmer/combine.js); `hide` = see `summarize`.
export function mountDebugger(slices = [], hide = {}, doc = document) {
  const style = doc.createElement("style");
  style.textContent = STYLE;
  doc.head.appendChild(style);
  const root = doc.createElement("div");
  doc.body.appendChild(root);
  const render = createRenderer(root);

  const start = initialPanel(slices, hide);
  let panel = { ...start, box: { ...start.box, w: Math.min(start.box.w, innerWidth - 16), h: Math.min(start.box.h, innerHeight - 96) } };
  let control = null;
  const paint = () => render(panelView(panel, control?.getModel()), dispatch);
  const clock = () => new Date().toLocaleTimeString("fr-FR");

  function dispatch(msg) {
    if (msg.type === "Restore") {
      const entry = panel.entries.find((e) => e.id === msg.id);
      if (entry) control.restore(entry.after);
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
      globalThis.__debug = consoleApi(() => control, () => panel.entries, (id) => dispatch({ type: "Restore", id }));
    },
    record(entry) {
      panel = panelUpdate(panel, { type: "Recorded", entry, time: clock() });
      paint();
    },
  };
}
