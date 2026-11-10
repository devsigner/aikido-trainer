const POIDS_NOUVEAU = 1.5;
const POIDS_ATTENTION = 1.5;
const WAZA_ORDER = ["Tachi waza", "Hanmi Handachi waza", "Suwari waza"];

const $ = (id) => document.getElementById(id);

let data = null;
let pool = [];
let total = 0;
let currentWaza = "";

async function loadGrade(fichier) {
  const res = await fetch(`data/${fichier}`);
  data = await res.json();
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

function goHome() {
  pool = [];
  $("draw").hidden = true;
  $("home").hidden = false;
  renderWazaButtons();
}

async function init() {
  const grades = await (await fetch("data/grades.json")).json();
  const sel = $("grade");
  grades.forEach((g) => sel.add(new Option(g.label, g.fichier)));
  sel.onchange = () => loadGrade(sel.value);
  $("f-nouveau").onchange = $("f-attention").onchange = () => data && renderWazaButtons();
  $("next").onclick = next;
  $("home-btn").onclick = goHome;
  await loadGrade(sel.value);
}

init();
