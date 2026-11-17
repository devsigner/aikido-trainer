// scripts/version.js

// Cache busting by file: the `?v=` of a file (index.html, import map, precache of sw.js) is the hash of the content of that file
// (8 hex characters), so only a modified file gets a new URL. `yarn bump` writes them; the tests fail when one is outdated.
// `const VERSION` of sw.js is the hash of all the served files: it names the offline cache, renewed as soon as one of them changes.
import { createHash } from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const HASH_LENGTH = 8;

const SERVED_FILES = ["index.html", "sw.js", "app.js", "style.css", "favicon.ico", "manifest.webmanifest", "manual.html"];
const SERVED_DIRS = ["src", "framework", "data", "icons", "docs"];
const VERSIONED = /([\w./-]+)\?v=[\w.-]+/g; // `path?v=hash`
const VERSION_CONST = /const VERSION = "[\w.-]*"/;

const sha = (content) => createHash("sha256").update(content).digest("hex").slice(0, HASH_LENGTH);

function listFiles(dir) {
  return fs.readdirSync(path.join(ROOT, dir), { withFileTypes: true }).flatMap((entry) => {
    const relative = `${dir}/${entry.name}`;
    if (entry.isDirectory()) return listFiles(relative);
    return entry.name.endsWith(".md") ? [] : [relative]; // documentation is not served
  });
}

// Hash of one file, as written in its `?v=`.
export function fileHash(file) {
  return sha(fs.readFileSync(path.join(ROOT, file.replace(/^\.\//, ""))));
}

// The versions written in index.html and sw.js do not take part in the global hash, otherwise writing them would change it.
function contentOf(file) {
  const content = fs.readFileSync(path.join(ROOT, file));
  if (file !== "index.html" && file !== "sw.js") return content;
  return content.toString("utf8").replace(VERSIONED, "$1?v=").replace(VERSION_CONST, 'const VERSION = ""');
}

export function computeVersion() {
  const files = [...SERVED_FILES, ...SERVED_DIRS.flatMap(listFiles)].sort();
  const hash = createHash("sha256");
  for (const file of files) hash.update(`${file}\0`).update(contentOf(file));
  return hash.digest("hex").slice(0, HASH_LENGTH);
}

// The versioned references of a text: [{ file, version }].
export function versionedReferences(text) {
  return [...text.matchAll(VERSIONED)].map((match) => ({ file: match[1].replace(/^\.\//, ""), version: match[0].split("?v=")[1] }));
}

function update(file, rewrite) {
  const target = path.join(ROOT, file);
  const content = fs.readFileSync(target, "utf8");
  const updated = rewrite(content);
  if (updated !== content) fs.writeFileSync(target, updated);
}

export function writeVersions() {
  const perFile = (text) => text.replace(VERSIONED, (_, file) => `${file}?v=${fileHash(file)}`);
  update("index.html", perFile);
  update("sw.js", perFile);
  const version = computeVersion();
  update("sw.js", (text) => text.replace(VERSION_CONST, `const VERSION = "${version}"`));
  return version;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  console.log(`version: ${writeVersions()}`);
}
