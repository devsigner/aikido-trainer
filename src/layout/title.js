// src/layout/title.js

import { h } from "../framework/vdom.js";
import { to } from "../framework/combine.js";

// Title of the app: goes back home.
export const title = () => h("h1", { id: "title", onClick: to("draw", { type: "GoHome" }) }, "合気道 Aïkido");
