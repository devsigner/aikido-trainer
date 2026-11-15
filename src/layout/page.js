// src/layout/page.js

import { h } from "../../framework/elmer/vdom.js";
import { embed } from "../../framework/elmer/combine.js";
import { feature as video } from "../features/video.js";
import { footer } from "./footer.js";

// Page skeleton: the content, the footer and the video modal.
export const page = (model, ...children) => h("main", {}, ...children, footer(), embed("video", video.view(model.video)));
