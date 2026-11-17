// tests/elmer.test.js

import { test, describe } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import { UNMOUNT, cmd, combine, defineFeature, embed, emit, to } from "../framework/elmer/feature.js";
import { html } from "../framework/elmer/html.js";
import { h } from "../framework/elmer/vdom.js";
import { settingsFromEnvironment } from "../framework/elmer/elmer.js";
import { run } from "../framework/elmer/runtime.js";
import { createDevtools } from "../framework/elmer/devtools.js";

const SETTINGS = { debug: "off", persist: false, historySize: 200 };
import { features as exampleFeatures, view as exampleView } from "../examples/counter/features.js";

// Two fake features: a counter that publishes an event, and a log that listens to it.
const counter = defineFeature({
  init: (flags, model) => [model, [{ type: "Hello" }]],
  initialState: { n: 0 },
  messages: { Inc: (model) => [{ n: model.n + 1 }, [{ type: "Echo" }], [{ type: "Changed", n: model.n + 1 }]] },
  effects: () => ({ Echo: (_, dispatch) => dispatch({ type: "Noop" }) }),
});
const log = defineFeature({
  initialState: { seen: [] },
  on: { Changed: (model, event, root) => [{ seen: [...model.seen, `${event.n}/${root.counter.n}`] }, []] },
  effects: () => ({ Ping: () => {} }),
});

