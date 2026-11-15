// src/layout/title.js

import { h } from "../elmer/vdom.js";
import { to } from "../elmer/combine.js";

// Title of the app: goes back home.
export const title = () => h("h1", { id: "title", onClick: to("navigation", { type: "GoHome" }) }, "合気道 Aïkido");
