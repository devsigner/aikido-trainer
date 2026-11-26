// src/features/quiz.js

// Feature "quiz": the session of random techniques of the home screen, all waza together (pool without repetition).
// Standalone feature (see framework/elmer/feature.js): its model, update, view and effects are all here.
// Owns the filters of the draw (waza, 🆕, ⚠️); reads the data of the catalog feature through the root model (read-only).
// The session starts when the data is loaded and starts again when the grade or the filters change (`GradesLoaded`, `GradeLoaded`, own messages); opening the program does not affect it.
// Publishes `ViewChanged` (the card slides).
import { cmd, defineFeature, html } from "../../framework/elmer/index.js";
import { gradeData } from "../shared/grades.js";
import { WAZA_ORDER, buildFullPool, pickIndex } from "../shared/logic.js";
import { card } from "../layout/card.js";
import { feature as slide } from "./slide.js";

const { viewChanged: viewChangedEvent } = slide.events;

export const feature = defineFeature({
  name: "quiz",
  // State of the quiz session.
  // - `session` = number of the session, to ignore the answers of the `Random` effect that belong to a previous one
  // - `pool` = list of remaining techniques to draw (weighted)
  // - `total` = total number of techniques in the pool at the start of the session
  // - `current` = technique currently drawn (null if none) by references (names): { waza, attack, technique, form, weight }
  // - `done` = true if the pool is empty and the user has seen all techniques
  // - `filters` = { isNew, isWarning, waza }, `waza` = the waza drawn (all, or the one selected)
  initialState: { session: 0, pool: [], total: 0, current: null, done: false, filters: { isNew: false, isWarning: false, waza: WAZA_ORDER } },
  messages: {
    Next: nextMessage,
    Rolled: rolledMessage,
    SetFilter: setFilterMessage,
    SelectWaza: selectWazaMessage
  },
  on: {
    GradesLoaded: whenDataChanged,
    GradeLoaded: whenDataChanged
  },
  view,
  views: { filters: filtersView },
  effects: ({ random }) => ({
    Random: ({ session }, dispatch) => dispatch({ type: "Rolled", value: random(), session }),
  }),
});

// Quiz of the home screen: show a technique and ask if the user knows it.
function view(model, root) {
  const { current } = model;
  const shown = current ? { ...current, form: current.form || "" } : { form: "" };
  const played = model.total - model.pool.length;

  return html`
    <section id="quiz">
      <p id="progress" class="hint">${model.total ? `${played} / ${model.total}` : ""}</p>
      <h3 class="hint">Connais-tu cette technique ?</h3>
      ${model.total === 0 ? html`<div id="empty" class="card">Aucune technique pour ces filtres.</div>` : model.done ? html`<div id="done">Session terminée 🎉</div>` : card(root, { prefix: "card", info: true, ...shown })}
      <div class="buttons actions">
        ${model.total > 0 && !model.done && html`<button id="next" onClick=${{ type: "Next" }}>Technique suivante</button>`}
      </div>
    </section>`;
}

function nextMessage(model) {
  return model.pool.length === 0 ? [{ ...model, current: null, done: true }, [], viewChangedEvent("forward")] : [model, cmd("Random", { session: model.session })];
}

// Answer of the `Random` effect: randomness is an effect, so `update` stays pure.
function rolledMessage(model, msg) {
  if (msg.session !== model.session || model.pool.length === 0) return model; // answer of a session that is over
  const index = pickIndex(model.pool, msg.value);
  const direction = model.current ? "forward" : ""; // the first card of a session does not slide
  return [{ ...model, current: model.pool[index], pool: model.pool.filter((_, poolIndex) => poolIndex !== index) }, [], viewChangedEvent(direction)];
}

// Filters of the draw, shown on the home screen.
function filtersView(model) {
  const { isNew, isWarning, waza } = model.filters;
  const all = waza.length === WAZA_ORDER.length;
  return html`
    <div class="group">
      <label class="field">
        <select id="f-waza" onChange=${(event) => ({ type: "SelectWaza", waza: event.target.value })}>
          <option value="" selected=${all}>Tous les waza</option>
          ${WAZA_ORDER.map((name) => html`<option value=${name} selected=${!all && waza[0] === name}>${name}</option>`)}
        </select>
      </label>
      <div class="filters">
        <label><input type="checkbox" id="f-new" checked=${isNew} onChange=${(event) => ({ type: "SetFilter", name: "isNew", checked: event.target.checked })} /> 🆕 Nouveautés</label>
        <label><input type="checkbox" id="f-warning" checked=${isWarning} onChange=${(event) => ({ type: "SetFilter", name: "isWarning", checked: event.target.checked })} /> ⚠️ Attention</label>
      </div>
    </div>`;
}

// return Msg
function setFilterMessage(model, { name, checked }, root) {
  return restart(model, { ...model.filters, [name]: checked }, root);
}

// return Msg
function selectWazaMessage(model, { waza }, root) {
  return restart(model, { ...model.filters, waza: waza ? [waza] : WAZA_ORDER }, root);
}

// The data changed: a fresh session.
function whenDataChanged(model, _, root) {
  return restart(model, model.filters, root);
}

// A fresh session on the pool of the grade with these filters.
function restart(model, filters, root) {
  const pool = buildFullPool(gradeData(root), filters);
  const session = model.session + 1;
  return [{ ...feature.initialState, filters, session, pool, total: pool.length }, pool.length ? cmd("Random", { session }) : []];
}
