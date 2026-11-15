// src/view.js

// view(model) → virtual tree (plain data). Handlers are messages.
// The root view picks the screen; the pieces of the page are in src/layout/.
import { h } from "./elmer/vdom.js";
import { embed } from "./elmer/combine.js";
import { feature as catalog } from "./features/catalog.js";
import { feature as quiz } from "./features/quiz.js";
import { feature as program } from "./features/program.js";
import { screenOf } from "./shared/screen.js";

// Layout
import { home } from "./layout/home.js";
import { page } from "./layout/page.js";
import { title } from "./layout/title.js";

export function view(model) {
  const header = title();

  // The other screens are stacked vertically, with the footer below the fold.
  if (model.catalog.status !== "ready") {
    return page(model, header, catalog.views.status(model.catalog));
  }

  // The program screen is a special case: the first page fills the viewport, the list is below.
  const screen = screenOf(model);
  if (screen === "program") {
    return page(model, embed("program", program.view(model.program, model, header)));
  }

  // The quiz screen's first page fills the viewport height; the footer sits below the fold.
  if (screen === "quiz") {
    return page(model, h("div", { className: "screen full" }, header, embed("quiz", quiz.view(model.quiz, model))));
  }
  return page(model, header, home(model));
}
