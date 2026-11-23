// src/shared/screen.js

// Screen shown, derived from the features: "home" (quiz) or "program" (program open).
export const screenOf = (model) => (model.program ? "program" : "home");
