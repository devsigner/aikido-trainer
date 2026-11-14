// Feature "grade": loading the data of the selected grade, and the filters.
// Owns: status, error, grades, gradeId, data, filters.
import { url } from "./update-history.js";
import { applyRoute } from "./update-navigation.js";

export const initialModel = {
  status: "loading", // loading | ready | error
  error: "", // error message if status is "error"
  grades: [], // [{ id, label, file, includes?, count }]
  gradeId: "", // id of the selected grade
  data: null, // loaded grade data (null if not loaded yet)
  filters: { isNew: false, isWarning: false },
};

export const updateHandler = {
  GradesLoaded(model, msg) {
    const ready = { ...model, status: "ready", grades: msg.grades, gradeId: msg.gradeId, data: msg.data, pending: null };
    const [next, cmds] = applyRoute(ready, model.pending || {});
    return [next, [url(next, "replace"), ...cmds]];
  },

  Failed: (model, msg) => [{ ...model, status: "error", error: msg.message }, []],

  SelectGrade(model, msg) {
    const grade = model.grades.find((candidate) => candidate.id === msg.id);
    const next = { ...model, gradeId: msg.id };
    return [next, [{ type: "LoadGrade", grade }, url(next, "replace")]];
  },

  GradeLoaded(model, msg) {
    // Stale response if the user changed grade in the meantime.
    if (msg.id !== model.gradeId) return [model, []];
    return model.pending
      ? applyRoute({ ...model, data: msg.data, pending: null }, model.pending)
      : [{ ...model, data: msg.data }, []];
  },

  SetFilter: (model, msg) => [{ ...model, filters: { ...model.filters, [msg.name]: msg.checked } }, []],
};
