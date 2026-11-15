// src/layout/home.js

import { h } from "../../framework/elmer/vdom.js";
import { embed } from "../../framework/elmer/combine.js";
import { feature as catalog } from "../features/catalog.js";
import { feature as quiz } from "../features/quiz.js";

// Home screen: choose a grade and filters (grade), then a waza to start a session (quiz).
export const home = (model) => h("section", { id: "home" }, embed("catalog", catalog.view(model.catalog)), embed("quiz", quiz.views.picker(model)));
