// src/features/slide.js

// Feature "slide": animation of the card when the view changes (`direction`: "back" | "forward" | "").
// Owns: slide = { direction, count }; `count` is the key of the card, so that it is animated again.
// Reacts to `ViewChanged` ({ direction }), published by quiz and program when what they show changes.
export const initialModel = { direction: "", count: 0 };

export const viewChanged = (direction) => ({ type: "ViewChanged", direction });

export const slide = {
  name: "slide",
  init: () => [initialModel, []],
  on: {
    ViewChanged: (model, { direction }) => [{ direction, count: model.count + 1 }, []],
  },
};
