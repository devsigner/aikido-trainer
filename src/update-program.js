// Feature "program": browsing attacks → techniques → card, in three levels.
// Owns: program = { level, attack?, technique? } or null when not in the program.
import { listAttacks, listTechniques } from "./logic.js";
import { url } from "./update-history.js";

export const initialModel = { program: null };

// URL route narrowed to what the data contains (unknown attack or technique → level above).
export function validProgram(data, { waza, program }) {
  if (!program) return null;
  const attack = listAttacks(data, waza).find((candidate) => candidate.name === program.attack);
  if (!attack) return { level: 1 };
  const technique = listTechniques(data, waza, attack.name).find((candidate) => candidate.name === program.technique);
  return technique ? { level: 3, attack: attack.name, technique: technique.name } : { level: 2, attack: attack.name };
}

const open = (model, program) => {
  const next = { ...model, screen: "program", program };
  return [next, [url(next, "push")]];
};

export const updateHandler = {
  OpenProgram: (model) => open(model, { level: 1 }),

  Navigate: (model, msg) => open(model, msg.to),

  CloseProgram(model) {
    const next = { ...model, screen: "draw", program: null };
    return [next, [url(next, "push")]];
  },
};
