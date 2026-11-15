// src/update-history.js

// Cross-cutting concern of `update`: browser history and card animation.
// Not a feature of its own: it wraps the result of every feature handler (see `update` in update.js).
import { toHash } from "./route.js";

// Screen shown, derived from the features: "home" (no session), "draw" (a session), "program" (program open).
export const screenOf = (model) => (model.program.at ? "program" : model.draw.waza ? "draw" : "home");

// Event published by a feature when the URL must follow its change (`mode`: "push" | "replace"), see `reactions`.
export const navigated = (mode) => ({ type: "Navigated", mode });

export const initialModel = {
  slide: { direction: "", count: 0 }, // transition between program levels: { direction: "back" | "forward" | "", count }
  position: 0, // index of the current history entry (tells back from forward)
};

// Command that writes the model in the URL (`mode`: "push" adds a history entry, "replace" does not).
export function url(model, mode) {
  return { type: "Url", mode, hash: toHash(model) };
}

// Position in the history: +1 on each push, the popped entry's position on a pop.
// Stamped on Url commands.
export function withPosition(before, [after, commands], msg) {
  const pushes = commands.some((command) => command.type === "Url" && command.mode === "push");
  const position = msg.type === "Popped" ? msg.position : before.position + (pushes ? 1 : 0);

  return [{ ...after, position }, commands.map((command) => (command.type === "Url" ? { ...command, position } : command))];
}

function sameProgram(from, to) {
  return from?.level === to?.level
    && from?.attack === to?.attack
    && from?.technique === to?.technique;
}

function sameView(before, after) {
  return screenOf(before) === screenOf(after)
    && before.draw.current === after.draw.current
    && sameProgram(before.program.at, after.program.at);
}

// Direction of the card animation: a history pop follows the history (back or forward),
// a message may force it (`direction`), otherwise going up a program level is "back" and everything else is "forward".
function slideDirection(before, after, msg) {
  if (msg.direction) return msg.direction;
  if (msg.type === "Popped" && msg.position !== before.position) return msg.position < before.position ? "back" : "forward";

  const [from, to] = [before.program.at, after.program.at];
  return from && (!to || to.level < from.level) ? "back" : "forward";
}

export function withSlide(before, after, msg) {
  if (before.grade.status !== "ready" || sameView(before, after)) return after;
  return { ...after, slide: { direction: slideDirection(before, after, msg), count: after.slide.count + 1 } };
}
