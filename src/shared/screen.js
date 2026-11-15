// src/shared/screen.js

// Screen shown, derived from the features: "home" (no session), "draw" (a session), "program" (program open).
export const screenOf = (model) => (model.program ? "program" : model.draw ? "draw" : "home");
