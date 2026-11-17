// src/layout/card.js

// Card of a technique, shared by the quiz and program views: it reads the video preference and the slide of the root model.
import { html } from "../../framework/elmer/index.js";
import { gradeData } from "../shared/grades.js";
import { badgesOf, findTechnique } from "../shared/logic.js";
import { feature as video } from "../features/video.js";

// The technique is given by its references (`waza`, `attack`, `technique` = names); the rest comes from the data.
// `form` = the form drawn; by default all the forms of the technique.
// The `prefix` is used to generate the element ids; `id` is the one of the card itself.
export const card = (root, { prefix, id = prefix, waza = "", attack = "", technique: name = "", form }) => {
  const { direction, count } = root.slide;
  const technique = name && findTechnique(gradeData(root), waza, attack, name);
  return html`
    <div id=${id} class=${direction ? `card slide-${direction}` : "card"} key=${count}>
      <div id=${`${prefix}-waza`} class="waza">${waza}</div>
      <div id=${`${prefix}-attack`} class="attack">${attack}</div>
      <div id=${`${prefix}-technique`} class="technique">${name}</div>
      <div id=${`${prefix}-form`} class="form">${form ?? technique?.forms?.join(" · ") ?? ""}</div>
      <div id=${`${prefix}-badges`} class="badges">${technique ? badgesOf(technique) : ""}</div>
      <div id=${`${prefix}-note`} class="note">${technique?.note || ""}</div>
      ${technique?.video ? video.views.link(root, technique.video, `${prefix}-video`) : null}
    </div>`;
};
