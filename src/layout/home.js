// src/layout/home.js

import { embed, h } from "../../framework/elmer/index.js";
import { feature as catalog } from "../features/catalog.js";
import { feature as quiz } from "../features/quiz.js";

// Home screen: choose a grade and filters (grade), then a waza to start a session (quiz).
export const home = (model) => {
  return h("section", { id: "home" },
    embed("catalog", catalog.view(model.catalog)),
    embed("quiz", quiz.views.picker(model))
  );
}
