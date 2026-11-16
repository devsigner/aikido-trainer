// tests/gren.test.js: runs the Gren tests (tests/gren) and checks that app.js is built from the sources.

import { test } from "node:test";
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { ROOT, read } from "./helpers.js";

const gren = path.join(ROOT, "node_modules/.bin/gren");
const run = (args, cwd) => execFileSync(gren, args, { cwd, encoding: "utf8", stdio: "pipe" });

test("Gren unit tests (Grade, Route)", () => {
  const out = path.join(fs.mkdtempSync(path.join(os.tmpdir(), "gren-tests-")), "tests.cjs");
  run(["make", "Main", `--output=${out}`], path.join(ROOT, "tests/gren"));
  try {
    execFileSync(process.execPath, ["-e", `require(${JSON.stringify(out)}).Gren.Main.init({})`], { encoding: "utf8", stdio: "pipe" });
  } catch (error) {
    assert.fail(`${error.stdout}${error.stderr}`);
  }
});

test("app.js is up to date with src/ (run `yarn build`)", () => {
  const out = path.join(fs.mkdtempSync(path.join(os.tmpdir(), "gren-app-")), "app.js");
  run(["make", "Main", `--output=${out}`], ROOT);
  assert.equal(fs.readFileSync(out, "utf8"), read("app.js"));
});
