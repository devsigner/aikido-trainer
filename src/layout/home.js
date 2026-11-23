// src/layout/home.js

import { embed, html } from "../../framework/elmer/index.js";
import { feature as catalog } from "../features/catalog.js";
import { feature as program } from "../features/program.js";
import { feature as quiz } from "../features/quiz.js";

// Home screen: the grade (catalog), the button of the program, the filters (quiz), then the quiz.
export const home = (model) => html`
  <section id="home">
    <div class="group settings">
      ${embed("catalog", catalog.views.grade(model.catalog))}
      ${embed("program", program.views.openButton())}
    </div>
    ${embed("quiz", quiz.views.filters(model.quiz))}
    ${embed("quiz", quiz.view(model.quiz, model))}
  </section>`;
