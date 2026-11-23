// src/features/catalog.js

// Feature "catalog": the list of grades and the selected grade.
// The data of the grades is not in the model: it is cached in the browser (src/shared/grades.js).
// Standalone feature (see framework/elmer/feature.js): its model, update, view and effects are all here.
// Publishes the events `GradesLoaded` (first load), and `GradeLoaded` (another grade loaded) for the features that depend on the data.
import { cmd, defineFeature, emit, html } from "../../framework/elmer/index.js";
import { cacheGrade, clearGrades } from "../shared/grades.js";
import { countTechniques, mergeGrades } from "../shared/logic.js";
import { feature as navigation, parseHash } from "./navigation.js";

const { navigated: navigatedEvent } = navigation.events;

export const feature = defineFeature({
  name: "catalog",
  initialState: {
    status: "loading", // loading | ready | error
    error: "", // error message if status is "error"
    list: [], // [{ id, label, file, includes?, count }]
    id: "", // id of the selected grade
  },
  init: ({ hash = "" } = {}, model) => [model, cmd("LoadGrades", { gradeId: parseHash(hash).grade })],
  messages: {
    GradesLoaded: gradesLoadedMessage,
    Failed: failedMessage,
    SelectGrade: selectGradeMessage,
    GradeLoaded: gradeLoadedMessage
  },
  // The navigation needs another grade: select it and load its data.
  on: { GradeWanted: whenGradeWanted },
  views: { grade: gradeView, loadingStatus: loadingStatusView },
  effects: ({ fetchJson }) => {
    const loading = (fn) => async (cmd, dispatch) => {
      try {
        dispatch(await fn(cmd));
      } catch (error) {
        dispatch({ type: "Failed", message: `Chargement impossible (${error.message})` });
      }
    };
    return {
      LoadGrades: loading(async ({ gradeId }) => {
        const grades = await fetchJson("data/grades.json");
        const first = Math.max(0, grades.findIndex((candidate) => candidate.id === gradeId));
        const resolved = await Promise.all(grades.map((candidate) => resolveGrade(candidate, fetchJson)));
        clearGrades();
        grades.forEach((candidate, index) => cacheGrade(candidate.id, resolved[index]));
        return {
          type: "GradesLoaded",
          grades: grades.map((candidate, index) => ({ ...candidate, count: countTechniques(resolved[index]) })),
          gradeId: grades[first].id,
        };
      }),
      LoadGrade: loading(async ({ grade: selected }) => {
        cacheGrade(selected.id, await resolveGrade(selected, fetchJson));
        return { type: "GradeLoaded", id: selected.id };
      }),
    };
  },
});

// Selector of the grade, shown on the home screen.
function gradeView(model) {
  return html`
    <label class="field">
      <select id="grade" onChange=${(event) => ({ type: "SelectGrade", id: event.target.value })}>
        ${model.list.map((grade) => html`<option value=${grade.id} selected=${grade.id === model.id}>${grade.label} (${grade.count} techniques)</option>`)}
      </select>
    </label>`;
}

// return Msg
function gradesLoadedMessage(model, { grades, gradeId }) {
  return [{ ...model, status: "ready", list: grades, id: gradeId }, [], emit("GradesLoaded")];
}

// return Msg
function failedMessage(model, { message }) {
  return { ...model, status: "error", error: message };
}

// return Msg
function selectGradeMessage(model, { id }) {
  const grade = model.list.find((candidate) => candidate.id === id);
  return [{ ...model, id }, cmd("LoadGrade", { grade }), navigatedEvent("replace")];
}

// return Msg
function gradeLoadedMessage(model, { id }) {
  // Stale response if the user changed grade in the meantime.
  return id !== model.id ? model : [model, [], emit("GradeLoaded")];
}

function whenGradeWanted(model, { id }) {
  const selected = model.list.find((candidate) => candidate.id === id);
  return selected ? [{ ...model, id: selected.id }, cmd("LoadGrade", { grade: selected })] : model;
}

// Shown instead of the app while the data is not available: a spinner, or the loading error.
function loadingStatusView(model) {
  if (model.status === "loading") return html`<div id="loading" class="loading" role="status" aria-label="Chargement"><div class="spinner"></div></div>`;
  return html`<p class="hint">${model.error}</p>`;
}

export async function resolveGrade(grade, fetchJson) {
  const files = [...(grade.includes || []), grade.file];
  const datas = await Promise.all(files.map((file) => fetchJson(`data/${file}`)));
  return datas.reduce((merged, data) => mergeGrades(merged, data));
}
