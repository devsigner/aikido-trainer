// eslint.config.js

import js from "@eslint/js";
import globals from "globals";

export default [
  { ignores: ["node_modules/"] },
  js.configs.recommended,
  // Strict mode everywhere: ES modules are strict by themselves, the classic script (sw.js) needs the directive.
  { rules: { strict: ["error", "safe"] } },
  // A feature is defined at the top of its module: its handlers (function declarations) are written below.
  { rules: { "no-use-before-define": ["error", { functions: false, variables: false }] } },
  {
    files: ["app.js", "src/**/*.js", "framework/**/*.js"],
    languageOptions: { globals: globals.browser },
  },
  {
    files: ["sw.js"],
    languageOptions: { sourceType: "script", globals: globals.serviceworker },
    rules: { strict: ["error", "global"] },
  },
  {
    files: ["tests/**/*.js", "eslint.config.js"],
    languageOptions: { globals: globals.node },
  },
];
