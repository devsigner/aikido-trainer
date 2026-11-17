// src/layout/page.js

import { embed, html } from "../../framework/elmer/index.js";
import { feature as video } from "../features/video.js";
import { footer } from "./footer.js";

// Page skeleton: the content, the footer and the video modal.
export const page = (model, ...children) => html`<main>${children}${footer()}${embed("video", video.view(model.video))}</main>`;
