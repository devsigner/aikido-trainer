// src/features/slide.js

// Feature "slide": animation of the card when the view changes (`direction`: "back" | "forward" | "").
// Owns: slide = { direction, count }; `count` is the key of the card, so that it is animated again.
// Reacts to `ViewChanged` ({ direction }), published by quiz and program when what they show changes.
import { defineFeature, emit } from "../../framework/elmer/index.js";

export const feature = defineFeature({
  name: "slide",
  initialState: { direction: "", count: 0 },
  events: { viewChanged },
  on: { ViewChanged: restartAnimation },
});

// direction = "back" | "forward" | "" ("" = no animation, e.g. first view)
function restartAnimation(model, { direction }) {
  return { direction, count: model.count + 1 };
}

function viewChanged(direction) {
  return emit("ViewChanged", { direction });
}
