// src/layout/title.js

import { html, to } from "../../framework/elmer/index.js";

// Title of the app: goes back home.
export const title = () => html`<h1 id="title" onClick=${to("navigation", { type: "GoHome" })}>合気道 Aïkido</h1>`;
