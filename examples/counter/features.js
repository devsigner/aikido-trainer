// examples/counter/features.js

// Two features composed with the framework: a counter, and a log that reacts to the counter's events.
import { h } from "../../src/framework/vdom.js";
import { embed, to } from "../../src/framework/combine.js";

export const counter = {
  name: "counter",
  init: () => [{ count: 0 }, []],
  update(model, msg) {
    if (msg.type === "Increment") return [{ count: model.count + 1 }, [], [{ type: "Incremented", count: model.count + 1 }]];
    if (msg.type === "Reset") return [{ count: 0 }, []];
    throw new Error(`Unknown message : ${msg.type}`);
  },
  view: (model) => h("div", {},
    h("p", { id: "count" }, String(model.count)),
    h("button", { id: "inc", onClick: { type: "Increment" } }, "+1"),
    h("button", { id: "reset", onClick: { type: "Reset" } }, "Reset")),
};

export const log = {
  name: "log",
  init: () => [{ lines: [] }, []],
  update: (model) => [model, []],
  // Reacts to an event of another feature; it never touches the counter's slice.
  on: { Incremented: (model, event) => [{ lines: [...model.lines, `count = ${event.count}`] }, []] },
  view: (model) => h("ul", { id: "log" }, model.lines.map((line) => h("li", {}, line))),
};

export const features = [counter, log];

// Root view: composes the views of the features; `embed` addresses their handlers to them.
export const view = (model) => h("main", {},
  embed("counter", counter.view(model.counter)),
  embed("log", log.view(model.log)),
  h("button", { id: "reset-all", onClick: to("counter", { type: "Reset" }) }, "Reset (counter)"));
