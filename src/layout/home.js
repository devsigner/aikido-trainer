// src/layout/home.js

import { h } from "../framework/vdom.js";
import { embed } from "../framework/combine.js";
import { grade } from "../features/grade.js";
import { draw } from "../features/draw.js";

// Home screen: choose a grade and filters (grade), then a waza to start a session (draw).
export const home = (model) => h("section", { id: "home" }, embed("grade", grade.view(model.grade)), embed("draw", draw.picker(model)));
