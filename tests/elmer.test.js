// tests/elmer.test.js

import { test, describe } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import { UNMOUNT, combine, defineFeature, embed, to } from "../framework/elmer/feature.js";
import { settingsFromEnvironment } from "../framework/elmer/elmer.js";
import { run } from "../framework/elmer/runtime.js";

const SETTINGS = { debug: "off", persist: true, historySize: 200 };
import { features as exampleFeatures, view as exampleView } from "../examples/counter/features.js";

// Two fake features: a counter that publishes an event, and a log that listens to it.
const counter = defineFeature({
  init: (flags, model) => [model, [{ type: "Hello" }]],
  model: { n: 0 },
  messages: { Inc: (model) => [{ n: model.n + 1 }, [{ type: "Echo" }], [{ type: "Changed", n: model.n + 1 }]] },
  effects: () => ({ Echo: (_, dispatch) => dispatch({ type: "Noop" }) }),
});
const log = defineFeature({
  model: { seen: [] },
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
    const ping = defineFeature({ model: {}, messages: { Go: () => [{}, [], [{ type: "A" }]] }, on: { A: () => [{}, [], [{ type: "B" }]], B: () => [{}, [], [{ type: "A" }]] } });
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

  test("defineFeature rejects unknown keys and a feature without model nor init", () => {
    assert.throws(() => defineFeature({ model: {}, update() {} }), /Unknown feature key/);
    assert.throws(() => defineFeature({ messages: {} }), /model/);
  });

  test("the feature `elmer` is added to every application: settings in model.elmer, saved when they change, name reserved", () => {
    const saved = [];
    const [model] = app.init({ elmer: { debug: "on" } });
    assert.deepEqual(model.elmer, { debug: "on", persist: true, historySize: 200 }, "the flags of the environment override the defaults");
    const [next, cmds] = app.update(model, to("elmer", { type: "DebugOff" }));
    assert.equal(next.elmer.debug, "off");
    assert.deepEqual(cmds, [{ type: "SaveSetting", key: "debug", value: "off", feature: "elmer" }]);
    app.effects({ storage: { setItem: (key, value) => saved.push([key, value]) } }).SaveSetting(cmds[0], () => {});
    assert.deepEqual(saved, [["elmer.debug", "off"]]);
    const [quiet, none] = app.update(app.update(next, to("elmer", { type: "PersistOff" }))[0], to("elmer", { type: "DebugOn" }));
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
    assert.deepEqual(settingsFromEnvironment(), { debug: "off" });
    globalThis.localStorage = { getItem: () => "on" };
    try {
      assert.deepEqual(settingsFromEnvironment(), { debug: "on" });
    } finally {
      delete globalThis.localStorage;
    }
  });

  test("time travel keeps the settings of the framework", () => {
    let handle;
    const application = combine({ plain: defineFeature({ model: {} }) });
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

  test("a lazy feature has no slice until it is reached, is mounted with the init flags, and can unmount itself", () => {
    const lazy = defineFeature({ lazy: true, model: { n: 0 }, init: ({ start }) => [{ n: start }, []], messages: { Go: (model) => [{ n: model.n + 1 }, []] }, on: { Free: () => [UNMOUNT, [{ type: "Cleanup" }]] } });
    const eager = defineFeature({ model: {}, messages: { Go: () => [{}, [], [{ type: "Free" }]] } });
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
    const lazy = defineFeature({ lazy: { events: ["Wake"] }, model: { n: 0 }, on: { Wake: (model) => [{ n: model.n + 1 }, []], Other: (model) => [{ n: model.n + 10 }, []] } });
    const eager = (type) => defineFeature({ model: {}, messages: { Go: () => [{}, [], [{ type }]] } });
    const go = to("eager", { type: "Go" });
    const ignored = combine({ eager: eager("Other"), lazy });
    assert.equal("lazy" in ignored.update(ignored.init({})[0], go)[0], false);
    const woken = combine({ eager: eager("Wake"), lazy });
    assert.deepEqual(woken.update(woken.init({})[0], go)[0].lazy, { n: 1 });
  });

  test("an event mounts a lazy feature that subscribed to it", () => {
    const lazy = defineFeature({ lazy: true, model: { seen: 0 }, on: { Ping: (model) => [{ seen: model.seen + 1 }, []] } });
    const eager = defineFeature({ model: {}, messages: { Go: () => [{}, [], [{ type: "Ping" }]] } });
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
