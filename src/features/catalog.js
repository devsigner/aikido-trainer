// src/features/catalog.js

// Feature "catalog": the list of grades, the data of the selected grade, and the filters.
// Standalone feature (see src/framework/combine.js): its model, update, view and effects are all here.
// Publishes the events `GradesLoaded` (first load) and `GradeLoaded` (another grade loaded) for the features that depend on the data.
import { defineFeature } from "../framework/combine.js";
import { h } from "../framework/vdom.js";
import { countTechniques, mergeGrades } from "../shared/logic.js";
import { parseHash } from "../route.js";
import { feature as navigation } from "./navigation.js";

const { navigated } = navigation.events;

const messages = {
  GradesLoaded: (model, msg) => [{ ...model, status: "ready", list: msg.grades, id: msg.gradeId, data: msg.data }, [], [{ type: "GradesLoaded" }]],

  Failed: (model, msg) => [{ ...model, status: "error", error: msg.message }, []],

  SelectGrade(model, msg) {
    const grade = model.list.find((candidate) => candidate.id === msg.id);
    const next = { ...model, id: msg.id };
    return [next, [{ type: "LoadGrade", grade }], [navigated("replace")]];
  },

  GradeLoaded(model, msg) {
    // Stale response if the user changed grade in the meantime.
    if (msg.id !== model.id) return [model, []];
    return [{ ...model, data: msg.data }, [], [{ type: "GradeLoaded" }]];
  },

  SetFilter: (model, msg) => [{ ...model, filters: { ...model.filters, [msg.name]: msg.checked } }, []],
};

// Selector of the grade and filters, shown on the home screen.
function view(model) {
  return h("div", { className: "group settings" },
    h("label", { className: "field" }, "Grade",
      h("select", { id: "grade", onChange: (event) => ({ type: "SelectGrade", id: event.target.value }) },
        model.list.map((grade) => h("option", { value: grade.id, selected: grade.id === model.id }, `${grade.label} (${grade.count} techniques)`)))),
    h("div", { className: "filters" },
      h("label", {}, h("input", { type: "checkbox", id: "f-new", checked: model.filters.isNew, onChange: (event) => ({ type: "SetFilter", name: "isNew", checked: event.target.checked }) }), " 🆕 Nouveautés"),
      h("label", {}, h("input", { type: "checkbox", id: "f-warning", checked: model.filters.isWarning, onChange: (event) => ({ type: "SetFilter", name: "isWarning", checked: event.target.checked }) }), " ⚠️ Attention")));
}

// Shown instead of the app while the data is not available: a spinner, or the loading error.
function statusView(model) {
  if (model.status === "loading") return h("div", { id: "loading", className: "loading", role: "status", "aria-label": "Chargement" }, h("div", { className: "spinner" }));
  return h("p", { className: "hint" }, model.error);
}

export async function resolveGrade(grade, fetchJson) {
  const files = [...(grade.includes || []), grade.file];
  const datas = await Promise.all(files.map((file) => fetchJson(`data/${file}`)));
  return datas.reduce((merged, data) => mergeGrades(merged, data));
}

export const feature = defineFeature({
  model: {
    status: "loading", // loading | ready | error
    error: "", // error message if status is "error"
    list: [], // [{ id, label, file, includes?, count }]
    id: "", // id of the selected grade
    data: null, // loaded grade data (null if not loaded yet)
    filters: { isNew: false, isWarning: false },
  },
  init: ({ hash = "" } = {}, model) => [model, [{ type: "LoadGrades", gradeId: parseHash(hash).grade }]],
  messages,
  // The navigation needs another grade: select it and load its data.
  on: {
    GradeWanted(model, event) {
      const selected = model.list.find((candidate) => candidate.id === event.id);
      return selected ? [{ ...model, id: selected.id }, [{ type: "LoadGrade", grade: selected }]] : [model, []];
    },
  },
  view,
  views: { status: statusView },
  // Loading the data. Any loading error becomes a `Failed` message.
  effects({ fetchJson }) {
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
        return {
          type: "GradesLoaded",
          grades: grades.map((candidate, index) => ({ ...candidate, count: countTechniques(resolved[index]) })),
          gradeId: grades[first].id,
          data: resolved[first],
        };
      }),
      LoadGrade: loading(async ({ grade: selected }) => ({ type: "GradeLoaded", id: selected.id, data: await resolveGrade(selected, fetchJson) })),
    };
  },
});
