// src/layout/title.js

import { h } from "../../framework/elmer/vdom.js";
import { to } from "../../framework/elmer/feature.js";

// Title of the app: goes back home.
export const title = () => h("h1", { id: "title", onClick: to("navigation", { type: "GoHome" }) }, "合気道 Aïkido");
