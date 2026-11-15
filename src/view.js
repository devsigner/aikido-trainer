// view(model) → virtual tree (plain data). Handlers are messages.
// The root view only composes the views of the features (see `embed`) and holds the page skeleton.
import { h } from "./vdom.js";
import { embed, to } from "./framework/combine.js";
import { WAZA_ORDER, buildPool } from "./logic.js";
import { grade } from "./update-grade.js";
import { draw } from "./update-draw.js";
import { program } from "./update-program.js";
import { screenOf } from "./update-history.js";
import { video } from "./update-video.js";

// Home screen: choose a waza and start a session.
const home = (model) => {
  const empty = Object.fromEntries(WAZA_ORDER.map((waza) => [waza, buildPool(model.grade.data, waza, model.grade.filters).length === 0]));
  return h("section", { id: "home" },
    embed("grade", grade.view(model.grade)),
    h("div", { className: "group grow" },
      h("p", { className: "hint" }, "Choisis un waza et teste-toi !"),
      h("div", { id: "waza-buttons", className: "buttons grow" },
        WAZA_ORDER.map((waza) => h("button", { disabled: empty[waza], onClick: to("draw", { type: "StartSession", waza }) }, waza))),
      h("p", { id: "home-msg", className: "hint" }, Object.values(empty).some(Boolean) ? "Un waza grisé n'a aucune technique pour ces filtres." : "")));
};

const footer = () => h("footer", {},
  h("p", {}, "© 2026 Aïkido Trainer. Tous droits réservés."),
  h("p", {}, "Développé par amour de l'Aïkido 🙏"),
  h("p", {}, h("a", { href: "manual.html" }, "Manuel d'utilisation")));

const page = (model, ...children) => h("main", {}, ...children, footer(), embed("video", video.view(model.video)));

const loadingView = () => h("div", { id: "loading", className: "loading", role: "status", "aria-label": "Chargement" }, h("div", { className: "spinner" }));

const errorView = (model) => h("p", { className: "hint" }, model.grade.error);

const title = () => h("h1", { id: "title", onClick: to("draw", { type: "GoHome" }) }, "合気道 Aïkido");

export function view(model) {
  const header = title();

  // The other screens are stacked vertically, with the footer below the fold.
  if (model.grade.status !== "ready") {
    return page(model, header, model.grade.status === "loading" ? loadingView() : errorView(model));
  }

  // The program screen is a special case: the first page fills the viewport, the list is below.
  const screen = screenOf(model);
  if (screen === "program") {
    return page(model, embed("program", program.view(model.program, model, header)));
  }

  // The draw screen's first page fills the viewport height; the footer sits below the fold.
  if (screen === "draw") {
    return page(model, h("div", { className: "screen full" }, header, embed("draw", draw.view(model.draw, model))));
  }
  return page(model, header, home(model));
}
