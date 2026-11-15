import { test, describe } from "node:test";
import assert from "node:assert/strict";
import { combine, to } from "../src/framework/combine.js";

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
});
