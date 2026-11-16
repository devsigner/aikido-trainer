// tests/helpers.js

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

export const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
export const read = (file) => fs.readFileSync(path.join(ROOT, file), "utf8");
export const readJson = (file) => JSON.parse(read(file));
export const WAZA = ["Tachi waza", "Suwari waza", "Hanmi Handachi waza"];

export const keysOf = (data) =>
  Object.entries(data.waza).flatMap(([waza, list]) => list.flatMap((attack) => attack.techniques.map((technique) => `${waza}|${attack.name}|${technique.name}`)));

// Independent of the Gren code (Grade.mergeFile): the Gren tests check that both agree on the counts.
const mergeGrades = (base, over) => {
  const merged = { ...base, ...over, waza: {} };
  for (const wazaName of new Set([...Object.keys(base.waza), ...Object.keys(over.waza)])) {
    const attacks = (base.waza[wazaName] || []).map((attack) => ({ ...attack, techniques: [...attack.techniques] }));
    for (const overAttack of over.waza[wazaName] || []) {
      const baseAttack = attacks.find((attack) => attack.name === overAttack.name);
      if (!baseAttack) {
        attacks.push(overAttack);
        continue;
      }
      Object.assign(baseAttack, { ...overAttack, techniques: baseAttack.techniques });
      for (const overTechnique of overAttack.techniques) {
        const index = baseAttack.techniques.findIndex((technique) => technique.name === overTechnique.name);
        if (index < 0) baseAttack.techniques.push(overTechnique);
        else baseAttack.techniques[index] = { ...baseAttack.techniques[index], ...overTechnique };
      }
    }
    merged.waza[wazaName] = attacks;
  }
  return merged;
};

// Files of a grade in inheritance order (parents first).
const chain = (id) => {
  const grade = readJson("data/grades.json").find((candidate) => candidate.id === id);
  return [...(grade.includes || []), grade.file].map((file) => readJson(`data/${file}`));
};
const fold = (list) => list.reduce((merged, data) => (merged ? mergeGrades(merged, data) : data), null);
export const resolveGrade = (id) => fold(chain(id));
export const parentsOf = (id) => fold(chain(id).slice(0, -1));
