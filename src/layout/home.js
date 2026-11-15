// src/layout/home.js

import { h } from "../framework/vdom.js";
import { embed } from "../framework/combine.js";
import { catalog } from "../features/catalog.js";
import { quiz } from "../features/quiz.js";

// Home screen: choose a grade and filters (grade), then a waza to start a session (quiz).
export const home = (model) => h("section", { id: "home" }, embed("catalog", catalog.view(model.catalog)), embed("quiz", quiz.picker(model)));
