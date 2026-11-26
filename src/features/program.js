// src/features/program.js

// Feature "program": browsing waza → attacks → techniques → card, in four levels (0 to 3).
// Standalone feature (see framework/elmer/feature.js): its model, update, view and effects are all here.
// Reads the grade data through the root model (read-only). The quiz session is kept while the program is open.
// Publishes `Navigated` (the URL must follow), `ViewChanged` (the card slides).
// Closes when `HomeRequested`.
import { defineFeature, html, to, UNMOUNT } from "../../framework/elmer/index.js";
import { gradeData } from "../shared/grades.js";
import { WAZA_ORDER, badgesOf, findSameTechnique, listAttacks, listTechniques } from "../shared/logic.js";
import { card } from "../layout/card.js";
import { feature as navigation } from "./navigation.js";
import { feature as slide } from "./slide.js";

const { navigated: navigatedEvent } = navigation.events;
const { viewChanged: viewChangedEvent } = slide.events;

export const feature = defineFeature({
  name: "program",
  lazy: { events: ["RouteChanged"] }, // the slice only exists while the program is open
  // `current` = { level, waza?, attack?, technique? }, or null when the program is not open.
  initialState: { current: null },
  messages: {
    OpenProgram: openProgramMessage,
    Navigate: navigateMessage,
    CloseProgram: closeProgramMessage
  },
  on: {
    HomeRequested: () => [UNMOUNT, [], viewChangedEvent("back")],
    RouteChanged: whenRouteChanged
  },
  view,
  views: { openButton: openButtonView },
});

// Button of the home screen.
function openButtonView() {
  return html`<button id="prog-btn" class="secondary" onClick=${{ type: "OpenProgram" }}>Programme</button>`;
}

// The first screen (header → card → pager) fills the viewport when there is a pager; the list is below, reached by scrolling.
function view(model, root, header) {
  const { back, backMessage, fields, actions, title, sub, items } = levels[model.current.level](root, model.current);

  return html`
    <section id="program">
      <div class=${actions ? "screen full" : "screen"}>
        ${header}
        <button id="home-btn" class="secondary" onClick=${to("navigation", { type: "GoHome" })}>Retour à l'accueil</button>
        ${back && html`<button id="prog-back" class="secondary back" onClick=${backMessage}>${back}</button>`}
        ${fields && card(root, { prefix: "prog", id: "prog-card", ...fields })}
        ${actions}
        <h2 id="prog-title">${title}</h2>
      </div>
      <div class="group">
        <p id="prog-sub" class="hint">${sub}</p>
        <div id="prog-list" class="buttons">${items}</div>
      </div>
    </section>`;
}

// `to` = where to land (the info button of the quiz card goes straight to a technique); the waza list by default.
function openProgramMessage(_, { to: target = { level: 0 } }) {
  return [{ current: target }, [], [navigatedEvent("push"), viewChangedEvent("forward")]];
}

// Going up a level slides back, unless the message forces the direction.
function navigateMessage(model, msg) {
  return [
    { current: msg.to },
    [],
    [navigatedEvent("push"), viewChangedEvent(msg.direction || (msg.to.level < model.current.level ? "back" : "forward"))]
  ];
}

function closeProgramMessage() {
  return [UNMOUNT, [], [navigatedEvent("push"), viewChangedEvent("back")]];
}

// URL route narrowed to what the data contains (unknown waza, attack or technique → level above).
export function validProgram(data, { program }) {
  if (!program) return null;
  const { waza, attack: attackName, technique: techniqueName } = program;
  if (!WAZA_ORDER.includes(waza)) return { level: 0 };
  const attack = listAttacks(data, waza).find((candidate) => candidate.name === attackName);
  if (!attack) return { level: 1, waza };
  const technique = listTechniques(data, waza, attack.name).find((candidate) => candidate.name === techniqueName);
  return technique ? { level: 3, waza, attack: attack.name, technique: technique.name } : { level: 2, waza, attack: attack.name };
}

const item = (label, target, disabled = false) => html`<button class="item" disabled=${disabled} onClick=${{ type: "Navigate", to: target }}>${label}</button>`;

const withBadges = (label, technique) => `${label} ${badgesOf(technique)}`.trim();

// Program screen:
// 0/ choose a waza,
// 1/ then an attack,
// 2/ then a technique,
// 3/ then see other attacks with the same technique.
const levels = {
  0(root) {
    const data = gradeData(root);
    return {
      back: null, // the home button of the header already leads back
      fields: null, // no card yet
      title: "Choisis un waza :",
      sub: "",
      items: WAZA_ORDER.map((waza) => item(waza, { level: 1, waza }, listAttacks(data, waza).length === 0)),
    };
  },
  1(root, { waza }) {
    const attacks = listAttacks(gradeData(root), waza);
    return {
      back: "← Waza",
      backMessage: { type: "Navigate", to: { level: 0 } },
      fields: { waza },
      title: "Choisis une attaque :",
      sub: `${attacks.length} attaques`,
      items: attacks.map((attack) => item(attack.name, { level: 2, waza, attack: attack.name })),
    };
  },
  2(root, { waza, attack }) {
    const techniques = listTechniques(gradeData(root), waza, attack);
    return {
      back: "← Programme",
      backMessage: { type: "Navigate", to: { level: 1, waza } },
      fields: { waza, attack },
      title: "Choisis une technique :",
      sub: `${techniques.length} techniques`,
      items: techniques.map((technique) => item(withBadges(technique.name, technique), { level: 3, waza, attack, technique: technique.name })),
    };
  },
  3(root, { waza, attack, technique }) {
    const siblings = listTechniques(gradeData(root), waza, attack);
    const position = siblings.findIndex((candidate) => candidate.name === technique);
    const entry = siblings[position];
    // Neighbours wrap around the list; none when the attack has a single technique.
    const neighbour = (step) => (siblings.length > 1 ? siblings[(position + step + siblings.length) % siblings.length] : null);
    const pagerButton = (id, label, target, direction) =>
      html`<button id=${id} disabled=${!target} onClick=${target ? { type: "Navigate", to: { level: 3, waza, attack, technique: target.name }, direction } : null}>${label}</button>`;
    const others = findSameTechnique(gradeData(root), waza, attack, entry.name);
    return {
      back: `← ${attack}`,
      backMessage: { type: "Navigate", to: { level: 2, waza, attack } },
      fields: { waza, attack, technique },
      // Last row of the first screen (see `.screen.full`).
      actions: html`
        <div class="pager">
          <p class="hint center">${position + 1} / ${siblings.length}</p>
          <div class="pager-buttons">
            ${pagerButton("prog-prev", "Précédente", neighbour(-1), "back")}
            ${pagerButton("prog-next", "Suivante", neighbour(1), "forward")}
          </div>
        </div>`,
      title: "Même technique, autres attaques ↓",
      sub: others.length ? "" : "Aucune autre attaque pour cette technique.",
      items: others.map((other) => item(withBadges(other.attack, other.technique), { level: 3, waza, attack: other.attack, technique: other.technique.name })),
    };
  },
};

// The URL changed: the program of the route, narrowed to what the data contains.
function whenRouteChanged(model, { route, direction }, root) {
  const current = validProgram(gradeData(root), route);
  if (!current) return [UNMOUNT, [], model.current && direction ? viewChangedEvent(direction) : []];
  const changed = JSON.stringify(model.current) !== JSON.stringify(current);
  return [{ current }, [], changed && direction ? viewChangedEvent(direction) : []];
}
