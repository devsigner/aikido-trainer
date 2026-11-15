// tests/framework.test.js
import { test, describe } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import { combine, embed, to } from "../src/framework/combine.js";
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

  test("the counter example: an event of a feature reaches another, and the view addresses its handlers", () => {
    const app = combine(exampleFeatures);
    const [model] = app.init({});
    const [next] = app.update(model, to("counter", { type: "Increment" }));
    assert.deepEqual([next.counter.count, next.log.lines], [1, ["count = 1"]]);
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
