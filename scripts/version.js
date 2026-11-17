// scripts/version.js

// The version is a hash of the content of the files served by the app (8 hex characters):
// it only changes when one of them changes. `yarn bump` writes it in index.html, sw.js and CLAUDE.md;
// the tests fail when it is outdated.
import { createHash } from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const VERSION_LENGTH = 8;

const SERVED_FILES = ["index.html", "sw.js", "app.js", "style.css", "favicon.ico", "manifest.webmanifest", "manual.html"];
const SERVED_DIRS = ["src", "framework", "data", "icons", "docs"];

function listFiles(dir) {
  return fs.readdirSync(path.join(ROOT, dir), { withFileTypes: true }).flatMap((entry) => {
    const relative = `${dir}/${entry.name}`;
    if (entry.isDirectory()) return listFiles(relative);
    return entry.name.endsWith(".md") ? [] : [relative]; // documentation is not served
  });
}

// The version written in index.html and sw.js does not take part in the hash, otherwise writing it would change it.
function contentOf(file) {
  const content = fs.readFileSync(path.join(ROOT, file));
  if (file === "index.html") return content.toString("utf8").replace(/\?v=[\w.-]+/g, "?v=");
  if (file === "sw.js") return content.toString("utf8").replace(/const VERSION = "[\w.-]*"/, 'const VERSION = ""');
  return content;
}

export function computeVersion() {
  const files = [...SERVED_FILES, ...SERVED_DIRS.flatMap(listFiles)].sort();
  const hash = createHash("sha256");
  for (const file of files) hash.update(`${file}\0`).update(contentOf(file));
  return hash.digest("hex").slice(0, VERSION_LENGTH);
}

function replaceIn(file, pattern, replacement) {
  const target = path.join(ROOT, file);
  const content = fs.readFileSync(target, "utf8");
  const updated = content.replace(pattern, replacement);
  if (updated !== content) fs.writeFileSync(target, updated);
}

export function writeVersion(version) {
  replaceIn("index.html", /\?v=[\w.-]+/g, `?v=${version}`);
  replaceIn("sw.js", /const VERSION = "[\w.-]*"/, `const VERSION = "${version}"`);
  replaceIn("CLAUDE.md", /Current version: `[\w.-]+`/, `Current version: \`${version}\``);
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const version = computeVersion();
  writeVersion(version);
  console.log(`version: ${version}`);
}
