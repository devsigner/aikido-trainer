// src/features/program.js

// Feature "program": browsing attacks → techniques → card, in three levels.
// Standalone feature (see framework/elmer/feature.js): its model, update, view and effects are all here.
// Reads the grade data through the root model (read-only); keeps its own waza (the quiz session is over while the program is open).
// Publishes `ProgramOpened` / `ProgramClosed` ({ waza }: quiz starts a new session), `Navigated` (the URL must follow), `ViewChanged` (the card slides).
// Closes when `HomeRequested`.
import { defineFeature, emit, h, to, UNMOUNT } from "../../framework/elmer/index.js";
import { gradeData } from "../shared/grades.js";
import { WAZA_ORDER, badgesOf, findSameTechnique, listAttacks, listTechniques } from "../shared/logic.js";
import { card } from "../layout/card.js";
import { feature as navigation } from "./navigation.js";
import { feature as slide } from "./slide.js";

const { navigated } = navigation.events;
const { viewChanged } = slide.events;

export const feature = defineFeature({
  name: "program",
  lazy: { events: ["RouteChanged"] }, // the slice only exists while the program is open
  // `waza` = the waza being browsed; `current` = { level, attack?, technique? }, or null when the program is not open.
  initialState: { waza: "", current: null },
  messages: {
    OpenProgram: openProgramMessage,
    Navigate: navigateMessage,
    CloseProgram: closeProgramMessage
  },
  on: {
    HomeRequested: () => [UNMOUNT, [], viewChanged("back")],
    RouteChanged: whenRouteChanged
  },
  view,
});

// The first screen (header → card → pager) fills the viewport when there is a pager; the list is below, reached by scrolling.
function view(model, root, header) {
  const { back, backMessage, fields, actions, title, sub, items } = levels[model.current.level](root, model);
  return h("section", { id: "program" },
    h("div", { className: actions ? "screen full" : "screen" },
      header,
      h("button", { id: "home-btn", className: "secondary", onClick: to("navigation", { type: "GoHome" }) }, "Retour à l'accueil"),
      h("button", { id: "prog-back", className: "secondary back", onClick: backMessage }, back),
      card(root, { prefix: "prog", id: "prog-card", ...fields }),
      actions,
      h("h2", { id: "prog-title" }, title),
    ),
    h("div", { className: "group" },
      h("p", { id: "prog-sub", className: "hint" }, sub),
      h("div", { id: "prog-list", className: "buttons" }, items)));
}

function openProgramMessage(_, msg) {
  return [
    { waza: msg.waza, current: { level: 1 } },
    [],
    [emit("ProgramOpened"), navigated("push"), viewChanged("forward")]
  ];
}

// Going up a level slides back, unless the message forces the direction.
function navigateMessage(model, msg) {
  return [
    { ...model, current: msg.to },
    [],
    [navigated("push"), viewChanged(msg.direction || (msg.to.level < model.current.level ? "back" : "forward"))]
  ];
}

function closeProgramMessage(model) {
  return [
    UNMOUNT,
    [],
    [emit("ProgramClosed", { waza: model.waza }), navigated("push"), viewChanged("back")]
  ];
}

// URL route narrowed to what the data contains (unknown attack or technique → level above).
export function validProgram(data, { waza, program }) {
  if (!program) return null;
  const attack = listAttacks(data, waza).find((candidate) => candidate.name === program.attack);
  if (!attack) return { level: 1 };
  const technique = listTechniques(data, waza, attack.name).find((candidate) => candidate.name === program.technique);
  return technique ? { level: 3, attack: attack.name, technique: technique.name } : { level: 2, attack: attack.name };
}

const item = (label, target) => h("button", { className: "item", onClick: { type: "Navigate", to: target } }, label);

const withBadges = (label, technique) => `${label} ${badgesOf(technique)}`.trim();

// Program screen:
// 1/ choose an attack,
// 2/ then a technique,
// 3/ then see other attacks with the same technique.
const levels = {
  1(root, { waza }) {
    const attacks = listAttacks(gradeData(root), waza);
    return {
      back: "← Tirage",
      backMessage: { type: "CloseProgram" },
      fields: { waza },
      title: "Choisis une attaque :",
      sub: `${attacks.length} attaques`,
      items: attacks.map((attack) => item(attack.name, { level: 2, attack: attack.name })),
    };
  },
  2(root, { waza, current: { attack } }) {
    const techniques = listTechniques(gradeData(root), waza, attack);
    return {
      back: "← Programme",
      backMessage: { type: "Navigate", to: { level: 1 } },
      fields: { waza, attack },
      title: "Choisis une technique :",
      sub: `${techniques.length} techniques`,
      items: techniques.map((technique) => item(withBadges(technique.name, technique), { level: 3, attack, technique: technique.name })),
    };
  },
  3(root, { waza, current: { attack, technique } }) {
    const siblings = listTechniques(gradeData(root), waza, attack);
    const position = siblings.findIndex((candidate) => candidate.name === technique);
    const entry = siblings[position];
    // Neighbours wrap around the list; none when the attack has a single technique.
    const neighbour = (step) => (siblings.length > 1 ? siblings[(position + step + siblings.length) % siblings.length] : null);
    const pagerButton = (id, label, target, direction) =>
      h("button", { id, disabled: !target, onClick: target ? { type: "Navigate", to: { level: 3, attack, technique: target.name }, direction } : null }, label);
    const others = findSameTechnique(gradeData(root), waza, attack, entry.name);
    return {
      back: `← ${attack}`,
      backMessage: { type: "Navigate", to: { level: 2, attack } },
      fields: { waza, attack, technique },
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

// The URL changed: the program of the route, narrowed to what the data contains.
function whenRouteChanged(model, { route, direction }, root) {
  const current = WAZA_ORDER.includes(route.waza) ? validProgram(gradeData(root), route) : null;
  if (!current) return [UNMOUNT, [], model.current && direction ? viewChanged(direction) : []];
  const changed = model.waza !== route.waza || JSON.stringify(model.current) !== JSON.stringify(current);
  return [{ waza: route.waza, current }, [], changed && direction ? viewChanged(direction) : []];
}
