// src/shared/screen.js

// Screen shown, derived from the features: "home" (no session), "quiz" (a session), "program" (program open).
export const screenOf = (model) => (model.program ? "program" : model.quiz ? "quiz" : "home");