describe("elmer combine", () => {
  const app = combine({ counter, log });

  test("init builds one slice per feature and tags the commands with their feature", () => {
    const [model, cmds] = app.init();
    assert.deepEqual(model, { counter: { n: 0 }, log: { seen: [] }, elmer: SETTINGS });
    assert.deepEqual(cmds, [{ type: "Hello", feature: "counter" }]);
  });

  test("a message only touches its feature; its events reach the subscribers, which can read the root model", () => {
    const [model] = app.init();
    const [next, cmds] = app.update(model, to("counter", { type: "Inc" }));
    assert.deepEqual(next, { counter: { n: 1 }, log: { seen: ["1/1"] }, elmer: SETTINGS });
    assert.deepEqual(cmds, [{ type: "Echo", feature: "counter" }]);
    assert.equal(model.counter.n, 0, "the previous model is not mutated");
  });

  test("the delivered events are reported with their publisher and their receivers", () => {
    const [model] = app.init();
    const [, , delivered] = app.update(model, to("counter", { type: "Inc" }));
    assert.deepEqual(delivered, [{ event: { type: "Changed", n: 1 }, from: "counter", handledBy: ["log"] }]);
  });

  test("events published by a reaction are delivered too; an endless loop fails loudly", () => {
    const ping = defineFeature({ initialState: {}, messages: { Go: () => [{}, [], [{ type: "A" }]] }, on: { A: () => [{}, [], [{ type: "B" }]], B: () => [{}, [], [{ type: "A" }]] } });
    const looping = combine({ ping });
    assert.throws(() => looping.update(looping.init()[0], to("ping", { type: "Go" })), /Event loop/);
  });

  test("effects answer to the feature that emitted the command", () => {
    const sent = [];
    app.effects().Echo({ type: "Echo", feature: "counter" }, (message) => sent.push(message));
    assert.deepEqual(sent, [to("counter", { type: "Noop" })]);
  });

  test("duplicate effect types, unknown features and unknown messages are rejected", () => {
    assert.throws(() => combine({ counter, other: counter }).effects(), /Duplicate effect/);
    assert.throws(() => app.update({}, to("nope", {})), /Unknown feature/);
    assert.throws(() => app.update(app.init()[0], to("counter", { type: "Nope" })), /Unknown message/);
  });

  test("defineFeature rejects unknown keys and a feature without initialState nor init", () => {
    assert.throws(() => defineFeature({ initialState: {}, update() {} }), /Unknown feature key/);
    assert.throws(() => defineFeature({ messages: {} }), /initialState/);
  });

  test("the feature `elmer` is added to every application: settings in model.elmer, saved when they change, name reserved", () => {
    const saved = [];
    const [model] = app.init({ elmer: { debug: "on", persist: true } });
    assert.deepEqual(model.elmer, { debug: "on", persist: true, historySize: 200 }, "the flags of the environment override the defaults");
    const [next, cmds] = app.update(model, to("elmer", { type: "DebugOff" }));
    assert.equal(next.elmer.debug, "off");
    assert.deepEqual(cmds, [{ type: "SaveSetting", key: "debug", value: "off", feature: "elmer" }]);
    app.effects({ storage: { setItem: (key, value) => saved.push([key, value]) } }).SaveSetting(cmds[0], () => {});
    assert.deepEqual(saved, [["elmer.debug", "off"]]);
    const [off] = app.update(next, to("elmer", { type: "PersistOff" }));
    const [quiet, none] = app.update(off, to("elmer", { type: "DebugOn" }));
    assert.deepEqual(none, [], "nothing is saved while persist is off");
    const [, forget] = app.update(model, to("elmer", { type: "PersistOff" }));
    const removed = [];
    app.effects({ storage: { removeItem: (key) => removed.push(key) } }).ForgetSetting(forget[0], () => {});
    assert.deepEqual(removed, ["elmer.debug"]);
    assert.equal(quiet.elmer.persist, false);
    const [, again] = app.update(quiet, to("elmer", { type: "PersistOn" }));
    assert.equal(again[0].value, "on");
    assert.throws(() => combine({ elmer: counter }), /reserved/);
  });

  test("the settings from the environment: the saved choice wins, no browser means off", () => {
    assert.deepEqual(settingsFromEnvironment(), { debug: "off", persist: false });
    globalThis.localStorage = { getItem: () => "on" };
    try {
      assert.deepEqual(settingsFromEnvironment(), { debug: "on", persist: true });
    } finally {
      delete globalThis.localStorage;
    }
  });

  test("the debug observer controls the loop through the devtools: a restore reaches the loop", () => {
    const restored = [];
    let handle;
    createDevtools({
      control: { getModel: () => ({}), restore: (past) => restored.push(past), dispatch: () => {} },
      observer: { attach: (control) => (handle = control), record: () => {} },
    });
    const past = { n: 1 };
    handle.restore(past);
    assert.deepEqual(restored, [past]);
  });

  test("a failing effect does not stop the next ones, and is reported with its command and feature", () => {
    const ran = [];
    const application = combine({ plain: defineFeature({ initialState: {}, messages: { Go: (model) => [model, [{ type: "Boom" }, { type: "Echo" }]] }, effects: () => ({ Boom: () => { throw new Error("bad"); }, Echo: () => ran.push("echo") }) }) });
    const dispatch = run({ init: application.init, update: application.update, view: () => "", render: () => {}, effects: application.effects({}) });
    assert.throws(() => dispatch(to("plain", { type: "Go" })), /Effect Boom \(feature plain\) failed : bad/);
    assert.deepEqual(ran, ["echo"]);
  });

  test("time travel keeps the settings of the framework", () => {
    let handle;
    const application = combine({ plain: defineFeature({ initialState: {} }) });
    const dispatch = run({
      init: application.init, update: application.update, view: () => "", render: () => {}, effects: application.effects({}),
      debug: { attach: (control) => (handle = control), record: () => {} },
    });
    const past = handle.getModel();
    dispatch(to("elmer", { type: "DebugOn" }));
    handle.restore(past);
    assert.equal(handle.getModel().elmer.debug, "on");
  });

  test("embed envelops the handlers of a feature view, messages and functions alike", () => {
    const vnode = { tag: "div", props: { id: "x", onClick: { type: "A" }, onChange: (event) => ({ type: "B", value: event.v }) }, children: [{ tag: "b", props: { onClick: { type: "C" } }, children: ["text"] }] };
    const mapped = embed("counter", vnode);
    assert.deepEqual(mapped.props.onClick, to("counter", { type: "A" }));
    assert.deepEqual(mapped.props.onChange({ v: 1 }), to("counter", { type: "B", value: 1 }));
    assert.deepEqual(mapped.children[0].props.onClick, to("counter", { type: "C" }));
    assert.equal(mapped.props.id, "x");
    assert.equal(embed("counter", null), null);
  });

  test("embed leaves a message already addressed to a feature as it is", () => {
    const mapped = embed("counter", { tag: "button", props: { onClick: to("other", { type: "A" }) }, children: [] });
    assert.deepEqual(mapped.props.onClick, to("other", { type: "A" }));
  });

  test("a handler may return the model alone, [model], or single cmds and events instead of lists", () => {
    const short = defineFeature({
      name: "short",
      initialState: { n: 0 },
      messages: {
        Alone: () => ({ n: 1 }),
        Wrapped: () => [{ n: 2 }],
        Single: () => [{ n: 3 }, cmd("Echo", { x: 1 }), emit("Changed", { n: 3 })],
      },
      effects: () => ({ Echo: () => {} }),
    });
    const listener = defineFeature({ name: "listener", initialState: { seen: 0 }, on: { Changed: (model, { n }) => ({ seen: model.seen + n }) } });
    const app = combine([short, listener]);
    const [start] = app.init();
    assert.equal(app.update(start, to("short", { type: "Alone" }))[0].short.n, 1);
    assert.equal(app.update(start, to("short", { type: "Wrapped" }))[0].short.n, 2);
    const [next, commands] = app.update(start, to("short", { type: "Single" }));
    assert.equal(next.short.n, 3);
    assert.equal(next.listener.seen, 3);
    assert.deepEqual(commands, [{ type: "Echo", x: 1, feature: "short" }]);
  });

  test("combine accepts a list of features that declare their name; a missing or duplicate name is rejected", () => {
    const named = defineFeature({ name: "counter", initialState: { n: 0 } });
    assert.deepEqual(combine([named]).init()[0].counter, { n: 0 });
    assert.throws(() => combine([defineFeature({ initialState: {} })]), /needs a `name`/);
    assert.throws(() => combine([named, named]), /Duplicate feature name: counter/);
    assert.throws(() => combine([defineFeature({ name: "elmer", initialState: {} })]), /reserved/);
  });

  test("a lazy feature has no slice until it is reached, is mounted with the init flags, and can unmount itself", () => {
    const lazy = defineFeature({ lazy: true, initialState: { n: 0 }, init: ({ start }) => [{ n: start }, []], messages: { Go: (model) => [{ n: model.n + 1 }, []] }, on: { Free: () => [UNMOUNT, [{ type: "Cleanup" }]] } });
    const eager = defineFeature({ initialState: {}, messages: { Go: () => [{}, [], [{ type: "Free" }]] } });
    const lazyApp = combine({ eager, lazy });
    const [model] = lazyApp.init({ start: 10 });
    assert.deepEqual(Object.keys(model), ["eager", "elmer"]);
    const [mounted] = lazyApp.update(model, to("lazy", { type: "Go" }));
    assert.deepEqual(mounted.lazy, { n: 11 });
    const [freed, cmds] = lazyApp.update(mounted, to("eager", { type: "Go" }));
    assert.deepEqual(Object.keys(freed), ["eager", "elmer"]);
    assert.deepEqual(cmds, [{ type: "Cleanup", feature: "lazy" }]);
    assert.deepEqual(lazyApp.update(freed, to("lazy", { type: "Go" }))[0].lazy, { n: 11 }, "mounted again from init");
  });

  test("lazy: { events } ignores the other events while unmounted", () => {
    const lazy = defineFeature({ lazy: { events: ["Wake"] }, initialState: { n: 0 }, on: { Wake: (model) => [{ n: model.n + 1 }, []], Other: (model) => [{ n: model.n + 10 }, []] } });
    const eager = (type) => defineFeature({ initialState: {}, messages: { Go: () => [{}, [], [{ type }]] } });
    const go = to("eager", { type: "Go" });
    const ignored = combine({ eager: eager("Other"), lazy });
    assert.equal("lazy" in ignored.update(ignored.init({})[0], go)[0], false);
    const woken = combine({ eager: eager("Wake"), lazy });
    assert.deepEqual(woken.update(woken.init({})[0], go)[0].lazy, { n: 1 });
  });

  test("an event mounts a lazy feature that subscribed to it", () => {
    const lazy = defineFeature({ lazy: true, initialState: { seen: 0 }, on: { Ping: (model) => [{ seen: model.seen + 1 }, []] } });
    const eager = defineFeature({ initialState: {}, messages: { Go: () => [{}, [], [{ type: "Ping" }]] } });
    const lazyApp = combine({ eager, lazy });
    const [next, , delivered] = lazyApp.update(lazyApp.init({})[0], to("eager", { type: "Go" }));
    assert.deepEqual(next.lazy, { seen: 1 });
    assert.deepEqual(delivered[0].handledBy, ["lazy"]);
  });

  test("the counter example: an event of a feature reaches another, and the view addresses its handlers", () => {
    const app = combine(exampleFeatures);
    const [model] = app.init({});
    const [next] = app.update(model, to("counter", { type: "Increment" }));
    assert.equal("log" in model, false, "the lazy log has no slice yet");
    assert.deepEqual([next.counter.count, next.log.lines], [1, ["count = 1"]]);
    assert.equal("log" in app.update(next, to("counter", { type: "Reset" }))[0], false, "and frees it on reset");
    const tree = exampleView(next);
    assert.deepEqual(tree.children[0].children[1].props.onClick, to("counter", { type: "Increment" }));
  });

  test("the elmer folder does not depend on the application", () => {
    const dir = new URL("../framework/elmer/", import.meta.url);
    for (const file of fs.readdirSync(dir).filter((name) => name.endsWith(".js"))) {
      const imports = [...fs.readFileSync(new URL(file, dir), "utf8").matchAll(/from "([^"]+)"/g)].map((match) => match[1]);
      assert.ok(imports.every((path) => path.startsWith("./")), `${file} imports outside the framework: ${imports}`);
    }
  });
});

