// src/layout/card.js

// Card of a technique, shared by the quiz and program views: it reads the video preference and the slide of the root model.
import { h } from "../framework/vdom.js";
import { badgesOf } from "../shared/logic.js";
import { videoLink } from "../features/video.js";

// `technique` = entry of the data (name, note, video, isNew…); `form` = text of the forms to show.
// The `prefix` is used to generate the element ids; `id` is the one of the card itself.
export const card = (root, { prefix, id = prefix, waza = "", attack = "", technique = null, form = "" }) => {
  const { direction, count } = root.slide;
  return h("div", { id, className: direction ? `card slide-${direction}` : "card", key: count },
    h("div", { id: `${prefix}-waza`, className: "waza" }, waza),
    h("div", { id: `${prefix}-attack`, className: "attack" }, attack),
    h("div", { id: `${prefix}-technique`, className: "technique" }, technique?.name ?? ""),
    h("div", { id: `${prefix}-form`, className: "form" }, form),
    h("div", { id: `${prefix}-badges`, className: "badges" }, technique ? badgesOf(technique) : ""),
    h("div", { id: `${prefix}-note`, className: "note" }, technique?.note || ""),
    technique?.video ? videoLink(root, technique.video, `${prefix}-video`) : null,
  );
};
