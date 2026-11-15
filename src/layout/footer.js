// src/layout/footer.js

import { h } from "../../framework/elmer/index.js";

export const footer = () => h("footer", {},
  h("p", {}, "© 2026 Aïkido Trainer. Tous droits réservés."),
  h("p", {}, "Développé par amour de l'Aïkido 🙏"),
  h("p", {}, h("a", { href: "manual.html" }, "Manuel d'utilisation")));
