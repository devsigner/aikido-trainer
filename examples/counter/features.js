// examples/counter/features.js

// Two features composed with the framework: a counter, and a log that reacts to the counter's events.
import { defineFeature, embed, h, to, UNMOUNT } from "../../framework/elmer/index.js";

export const counter = defineFeature({
  model: { count: 0 },
  messages: {
    Increment: (model) => [{ count: model.count + 1 }, [], [{ type: "Incremented", count: model.count + 1 }]],
    Reset: () => [{ count: 0 }, [], [{ type: "WasReset" }]],
  },
  view: (model) => h("div", {},
    h("p", { id: "count" }, String(model.count)),
    h("button", { id: "inc", onClick: { type: "Increment" } }, "+1"),
    h("button", { id: "reset", onClick: { type: "Reset" } }, "Reset")),
});

// Lazy: it has no slice (no memory) until the first increment, and frees it when the counter is reset.
export const log = defineFeature({
  lazy: true,
  model: { lines: [] },
  // Reacts to an event of another feature; it never touches the counter's slice.
  on: {
    Incremented: (model, event) => [{ lines: [...model.lines, `count = ${event.count}`] }, []],
    WasReset: () => [UNMOUNT, []],
  },
  view: (model) => h("ul", { id: "log" }, model.lines.map((line) => h("li", {}, line))),
});

export const features = { counter, log };

// Root view: composes the views of the features; `embed` addresses their handlers to them.
export const view = (model) => h("main", {},
  embed("counter", counter.view(model.counter)),
  model.log && embed("log", log.view(model.log)),
  h("button", { id: "reset-all", onClick: to("counter", { type: "Reset" }) }, "Reset (counter)"));
