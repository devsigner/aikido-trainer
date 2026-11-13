// view(model) → arbre virtuel (données pures). Les gestionnaires sont des messages.
import { h } from "./vdom.js";
import { WAZA_ORDER, badgesOf, buildPool, findSameTechnique, listAttaques, listTechniques } from "./logic.js";

const card = (prefix, { waza = "", attaque = "", technique = "", forme = "", badges = "", note = "", video = "" }, id = prefix) =>
  h("div", { id: `${id}`, className: "card" },
    h("div", { id: `${prefix}-waza`, className: "waza" }, waza),
    h("div", { id: `${prefix}-attaque`, className: "attaque" }, attaque),
    h("div", { id: `${prefix}-technique`, className: "technique" }, technique),
    h("div", { id: `${prefix}-forme`, className: "forme" }, forme),
    h("div", { id: `${prefix}-badges`, className: "badges" }, badges),
    h("div", { id: `${prefix}-note`, className: "note" }, note),
    video ? h("a", { id: `${prefix}-video`, className: "video", href: video, target: "_blank", rel: "noopener" }, "▶ Voir la vidéo") : null,
  );

const home = (m) => {
  const empty = Object.fromEntries(WAZA_ORDER.map((w) => [w, buildPool(m.data, w, m.filters).length === 0]));
  return h("section", { id: "home" },
    h("div", { className: "group settings" },
      h("label", { className: "field" }, "Grade",
        h("select", { id: "grade", onChange: (e) => ({ type: "SelectGrade", id: e.target.value }) },
          m.grades.map((g) => h("option", { value: g.id, selected: g.id === m.gradeId }, `${g.label} (${g.count} techniques)`)))),
      h("div", { className: "filters" },
        h("label", {}, h("input", { type: "checkbox", id: "f-nouveau", checked: m.filters.nouveau, onChange: (e) => ({ type: "SetFilter", name: "nouveau", checked: e.target.checked }) }), " 🆕 Nouveautés"),
        h("label", {}, h("input", { type: "checkbox", id: "f-attention", checked: m.filters.attention, onChange: (e) => ({ type: "SetFilter", name: "attention", checked: e.target.checked }) }), " ⚠️ Attention"))),
    h("div", { className: "group grow" },
      h("p", { className: "hint" }, "Choisissez un waza :"),
      h("div", { id: "waza-buttons", className: "buttons grow" },
        WAZA_ORDER.map((w) => h("button", { disabled: empty[w], onClick: { type: "StartSession", waza: w } }, w))),
      h("p", { id: "home-msg", className: "hint" }, Object.values(empty).some(Boolean) ? "Un waza grisé n'a aucune technique pour ces filtres." : "")));
};

const draw = (m) => {
  const c = m.current;
  const shown = c && {
    waza: m.waza,
    attaque: c.attaque,
    technique: c.t.nom,
    forme: c.forme || "",
    badges: badgesOf(c.t),
    note: c.t.note || "",
    video: c.t.video || "",
  };
  return h("section", { id: "draw" },
    h("p", { id: "progress", className: "hint" }, `${m.waza} : ${m.total - m.pool.length} / ${m.total}`),
    m.done ? h("div", { id: "done" }, "Waza terminé 🎉") : card("card", shown || {}),
    h("div", { className: "buttons actions" },
      !m.done && h("button", { id: "next", onClick: { type: "Next" } }, "Technique suivante"),
      h("button", { id: "home-btn", className: "secondary", onClick: { type: "GoHome" } }, "Retour à l'accueil"),
      h("button", { id: "prog-btn", className: "secondary", onClick: { type: "OpenProgram" } }, "Voir le programme")));
};

const item = (label, to) => h("button", { className: "item", onClick: { type: "Navigate", to } }, label);

const program = (m) => {
  const { niveau, attaque, technique } = m.program;
  const back = niveau === 1 ? "← Tirage" : niveau === 2 ? "← Programme" : `← ${attaque}`;
  let head = null;
  let title;
  let sub;
  let items;
  if (niveau === 1) {
    const attaques = listAttaques(m.data, m.waza);
    title = m.waza;
    sub = `${attaques.length} attaques`;
    items = attaques.map((a) => item(a.nom, { niveau: 2, attaque: a.nom }));
  } else if (niveau === 2) {
    const techniques = listTechniques(m.data, m.waza, attaque);
    head = card("prog", { waza: m.waza, attaque }, "prog-card");
    title = "Techniques";
    sub = `${techniques.length} techniques`;
    items = techniques.map((t) => item(`${t.nom} ${badgesOf(t)}`.trim(), { niveau: 3, attaque, technique: t.nom }));
  } else {
    const t = listTechniques(m.data, m.waza, attaque).find((x) => x.nom === technique);
    head = card("prog", { waza: m.waza, attaque, technique: t.nom, forme: t.formes.join(" · "), badges: badgesOf(t), note: t.note || "", video: t.video || "" }, "prog-card");
    const others = findSameTechnique(m.data, m.waza, attaque, t.nom);
    title = "Même technique, autres attaques";
    sub = others.length ? "" : "Aucune autre attaque pour cette technique.";
    items = others.map((o) => item(`${o.attaque} ${badgesOf(o.t)}`.trim(), { niveau: 3, attaque: o.attaque, technique: o.t.nom }));
  }
  return h("section", { id: "program" },
    h("button", { id: "prog-back", className: "secondary back", onClick: { type: "Back" } }, back),
    head,
    h("div", { className: "group" },
      h("h2", { id: "prog-title" }, title),
      h("p", { id: "prog-sub", className: "hint" }, sub),
      h("div", { id: "prog-list", className: "buttons" }, items)));
};

export function view(m) {
  let body;
  if (m.status === "loading") body = h("p", { className: "hint" }, "Chargement…");
  else if (m.status === "error") body = h("p", { className: "hint" }, m.error);
  else body = { home, draw, program }[m.screen](m);
  return h("main", {}, h("h1", {}, "合気道 Aïkido"), body);
}