describe("elmer html", () => {
  test("builds the same virtual nodes as h, with static and dynamic attributes", () => {
    const message = { type: "Go" };
    const node = html`<button id="go" class="a b" disabled onClick=${message} data-x="n${1}">Go</button>`;
    assert.deepEqual(node, h("button", { id: "go", className: "a b", disabled: true, onClick: message, "data-x": "n1" }, "Go"));
  });

  test("values keep their type, are never parsed as markup, and falsy ones are ignored", () => {
    const handler = () => ({ type: "Go" });
    const node = html`<p onClick=${handler}>${"<b>x</b>"}${false}${null}${undefined}${0}</p>`;
    assert.equal(node.props.onClick, handler);
    assert.deepEqual(node.children, ["<b>x</b>0"]);
  });

  test("lists are flattened, nodes nest, and text around values is one text node", () => {
    const items = ["a", "b"].map((item) => html`<li>${item}</li>`);
    const node = html`<ul>${items}</ul>`;
    assert.deepEqual(node, h("ul", {}, h("li", {}, "a"), h("li", {}, "b")));
    assert.deepEqual(html`<p>${"x"} : ${2} / ${3}</p>`.children, ["x : 2 / 3"]);
  });

  test("the indentation does not show up, the spaces of a line do", () => {
    const node = html`
      <div>
        <p>
          Hello
          world
        </p>
        <span>a <b>b</b> c</span>
      </div>`;
    assert.deepEqual(node, h("div", {}, h("p", {}, "Hello world"), h("span", {}, "a ", h("b", {}, "b"), " c")));
  });

  test("void and self-closing tags, several roots, and an empty template", () => {
    assert.deepEqual(html`<input id="a" /><br><input id="b">`, [h("input", { id: "a" }), h("br", {}), h("input", { id: "b" })]);
    assert.equal(html``, null);
  });

  test("a malformed template fails loudly", () => {
    assert.throws(() => html`<div><p></div>`, /unexpected closing tag/);
    assert.throws(() => html`<div>`, /missing closing tag/);
    assert.throws(() => html`<div class=a></div>`, /must be quoted/);
    assert.throws(() => html`a < b`, /must start a tag/);
  });

  test("a template is parsed once per call site", () => {
    const render = (value) => html`<p>${value}</p>`;
    assert.deepEqual(render("a").children, ["a"]);
    assert.deepEqual(render("b").children, ["b"]);
  });
});
