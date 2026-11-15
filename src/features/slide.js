// src/features/slide.js

// Feature "slide": animation of the card when the view changes (`direction`: "back" | "forward" | "").
// Owns: slide = { direction, count }; `count` is the key of the card, so that it is animated again.
// Reacts to `ViewChanged` ({ direction }), published by quiz and program when what they show changes.
import { defineFeature } from "../../framework/elmer/combine.js";

const viewChanged = (direction) => ({ type: "ViewChanged", direction });

export const feature = defineFeature({
  model: { direction: "", count: 0 },
  events: { viewChanged },
  on: {
    ViewChanged: (model, { direction }) => [{ direction, count: model.count + 1 }, []],
  },
});
