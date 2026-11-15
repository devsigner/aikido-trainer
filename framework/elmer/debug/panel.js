// framework/elmer/debug/panel.js

// The panel of the debugger, its own tiny Elm app: state and update (pure), then the view.
import { h } from "../vdom.js";
import { diffModels, labelOf, sliceNames, summarize } from "./inspect.js";

const MAX_ENTRIES = 200;

const json = (value) => JSON.stringify(value, null, 2) ?? "undefined";
const short = (value) => (typeof value === "string" ? value : JSON.stringify(value) ?? "undefined");

// ---------- Panel state (pure) ----------
const MIN_WIDTH = 200;
const MIN_HEIGHT = 140;
const clamp = (value, min, max) => Math.max(min, Math.min(value, Math.max(min, max)));

// `box` = position and size of the panel in px; `drag` = pointer gesture in progress ({ mode: "move" | "resize", x, y, box }).
export const initialPanel = (hide = {}) => ({ open: false, tab: "state", selected: null, folded: [], slices: [], hide, entries: [], counter: 0, box: { x: 8, y: 48, w: 340, h: 420 }, drag: null });

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
      // The slices are learned from the models seen (a lazy feature appears when it is mounted, and stays listed).
      const slices = [...new Set([...panel.slices, ...sliceNames(msg.entry.before), ...sliceNames(msg.entry.after)])];
      const entry = { ...msg.entry, id: panel.counter + 1, time: msg.time, changes: diffModels(msg.entry.before, msg.entry.after, slices, panel.hide) };
      return { ...panel, slices, counter: entry.id, entries: [...panel.entries, entry].slice(-MAX_ENTRIES) };
    }
    case "Toggle":
      return { ...panel, open: !panel.open };
    case "Tab":
      return { ...panel, tab: msg.tab };
    case "Fold":
      return { ...panel, folded: panel.folded.includes(msg.name) ? panel.folded.filter((name) => name !== msg.name) : [...panel.folded, msg.name] };
    case "Select":
      return { ...panel, selected: panel.selected === msg.id ? null : msg.id };
    case "Restored":
      return { ...panel, entries: panel.entries.filter((e) => e.id <= msg.id), counter: msg.id, selected: panel.selected > msg.id ? null : panel.selected };
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

// The nodes separated by " - ".
const joined = (nodes) => nodes.flatMap((node, i) => (i ? [" - ", node] : [node]));

const logTab = (panel) => [
  h("div", { className: "dbg-actions" },
    h("button", { onClick: { type: "Clear" } }, "Vider"),
    h("button", { onClick: { type: "Copy", text: json(panel.entries.map(({ id, time, msg, cmds, events, changes }) => ({ id, time, msg, cmds, events, changes }))) } }, "Copier le journal")),
  [...panel.entries].reverse().map((entry) => [
    h("div", { className: "dbg-row" },
      h("button", { className: `dbg-entry${panel.selected === entry.id ? " on" : ""}`, onClick: { type: "Select", id: entry.id } },
        h("p", { className: "dbg-title" },
          h("span", { className: "dbg-id" }, `#${entry.id}`),
          h("b", { className: "dbg-message" }, labelOf(entry.msg)),
          h("span", { className: "dbg-time" }, entry.time)
        ),
        h("span", { className: "dbg-meta" }, joined([
          h("span", {}, `${entry.cmds.length} cmd`),
          h("span", {}, `${(entry.events ?? []).length} evt`),
          ...(entry.changes.length ? entry.changes.map((change) => h("span", {}, change.key)) : [h("span", {}, "—")]),
        ]))),
      h("button", { className: "dbg-restore", title: "Revenir à l'état après ce message", onClick: { type: "Restore", id: entry.id } }, "⏪")),
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
