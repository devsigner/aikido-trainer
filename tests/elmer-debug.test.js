// tests/elmer-debug.test.js

// The debugger of ELMer: panel state and view (pure), and the runtime hooks it relies on.
import { test, describe } from "node:test";
import assert from "node:assert/strict";
import { find, text } from "./helpers.js";
import { diffModels, labelOf } from "../framework/elmer/debug/inspect.js";
import { panelUpdate, panelView, initialPanel } from "../framework/elmer/debug/panel.js";
import { run } from "../framework/elmer/runtime.js";

describe("elmer debugger", () => {
  test("diffModels goes inside the feature slices, and the log labels enveloped messages", () => {
    const before = { screen: "home", video: { skipWarning: false, prompt: null } };
    const after = { screen: "home", video: { skipWarning: false, prompt: { url: "u" } } };
    assert.deepEqual(diffModels(before, after, ["video"]).map(({ key }) => key), ["video.prompt"]);
    assert.deepEqual(diffModels(before, after).map(({ key }) => key), ["video"]);
    assert.equal(labelOf({ feature: "video", msg: { type: "AskVideo" } }), "video/AskVideo");
    assert.equal(labelOf({ type: "Next" }), "Next");
  });

  test("the state tab shows one foldable section per slice, and the events of a message in its detail", () => {
    const model = { screen: "home", video: { skipWarning: false, prompt: null } };
    let panel = panelUpdate(panelUpdate(initialPanel(), { type: "Recorded", entry: { msg: { type: "@init" }, before: undefined, after: model, cmds: [] }, time: "t" }), { type: "Tab", tab: "state" });
    const folds = (current) => find(panelView(current, model), (node) => node.props.className === "dbg-fold").map(text);
    assert.deepEqual(folds(panelUpdate(panel, { type: "Toggle" })), ["▾ video", "▾ (...)"]);
    panel = panelUpdate(panelUpdate(panel, { type: "Toggle" }), { type: "Fold", name: "video" });
    assert.deepEqual(folds(panel), ["▸ video", "▾ (...)"]);
    const entry = { msg: { feature: "a", msg: { type: "X" } }, before: {}, after: {}, cmds: [], events: [{ event: { type: "Changed" }, from: "a", handledBy: ["b"] }] };
    panel = panelUpdate(panelUpdate(panelUpdate(panel, { type: "Recorded", entry, time: "t" }), { type: "Tab", tab: "log" }), { type: "Select", id: 2 });
    assert.match(find(panelView(panel, model), (node) => node.props.className === "dbg-detail").map(text)[0], /a → Changed : reçu par b/);
  });

  test("the slices are learned from the recorded models, and a lazy one stays listed once unmounted", () => {
    const record = (panel, before, after) => panelUpdate(panel, { type: "Recorded", entry: { msg: { type: "X" }, before, after, cmds: [] }, time: "t" });
    let panel = record(initialPanel(), undefined, { screen: "home", a: { n: 0 } });
    panel = record(panel, { a: { n: 0 } }, { a: { n: 0 }, lazy: { seen: 1 } });
    panel = record(panel, { a: { n: 0 }, lazy: { seen: 1 } }, { a: { n: 0 } });
    assert.deepEqual(panel.slices, ["a", "lazy"]);
    assert.deepEqual(panel.entries[1].changes.map((change) => change.key), ["lazy.seen"]);
  });

  test("the runtime reports each step, effects after the message that caused them, and can restore a past model", () => {
    const records = [];
    let handle;
    const rendered = [];
    const dispatch = run({
      init: () => [{ n: 0 }, []],
      update: (model, msg) => (msg.type === "Inc" ? [{ n: model.n + 1 }, [{ type: "Echo" }]] : [model, []]),
      view: (model) => model.n,
      render: (tree) => rendered.push(tree),
      effects: { Echo: (_, send) => send({ type: "Noop" }) },
      debug: { attach: (control) => (handle = control), record: (entry) => records.push(entry) },
    });
    dispatch({ type: "Inc" });
    assert.deepEqual(records.map((entry) => entry.msg.type), ["@init", "Inc", "Noop"]);
    assert.deepEqual(records[1].cmds, [{ type: "Echo" }]);
    assert.deepEqual(records[1].events, []);
    assert.deepEqual([records[1].before, records[1].after], [{ n: 0 }, { n: 1 }]);
    handle.restore(records[0].after);
    assert.deepEqual(handle.getModel(), { n: 0 });
    assert.equal(rendered.at(-1), 0);
  });

  test("the panel can be moved and resized with the pointer, kept inside the viewport", () => {
    const viewport = { width: 500, height: 800 };
    const base = initialPanel();
    const moved = panelUpdate(panelUpdate(base, { type: "DragStart", mode: "move", x: 100, y: 100 }), { type: "Drag", x: 160, y: 130, viewport });
    assert.deepEqual([moved.box.x, moved.box.y, moved.box.w, moved.box.h], [base.box.x + 60, base.box.y + 30, base.box.w, base.box.h]);
    const away = panelUpdate(moved, { type: "Drag", x: 9999, y: -9999, viewport });
    assert.deepEqual([away.box.x, away.box.y], [440, 0]);
    const resized = panelUpdate(panelUpdate(base, { type: "DragStart", mode: "resize", x: 0, y: 0 }), { type: "Drag", x: 50, y: -9999, viewport });
    assert.deepEqual([resized.box.x, resized.box.w, resized.box.h], [base.box.x, base.box.w + 50, 140]);
    assert.equal(panelUpdate(panelUpdate(moved, { type: "DragEnd" }), { type: "Drag", x: 300, y: 300, viewport }).box.x, moved.box.x);
  });

  test("the panel keeps a numbered log, shows the selected entry and toggles", () => {
    const entry = { msg: { type: "Next" }, before: { a: 1 }, after: { a: 2 }, cmds: [{ type: "Random" }] };
    let panel = panelUpdate(initialPanel(), { type: "Recorded", entry, time: "10:00:00" });
    panel = panelUpdate(panel, { type: "Recorded", entry, time: "10:00:01" });
    assert.deepEqual(panel.entries.map((recorded) => recorded.id), [1, 2]);
    assert.equal(panel.entries[0].changes[0].key, "a");
    assert.equal(find(panelView(panel, {}), (node) => node.props.className === "dbg-panel").length, 0);
    panel = panelUpdate(panel, { type: "Toggle" });
    const close = find(panelView(panel, {}), (node) => node.props.className === "dbg-close")[0];
    assert.equal(panelUpdate(panel, close.props.onClick).open, false);
    const bar = find(panelView(panel, {}), (node) => node.props.className === "dbg-bar")[0];
    const onButton = { target: { closest: () => ({}) }, clientX: 1, clientY: 1 };
    assert.equal(bar.props.onPointerDown(onButton).type, "Noop");
    assert.equal(bar.props.onPointerDown({ target: { closest: () => null }, clientX: 1, clientY: 1 }).type, "DragStart");
    panel = panelUpdate(panel, { type: "Tab", tab: "log" });
    panel = panelUpdate(panel, { type: "Select", id: 2 });
    assert.equal(find(panelView(panel, {}), (node) => node.props.className === "dbg-detail").length, 1);
    assert.equal(find(panelView(panel, {}), (node) => node.props.className === "dbg-copy").length, 0);
    const onState = panelView(panelUpdate(panel, { type: "Tab", tab: "state" }), { screen: "home" });
    const copy = find(onState, (node) => node.props.className === "dbg-copy")[0];
    assert.equal(text(copy), "📋");
    assert.match(copy.props.onClick.text, /"screen": "home"/);
    assert.equal(panelUpdate(panelUpdate(panel, { type: "Select", id: 2 }), { type: "Clear" }).entries.length, 0);
    const restores = find(panelView(panel, {}), (node) => node.props.className === "dbg-restore");
    assert.deepEqual(restores.map((node) => node.props.onClick), [{ type: "Restore", id: 2 }, { type: "Restore", id: 1 }], "one restore button per log line, no need to unfold it");
    assert.match(restores[0].props.title, /Revenir à l'état après ce message/);
    const rows = find(panelView(panel, {}), (node) => node.props.className === "dbg-meta");
    assert.equal(text(rows[0]), "1 cmd - 0 evt - a", "the details of a log line are separated by \" - \"");
    assert.equal(text(find(panelView(panel, {}), (node) => node.props.className === "dbg-time")[0]), "10:00:01", "the time is in the header of the line");
    const back = panelUpdate(panel, { type: "Restored", id: 1 });
    assert.deepEqual(back.entries.map((recorded) => recorded.id), [1], "the steps after the restored one are forgotten");
    assert.equal(back.selected, null);
    assert.equal(panelUpdate(back, { type: "Recorded", entry, time: "10:00:02" }).entries[1].id, 2, "the next step follows the restored one");
  });
});
