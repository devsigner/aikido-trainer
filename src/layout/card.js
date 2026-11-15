// src/layout/card.js

// Card of a technique, shared by the quiz and program views: it reads the video preference and the slide of the root model.
import { h } from "../../framework/elmer/index.js";
import { badgesOf, findTechnique } from "../shared/logic.js";
import { feature as video } from "../features/video.js";

// The technique is given by its references (`waza`, `attack`, `technique` = names); the rest comes from the data.
// `form` = the form drawn; by default all the forms of the technique.
// The `prefix` is used to generate the element ids; `id` is the one of the card itself.
export const card = (root, { prefix, id = prefix, waza = "", attack = "", technique: name = "", form }) => {
  const { direction, count } = root.slide;
  const technique = name && findTechnique(root.catalog.data, waza, attack, name);
  return h("div", { id, className: direction ? `card slide-${direction}` : "card", key: count },
    h("div", { id: `${prefix}-waza`, className: "waza" }, waza),
    h("div", { id: `${prefix}-attack`, className: "attack" }, attack),
    h("div", { id: `${prefix}-technique`, className: "technique" }, name),
    h("div", { id: `${prefix}-form`, className: "form" }, form ?? technique?.forms?.join(" · ") ?? ""),
    h("div", { id: `${prefix}-badges`, className: "badges" }, technique ? badgesOf(technique) : ""),
    h("div", { id: `${prefix}-note`, className: "note" }, technique?.note || ""),
    technique?.video ? video.views.link(root, technique.video, `${prefix}-video`) : null,
  );
};
