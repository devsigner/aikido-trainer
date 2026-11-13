const POIDS_NOUVEAU = 1.5;
const POIDS_ATTENTION = 1.5;
const WAZA_ORDER = ["Tachi waza", "Hanmi Handachi waza", "Suwari waza"];

const $ = (id) => document.getElementById(id);

let data = null;
let pool = [];
let total = 0;
let currentWaza = "";

let grades = [];

// Fusionne `over` dans `base` : les attaques et techniques sont appariées par nom,
// les champs de `over` écrasent ceux de `base`.
function mergeGrades(base, over) {
  const merged = { ...base, ...over, waza: {} };
  const wazaNames = new Set([...Object.keys(base.waza), ...Object.keys(over.waza)]);
  for (const w of wazaNames) {
    const attaques = (base.waza[w] || []).map((a) => ({ ...a, techniques: [...a.techniques] }));
    for (const oa of over.waza[w] || []) {
      // if not existing, add it
      const ba = attaques.find((a) => a.nom === oa.nom);
      if (!ba) {
        attaques.push(oa);
        continue;
      }
      // or merge it
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

async function loadFile(fichier) {
  const res = await fetch(`data/${fichier}`);
  return res.json();
}

async function resolveGrade(id) {
  const g = grades.find((x) => x.id === id);
  let result = null;
  for (const fichier of [...(g.inclut || []), g.fichier]) {
    const d = await loadFile(fichier);
    result = result ? mergeGrades(result, d) : d;
  }
  return result;
}

function countTechniques(d) {
  return Object.values(d.waza).flat().reduce((n, a) => n + a.techniques.length, 0);
}

async function loadGrade(id) {
  data = await resolveGrade(id);
  renderWazaButtons();
}

function buildPool(waza) {
  const fNouveau = $("f-nouveau").checked;
  const fAttention = $("f-attention").checked;
  const items = [];
  for (const att of data.waza[waza] || []) {
    for (const t of att.techniques) {
      if ((fNouveau || fAttention) && !((fNouveau && t.nouveau) || (fAttention && t.attention))) continue;
      const poids = (t.nouveau ? POIDS_NOUVEAU : 1) * (t.attention ? POIDS_ATTENTION : 1);
      const formes = t.formes.length ? t.formes : [null];
      for (const forme of formes) items.push({ waza, attaque: att.nom, t, forme, poids });
    }
  }
  return items;
}

function renderWazaButtons() {
  const box = $("waza-buttons");
  box.innerHTML = "";
  let anyEmpty = false;
  for (const waza of WAZA_ORDER) {
    const btn = document.createElement("button");
    btn.textContent = waza;
    const empty = buildPool(waza).length === 0;
    btn.disabled = empty;
    anyEmpty ||= empty;
    btn.onclick = () => startSession(waza);
    box.appendChild(btn);
  }
  $("home-msg").textContent = anyEmpty ? "Un waza grisé n'a aucune technique pour ces filtres." : "";
}

function startSession(waza) {
  currentWaza = waza;
  pool = buildPool(waza);
  total = pool.length;
  $("home").hidden = true;
  $("draw").hidden = false;
  next();
}

function pick() {
  const sum = pool.reduce((s, i) => s + i.poids, 0);
  let r = Math.random() * sum;
  for (let i = 0; i < pool.length; i++) {
    r -= pool[i].poids;
    if (r <= 0) return pool.splice(i, 1)[0];
  }
  return pool.pop();
}

function next() {
  const done = pool.length === 0;
  $("card").hidden = done;
  $("done").hidden = !done;
  $("next").hidden = done;
  if (done) {
    $("progress").textContent = `${currentWaza} : ${total} / ${total}`;
    return;
  }
  const { attaque, t, forme } = pick();
  $("card-waza").textContent = currentWaza;
  $("card-attaque").textContent = attaque;
  $("card-technique").textContent = t.nom;
  $("card-forme").textContent = forme || "";
  $("card-badges").textContent = [t.nouveau ? "🆕" : "", t.attention ? "⚠️" : ""].join(" ").trim();
  $("card-note").textContent = t.note || "";
  const v = $("card-video");
  v.hidden = !t.video;
  v.href = null
  if (t.video) v.href = t.video;
  $("progress").textContent = `${currentWaza} : ${total - pool.length} / ${total}`;
}

const norm = (s) => s.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();

function listAttaques(waza) {
  return data.waza[waza] || [];
}

function listTechniques(waza, attaque) {
  return (listAttaques(waza).find((a) => a.nom === attaque) || { techniques: [] }).techniques;
}

// Même technique (nom normalisé) sous d'autres attaques du même waza.
function findSameTechnique(waza, attaque, nomTechnique) {
  return listAttaques(waza)
    .filter((a) => a.nom !== attaque)
    .flatMap((a) => a.techniques.filter((t) => norm(t.nom) === norm(nomTechnique)).map((t) => ({ attaque: a.nom, t })));
}

const badgesOf = (t) => [t.nouveau ? "🆕" : "", t.attention ? "⚠️" : ""].join(" ").trim();

function listButton(label, onclick) {
  const b = document.createElement("button");
  b.className = "item";
  b.textContent = label;
  b.onclick = onclick;
  return b;
}

function fillCard(prefix, { waza = "", attaque = "", technique = "", formes = "", badges = "", note = "", video = "" }) {
  $(`${prefix}-waza`).textContent = waza;
  $(`${prefix}-attaque`).textContent = attaque;
  $(`${prefix}-technique`).textContent = technique;
  $(`${prefix}-forme`).textContent = formes;
  $(`${prefix}-badges`).textContent = badges;
  $(`${prefix}-note`).textContent = note;
  const v = $(`${prefix}-video`);
  v.hidden = !video;
  if (video) v.href = video;
}

let view = null;

function renderProgram(v) {
  view = v;
  $("draw").hidden = true;
  $("program").hidden = false;
  const list = $("prog-list");
  list.innerHTML = "";
  const open = (next) => navigate(next);

  if (v.niveau === 1) {
    $("prog-back").textContent = "← Tirage";
    $("prog-card").hidden = true;
    $("prog-title").textContent = currentWaza;
    const attaques = listAttaques(currentWaza);
    $("prog-sub").textContent = `${attaques.length} attaques`;
    for (const a of attaques) list.appendChild(listButton(a.nom, () => open({ niveau: 2, attaque: a.nom })));

  } else if (v.niveau === 2) {
    $("prog-back").textContent = "← Programme";
    $("prog-card").hidden = false;
    fillCard("prog", { waza: currentWaza, attaque: v.attaque });
    const techniques = [...listTechniques(currentWaza, v.attaque)].sort((a, b) => a.nom.localeCompare(b.nom, "fr"));
    $("prog-title").textContent = "Techniques";
    $("prog-sub").textContent = `${techniques.length} techniques`;
    for (const t of techniques) {
      list.appendChild(listButton(`${t.nom} ${badgesOf(t)}`.trim(), () => open({ niveau: 3, attaque: v.attaque, technique: t.nom })));
    }

  } else {
    $("prog-back").textContent = `← ${v.attaque}`;
    $("prog-card").hidden = false;
    const t = listTechniques(currentWaza, v.attaque).find((x) => x.nom === v.technique);
    fillCard("prog", {
      waza: currentWaza,
      attaque: v.attaque,
      technique: t.nom,
      formes: t.formes.join(" · "),
      badges: badgesOf(t),
      note: t.note,
      video: t.video,
    });
    const others = findSameTechnique(currentWaza, v.attaque, t.nom);
    $("prog-title").textContent = "Même technique, autres attaques";
    $("prog-sub").textContent = others.length ? "" : "Aucune autre attaque pour cette technique.";
    for (const o of others) {
      list.appendChild(listButton(`${o.attaque} ${badgesOf(o.t)}`.trim(), () => open({ niveau: 3, attaque: o.attaque, technique: o.t.nom })));
    }
  }
}

function navigate(v) {
  renderProgram(v);
  if (typeof history !== "undefined") history.pushState(v, "");
}

function openProgram() {
  $("draw").hidden = true;
  $("program").hidden = false;
  navigate({ niveau: 1 });
}

function closeProgram() {
  view = null;
  $("program").hidden = true;
  $("draw").hidden = false;
}

function applyBack() {
  if (!view || view.niveau === 1) closeProgram();
  else renderProgram(view.niveau === 3 ? { niveau: 2, attaque: view.attaque } : { niveau: 1 });
}

function backProgram() {
  if (typeof history !== "undefined") history.back();
  else applyBack();
}

function goHome() {
  pool = [];
  $("draw").hidden = true;
  $("home").hidden = false;
  renderWazaButtons();
}

async function init() {
  grades = await (await fetch("data/grades.json")).json();
  const sel = $("grade");
  for (const g of grades) {
    const n = countTechniques(await resolveGrade(g.id));
    sel.add(new Option(`${g.label} (${n} techniques)`, g.id));
  }
  sel.onchange = () => loadGrade(sel.value);
  $("f-nouveau").onchange = $("f-attention").onchange = () => data && renderWazaButtons();
  $("next").onclick = next;
  $("home-btn").onclick = goHome;
  $("prog-btn").onclick = openProgram;
  $("prog-back").onclick = backProgram;
  if (typeof window !== "undefined") {
    // Le retour du navigateur remonte d'un niveau, puis ferme le programme.
    window.addEventListener("popstate", (e) => (e.state ? renderProgram(e.state) : closeProgram()));
    history.replaceState(null, "");
  }
  await loadGrade(sel.value);
}

init();
