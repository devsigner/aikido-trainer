// tests/framework.test.js

import { test, describe } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import { UNMOUNT, combine, embed, to } from "../src/framework/combine.js";
import { features as exampleFeatures, view as exampleView } from "../examples/counter/features.js";

// Two fake features: a counter that publishes an event, and a log that listens to it.
const counter = {
  name: "counter",
  init: () => [{ n: 0 }, [{ type: "Hello" }]],
  update: (model, msg) => (msg.type === "Inc" ? [{ n: model.n + 1 }, [{ type: "Echo" }], [{ type: "Changed", n: model.n + 1 }]] : [model, []]),
  effects: () => ({ Echo: (_, dispatch) => dispatch({ type: "Noop" }) }),
};
const log = {
  name: "log",
  init: () => [{ seen: [] }],
  update: (model) => [model, []],
  on: { Changed: (model, event, root) => [{ seen: [...model.seen, `${event.n}/${root.counter.n}`] }, []] },
  effects: () => ({ Ping: () => {} }),
};

describe("framework combine", () => {
  const app = combine([counter, log]);

  test("init builds one slice per feature and tags the commands with their feature", () => {
    const [model, cmds] = app.init();
    assert.deepEqual(model, { counter: { n: 0 }, log: { seen: [] } });
    assert.deepEqual(cmds, [{ type: "Hello", feature: "counter" }]);
  });

  test("a message only touches its feature; its events reach the subscribers, which can read the root model", () => {
    const [model] = app.init();
    const [next, cmds] = app.update(model, to("counter", { type: "Inc" }));
    assert.deepEqual(next, { counter: { n: 1 }, log: { seen: ["1/1"] } });
    assert.deepEqual(cmds, [{ type: "Echo", feature: "counter" }]);
    assert.equal(model.counter.n, 0, "the previous model is not mutated");
  });

  test("the delivered events are reported with their publisher and their receivers", () => {
    const [model] = app.init();
    const [, , delivered] = app.update(model, to("counter", { type: "Inc" }));
    assert.deepEqual(delivered, [{ event: { type: "Changed", n: 1 }, from: "counter", handledBy: ["log"] }]);
  });

  test("events published by a reaction are delivered too; an endless loop fails loudly", () => {
    const ping = { name: "ping", init: () => [{}], update: () => [{}, [], [{ type: "A" }]], on: { A: () => [{}, [], [{ type: "B" }]], B: () => [{}, [], [{ type: "A" }]] } };
    const looping = combine([ping]);
    assert.throws(() => looping.update(looping.init()[0], to("ping", {})), /Event loop/);
  });

  test("effects answer to the feature that emitted the command", () => {
    const sent = [];
    app.effects().Echo({ type: "Echo", feature: "counter" }, (message) => sent.push(message));
    assert.deepEqual(sent, [to("counter", { type: "Noop" })]);
  });

  test("duplicate feature names, effect types and unknown features are rejected", () => {
    assert.throws(() => combine([counter, counter]), /Duplicate feature/);
    assert.throws(() => combine([counter, { ...counter, name: "other" }]).effects(), /Duplicate effect/);
    assert.throws(() => app.update({}, to("nope", {})), /Unknown feature/);
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
    const lazy = { name: "lazy", lazy: true, init: ({ start }) => [{ n: start }, []], update: (model) => [{ n: model.n + 1 }, []], on: { Free: () => [UNMOUNT, [{ type: "Cleanup" }]] } };
    const eager = { name: "eager", init: () => [{}, []], update: () => [{}, [], [{ type: "Free" }]] };
    const lazyApp = combine([eager, lazy]);
    const [model] = lazyApp.init({ start: 10 });
    assert.deepEqual(Object.keys(model), ["eager"]);
    const [mounted] = lazyApp.update(model, to("lazy", {}));
    assert.deepEqual(mounted.lazy, { n: 11 });
    const [freed, cmds] = lazyApp.update(mounted, to("eager", {}));
    assert.deepEqual(Object.keys(freed), ["eager"]);
    assert.deepEqual(cmds, [{ type: "Cleanup", feature: "lazy" }]);
    assert.deepEqual(lazyApp.update(freed, to("lazy", {}))[0].lazy, { n: 11 }, "mounted again from init");
  });

  test("lazy: { events } ignores the other events while unmounted", () => {
    const lazy = { name: "lazy", lazy: { events: ["Wake"] }, init: () => [{ n: 0 }, []], update: (model) => [model, []], on: { Wake: (model) => [{ n: model.n + 1 }, []], Other: (model) => [{ n: model.n + 10 }, []] } };
    const eager = (type) => ({ name: "eager", init: () => [{}, []], update: () => [{}, [], [{ type }]] });
    const ignored = combine([eager("Other"), lazy]);
    assert.equal("lazy" in ignored.update(ignored.init({})[0], to("eager", {}))[0], false);
    const woken = combine([eager("Wake"), lazy]);
    assert.deepEqual(woken.update(woken.init({})[0], to("eager", {}))[0].lazy, { n: 1 });
  });

  test("an event mounts a lazy feature that subscribed to it", () => {
    const lazy = { name: "lazy", lazy: true, init: () => [{ seen: 0 }, []], update: (model) => [model, []], on: { Ping: (model) => [{ seen: model.seen + 1 }, []] } };
    const eager = { name: "eager", init: () => [{}, []], update: () => [{}, [], [{ type: "Ping" }]] };
    const lazyApp = combine([eager, lazy]);
    const [next, , delivered] = lazyApp.update(lazyApp.init({})[0], to("eager", {}));
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

  test("the framework folder does not depend on the application", () => {
    const dir = new URL("../src/framework/", import.meta.url);
    for (const file of fs.readdirSync(dir).filter((name) => name.endsWith(".js"))) {
      const imports = [...fs.readFileSync(new URL(file, dir), "utf8").matchAll(/from "([^"]+)"/g)].map((match) => match[1]);
      assert.ok(imports.every((path) => path.startsWith("./")), `${file} imports outside the framework: ${imports}`);
    }
  });
});
