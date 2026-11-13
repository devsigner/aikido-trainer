// Fonctions pures : aucune dépendance au DOM, au réseau ni au hasard.
export const POIDS_NOUVEAU = 1.5;
export const POIDS_ATTENTION = 1.5;
export const WAZA_ORDER = ["Tachi waza", "Hanmi Handachi waza", "Suwari waza"];

// Fusionne `over` dans `base` : les attaques et techniques sont appariées par nom,
// les champs de `over` écrasent ceux de `base`.
export function mergeGrades(base, over) {
  const merged = { ...base, ...over, waza: {} };
  const wazaNames = new Set([...Object.keys(base.waza), ...Object.keys(over.waza)]);
  for (const w of wazaNames) {
    const attaques = (base.waza[w] || []).map((a) => ({ ...a, techniques: [...a.techniques] }));
    for (const oa of over.waza[w] || []) {
      const ba = attaques.find((a) => a.nom === oa.nom);
      if (!ba) {
        attaques.push(oa);
        continue;
      }
      Object.assign(ba, { ...oa, techniques: ba.techniques });
      for (const ot of oa.techniques) {
        const i = ba.techniques.findIndex((t) => t.nom === ot.nom);
        if (i < 0) ba.techniques.push(ot);
        else ba.techniques[i] = { ...ba.techniques[i], ...ot };
      }
    }
    merged.waza[w] = attaques;
  }
  return merged;
}

export function countTechniques(d) {
  return Object.values(d.waza).flat().reduce((n, a) => n + a.techniques.length, 0);
}

export function buildPool(data, waza, { nouveau = false, attention = false } = {}) {
  const items = [];
  for (const att of data.waza[waza] || []) {
    for (const t of att.techniques) {
      if ((nouveau || attention) && !((nouveau && t.nouveau) || (attention && t.attention))) continue;
      const poids = (t.nouveau ? POIDS_NOUVEAU : 1) * (t.attention ? POIDS_ATTENTION : 1);
      const formes = t.formes.length ? t.formes : [null];
      for (const forme of formes) items.push({ waza, attaque: att.nom, t, forme, poids });
    }
  }
  return items;
}

// Tirage pondéré : `r` ∈ [0, 1[ vient d'un effet (Random), la fonction reste pure.
export function pickIndex(pool, r) {
  let left = r * pool.reduce((s, i) => s + i.poids, 0);
  for (let i = 0; i < pool.length; i++) {
    left -= pool[i].poids;
    if (left <= 0) return i;
  }
  return pool.length - 1;
}

export const norm = (s) => s.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();
export const byOrder = (a, b) => a.order - b.order || a.nom.localeCompare(b.nom, "fr");
export const badgesOf = (t) => [t.nouveau ? "🆕" : "", t.attention ? "⚠️" : ""].join(" ").trim();

export const listAttaques = (data, waza) => [...(data.waza[waza] || [])].sort(byOrder);

export const listTechniques = (data, waza, attaque) =>
  [...((data.waza[waza] || []).find((a) => a.nom === attaque) || { techniques: [] }).techniques].sort(byOrder);

// Même technique (nom normalisé) sous d'autres attaques du même waza.
export function findSameTechnique(data, waza, attaque, nomTechnique) {
  return (data.waza[waza] || [])
    .filter((a) => a.nom !== attaque)
    .flatMap((a) => a.techniques.filter((t) => norm(t.nom) === norm(nomTechnique)).map((t) => ({ attaque: a.nom, t })));
}
