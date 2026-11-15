// view(model) → virtual tree (plain data). Handlers are messages.
// The root view only composes the views of the features (see `embed`) and holds the page skeleton.
import { h } from "./framework/vdom.js";
import { embed, to } from "./framework/combine.js";
import { grade } from "./update-grade.js";
import { draw } from "./update-draw.js";
import { program } from "./update-program.js";
import { screenOf } from "./update-history.js";
import { video } from "./update-video.js";

// Home screen: choose a grade and filters (grade), then a waza to start a session (draw).
const home = (model) => h("section", { id: "home" }, embed("grade", grade.view(model.grade)), embed("draw", draw.picker(model)));

const footer = () => h("footer", {},
  h("p", {}, "© 2026 Aïkido Trainer. Tous droits réservés."),
  h("p", {}, "Développé par amour de l'Aïkido 🙏"),
  h("p", {}, h("a", { href: "manual.html" }, "Manuel d'utilisation")));

const page = (model, ...children) => h("main", {}, ...children, footer(), embed("video", video.view(model.video)));

const title = () => h("h1", { id: "title", onClick: to("draw", { type: "GoHome" }) }, "合気道 Aïkido");

export function view(model) {
  const header = title();

  // The other screens are stacked vertically, with the footer below the fold.
  if (model.grade.status !== "ready") {
    return page(model, header, grade.statusView(model.grade));
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
