// Pure functions: no dependency on the DOM, the network or randomness.
export const WEIGHT_NEW = 1.5;
export const WEIGHT_WARNING = 1.5;
export const WAZA_ORDER = ["Tachi waza", "Hanmi Handachi waza", "Suwari waza"];

// Merges `over` into `base`: attacks and techniques are matched by name,
// fields of `over` override those of `base`.
export function mergeGrades(base, over) {
  const merged = { ...base, ...over, waza: {} };
  const wazaNames = new Set([...Object.keys(base.waza), ...Object.keys(over.waza)]);
  for (const wazaName of wazaNames) {
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
}

export function countTechniques(data) {
  return Object.values(data.waza).flat().reduce((total, attack) => total + attack.techniques.length, 0);
}

export function buildPool(data, waza, { isNew = false, isWarning = false } = {}) {
  const items = [];
  for (const attack of data.waza[waza] || []) {
    for (const technique of attack.techniques) {
      if ((isNew || isWarning) && !((isNew && technique.isNew) || (isWarning && technique.isWarning))) continue;
      const weight = (technique.isNew ? WEIGHT_NEW : 1) * (technique.isWarning ? WEIGHT_WARNING : 1);
      const forms = technique.forms.length ? technique.forms : [null];
      for (const form of forms) items.push({ waza, attack: attack.name, technique, form, weight });
    }
  }
  return items;
}

// Weighted draw: `random` ∈ [0, 1[ comes from an effect (Random), so the function stays pure.
export function pickIndex(pool, random) {
  let left = random * pool.reduce((sum, entry) => sum + entry.weight, 0);
  for (let index = 0; index < pool.length; index++) {
    left -= pool[index].weight;
    if (left <= 0) return index;
  }
  return pool.length - 1;
}

export const norm = (text) => text.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();
export const byOrder = (first, second) => first.order - second.order || first.name.localeCompare(second.name, "fr");
export const badgesOf = (technique) => [technique.isNew ? "🆕" : "", technique.isWarning ? "⚠️" : ""].join(" ").trim();

export const listAttacks = (data, waza) => [...(data.waza[waza] || [])].sort(byOrder);

export const listTechniques = (data, waza, attack) =>
  [...((data.waza[waza] || []).find((candidate) => candidate.name === attack) || { techniques: [] }).techniques].sort(byOrder);

// Same technique (normalized name) under other attacks of the same waza.
export function findSameTechnique(data, waza, attack, techniqueName) {
  return (data.waza[waza] || [])
    .filter((other) => other.name !== attack)
    .flatMap((other) =>
      other.techniques.filter((technique) => norm(technique.name) === norm(techniqueName)).map((technique) => ({ attack: other.name, technique })));
}
