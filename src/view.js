// view(model) → virtual tree (plain data). Handlers are messages.
import { h } from "./vdom.js";
import { WAZA_ORDER, badgesOf, buildPool, findSameTechnique, listAttacks, listTechniques } from "./logic.js";

// Key and class of the animated card: a new key replaces the element and restarts the animation.
const slideProps = ({ direction, count }) => ({ key: count, className: direction ? `card slide-${direction}` : "card" });

const card = (prefix, { waza = "", attack = "", technique = "", form = "", badges = "", note = "", video = "" }, id = prefix, extra = {}) =>
  h("div", { id, className: "card", ...extra },
    h("div", { id: `${prefix}-waza`, className: "waza" }, waza),
    h("div", { id: `${prefix}-attack`, className: "attack" }, attack),
    h("div", { id: `${prefix}-technique`, className: "technique" }, technique),
    h("div", { id: `${prefix}-form`, className: "form" }, form),
    h("div", { id: `${prefix}-badges`, className: "badges" }, badges),
    h("div", { id: `${prefix}-note`, className: "note" }, note),
    video ? h("a", { id: `${prefix}-video`, className: "video", href: video, target: "_blank", rel: "noopener" }, "▶ Voir la vidéo") : null,
  );

const home = (model) => {
  const empty = Object.fromEntries(WAZA_ORDER.map((waza) => [waza, buildPool(model.data, waza, model.filters).length === 0]));
  return h("section", { id: "home" },
    h("div", { className: "group settings" },
      h("label", { className: "field" }, "Grade",
        h("select", { id: "grade", onChange: (event) => ({ type: "SelectGrade", id: event.target.value }) },
          model.grades.map((grade) => h("option", { value: grade.id, selected: grade.id === model.gradeId }, `${grade.label} (${grade.count} techniques)`)))),
      h("div", { className: "filters" },
        h("label", {}, h("input", { type: "checkbox", id: "f-new", checked: model.filters.isNew, onChange: (event) => ({ type: "SetFilter", name: "isNew", checked: event.target.checked }) }), " 🆕 Nouveautés"),
        h("label", {}, h("input", { type: "checkbox", id: "f-warning", checked: model.filters.isWarning, onChange: (event) => ({ type: "SetFilter", name: "isWarning", checked: event.target.checked }) }), " ⚠️ Attention"))),
    h("div", { className: "group grow" },
      h("p", { className: "hint" }, "Choisissez un waza :"),
      h("div", { id: "waza-buttons", className: "buttons grow" },
        WAZA_ORDER.map((waza) => h("button", { disabled: empty[waza], onClick: { type: "StartSession", waza } }, waza))),
      h("p", { id: "home-msg", className: "hint" }, Object.values(empty).some(Boolean) ? "Un waza grisé n'a aucune technique pour ces filtres." : "")));
};

const draw = (model) => {
  const { current } = model;
  const shown = current && {
    waza: model.waza,
    attack: current.attack,
    technique: current.technique.name,
    form: current.form || "",
    badges: badgesOf(current.technique),
    note: current.technique.note || "",
    video: current.technique.video || "",
  };
  return h("section", { id: "draw" },
    h("button", { id: "home-btn", className: "secondary", onClick: { type: "GoHome" } }, "Retour à l'accueil"),
    h("p", { id: "progress", className: "hint" }, `${model.waza} : ${model.total - model.pool.length} / ${model.total}`),
    model.done ? h("div", { id: "done" }, "Waza terminé 🎉") : card("card", shown || {}, "card", slideProps(model.slide)),
    h("div", { className: "buttons actions" },
      !model.done && h("button", { id: "next", onClick: { type: "Next" } }, "Technique suivante"),
      h("button", { id: "prog-btn", className: "secondary", onClick: { type: "OpenProgram" } }, "Voir le programme")));
};

const item = (label, to) => h("button", { className: "item", onClick: { type: "Navigate", to } }, label);

const withBadges = (label, technique) => `${label} ${badgesOf(technique)}`.trim();

const levels = {
  1(model) {
    const attacks = listAttacks(model.data, model.waza);
    return {
      back: "← Tirage",
      backMessage: { type: "CloseProgram" },
      fields: { waza: model.waza },
      title: "Attaques",
      sub: `${attacks.length} attaques`,
      items: attacks.map((attack) => item(attack.name, { level: 2, attack: attack.name })),
    };
  },
  2(model, { attack }) {
    const techniques = listTechniques(model.data, model.waza, attack);
    return {
      back: "← Programme",
      backMessage: { type: "Navigate", to: { level: 1 } },
      fields: { waza: model.waza, attack },
      title: "Techniques",
      sub: `${techniques.length} techniques`,
      items: techniques.map((technique) => item(withBadges(technique.name, technique), { level: 3, attack, technique: technique.name })),
    };
  },
  3(model, { attack, technique }) {
    const siblings = listTechniques(model.data, model.waza, attack);
    const position = siblings.findIndex((candidate) => candidate.name === technique);
    const current = siblings[position];
    // Neighbours wrap around the list; none when the attack has a single technique.
    const neighbour = (step) => (siblings.length > 1 ? siblings[(position + step + siblings.length) % siblings.length] : null);
    const pagerButton = (id, label, target, direction) =>
      h("button", { id, disabled: !target, onClick: target ? { type: "Navigate", to: { level: 3, attack, technique: target.name }, direction } : null }, label);
    const others = findSameTechnique(model.data, model.waza, attack, current.name);
    return {
      back: `← ${attack}`,
      backMessage: { type: "Navigate", to: { level: 2, attack } },
      fields: { waza: model.waza, attack, technique: current.name, form: current.forms.join(" · "), badges: badgesOf(current), note: current.note || "", video: current.video || "" },
      actions: [
        h("p", { className: "hint center" }, `${position + 1} / ${siblings.length}`),
        h("div", { className: "pager" },
          pagerButton("prog-prev", "Précédente", neighbour(-1), "back"),
          pagerButton("prog-next", "Suivante", neighbour(1), "forward")),
      ],
      title: "Même technique, autres attaques",
      sub: others.length ? "" : "Aucune autre attaque pour cette technique.",
      items: others.map((other) => item(withBadges(other.attack, other.technique), { level: 3, attack: other.attack, technique: other.technique.name })),
    };
  },
};

const program = (model) => {
  const { back, backMessage, fields, actions, title, sub, items } = levels[model.program.level](model, model.program);
  return h("section", { id: "program" },
    h("button", { id: "home-btn", className: "secondary", onClick: { type: "GoHome" } }, "Retour à l'accueil"),
    h("button", { id: "prog-back", className: "secondary back", onClick: backMessage }, back),
    card("prog", fields, "prog-card", slideProps(model.slide)),
    actions,
    h("div", { className: "group" },
      h("h2", { id: "prog-title" }, title),
      h("p", { id: "prog-sub", className: "hint" }, sub),
      h("div", { id: "prog-list", className: "buttons" }, items)));
};

export function view(model) {
  let body;
  if (model.status === "loading") body = h("div", { id: "loading", className: "loading", role: "status", "aria-label": "Chargement" }, h("div", { className: "spinner" }));
  else if (model.status === "error") body = h("p", { className: "hint" }, model.error);
  else body = { home, draw, program }[model.screen](model);
  return h("main", {},
    h("h1", { id: "title", onClick: { type: "GoHome" } }, "合気道 Aïkido"),
    body
  );
}
