// src/features/program.js
// Feature "program": browsing attacks → techniques → card, in three levels.
// Standalone feature (see src/framework/combine.js): its model, update, view and effects are all here.
// Reads the grade data and the waza of the draw through the root model (read-only).
// Publishes `Navigated` (the URL must follow); closes when the draw session is reset.
import { h } from "../framework/vdom.js";
import { WAZA_ORDER, badgesOf, findSameTechnique, listAttacks, listTechniques } from "../shared/logic.js";
import { card, slideProps } from "../shared/card.js";
import { navigated } from "../update-history.js";
import { to } from "../framework/combine.js";

// `at` = { level, attack?, technique? }, or null when the program is not open.
export const initialModel = { at: null };

// URL route narrowed to what the data contains (unknown attack or technique → level above).
export function validProgram(data, { waza, program }) {
  if (!program) return null;
  const attack = listAttacks(data, waza).find((candidate) => candidate.name === program.attack);
  if (!attack) return { level: 1 };
  const technique = listTechniques(data, waza, attack.name).find((candidate) => candidate.name === program.technique);
  return technique ? { level: 3, attack: attack.name, technique: technique.name } : { level: 2, attack: attack.name };
}

const open = (at) => [{ at }, [], [navigated("push")]];

const messages = {
  OpenProgram: () => open({ level: 1 }),

  Navigate: (_, msg) => open(msg.to),

  CloseProgram: () => open(null),
};

const item = (label, target) => h("button", { className: "item", onClick: { type: "Navigate", to: target } }, label);

const withBadges = (label, technique) => `${label} ${badgesOf(technique)}`.trim();

// Program screen:
// 1/ choose an attack,
// 2/ then a technique,
// 3/ then see other attacks with the same technique.
const levels = {
  1(root) {
    const attacks = listAttacks(root.grade.data, root.draw.waza);
    return {
      back: "← Tirage",
      backMessage: { type: "CloseProgram" },
      fields: { waza: root.draw.waza },
      title: "Choisis une attaque :",
      sub: `${attacks.length} attaques`,
      items: attacks.map((attack) => item(attack.name, { level: 2, attack: attack.name })),
    };
  },
  2(root, { attack }) {
    const { waza } = root.draw;
    const techniques = listTechniques(root.grade.data, waza, attack);
    return {
      back: "← Programme",
      backMessage: { type: "Navigate", to: { level: 1 } },
      fields: { waza, attack },
      title: "Choisis une technique :",
      sub: `${techniques.length} techniques`,
      items: techniques.map((technique) => item(withBadges(technique.name, technique), { level: 3, attack, technique: technique.name })),
    };
  },
  3(root, { attack, technique }) {
    const { waza } = root.draw;
    const siblings = listTechniques(root.grade.data, waza, attack);
    const position = siblings.findIndex((candidate) => candidate.name === technique);
    const current = siblings[position];
    // Neighbours wrap around the list; none when the attack has a single technique.
    const neighbour = (step) => (siblings.length > 1 ? siblings[(position + step + siblings.length) % siblings.length] : null);
    const pagerButton = (id, label, target, direction) =>
      h("button", { id, disabled: !target, onClick: target ? { type: "Navigate", to: { level: 3, attack, technique: target.name }, direction } : null }, label);
    const others = findSameTechnique(root.grade.data, waza, attack, current.name);
    return {
      back: `← ${attack}`,
      backMessage: { type: "Navigate", to: { level: 2, attack } },
      fields: { waza, attack, technique: current.name, form: current.forms.join(" · "), badges: badgesOf(current), note: current.note || "", video: current.video || "", warnVideo: !root.video.skipWarning },
      // Last row of the first screen (see `.screen.full`).
      actions: h("div", { className: "pager" },
        h("p", { className: "hint center" }, `${position + 1} / ${siblings.length}`),
        h("div", { className: "pager-buttons" },
          pagerButton("prog-prev", "Précédente", neighbour(-1), "back"),
          pagerButton("prog-next", "Suivante", neighbour(1), "forward"))),
      title: "Même technique, autres attaques ↓",
      sub: others.length ? "" : "Aucune autre attaque pour cette technique.",
      items: others.map((other) => item(withBadges(other.attack, other.technique), { level: 3, attack: other.attack, technique: other.technique.name })),
    };
  },
};

// The first screen (header → card → pager) fills the viewport when there is a pager; the list is below, reached by scrolling.
function view(model, root, header) {
  const { back, backMessage, fields, actions, title, sub, items } = levels[model.at.level](root, model.at);
  return h("section", { id: "program" },
    h("div", { className: actions ? "screen full" : "screen" },
      header,
      h("button", { id: "home-btn", className: "secondary", onClick: to("draw", { type: "GoHome" }) }, "Retour à l'accueil"),
      h("button", { id: "prog-back", className: "secondary back", onClick: backMessage }, back),
      card("prog", fields, "prog-card", slideProps(root.slide)),
      actions,
      h("h2", { id: "prog-title" }, title),
    ),
    h("div", { className: "group" },
      h("p", { id: "prog-sub", className: "hint" }, sub),
      h("div", { id: "prog-list", className: "buttons" }, items)));
}

// The URL changed: the program of the route, narrowed to what the data contains.
const routeChanged = (_, { route }, root) => [{ at: WAZA_ORDER.includes(route.waza) ? validProgram(root.grade.data, route) : null }, []];

export const program = {
  name: "program",
  init: () => [initialModel, []],
  update(model, msg, root) {
    if (!messages[msg.type]) throw new Error(`Unknown message : ${msg.type}`);
    return messages[msg.type](model, msg, root);
  },
  on: { SessionReset: () => [initialModel, []], RouteChanged: routeChanged },
  view,
};
