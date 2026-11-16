// src/shared/grades.js

// Browser-side cache of the grade data, outside the model: the model only keeps which grade is selected.
// The `catalog` effects fill it before dispatching; the data itself is persisted by the service worker (data/*.json).
const cache = new Map();

export const cacheGrade = (id, data) => cache.set(id, data);
export const cachedGrade = (id) => cache.get(id) ?? null;
export const clearGrades = () => cache.clear();

// Data of the selected grade (null while it is not loaded).
export const gradeData = (model) => cachedGrade(model.catalog.id);
