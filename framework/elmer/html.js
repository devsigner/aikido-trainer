// framework/elmer/html.js

// `html` : write a view as markup instead of nested `h()` calls (like JSX, without a build step).
//
//   html`
//     <section id="quiz">
//       <button class="secondary" onClick=${{ type: "GoHome" }}>Home</button>
//       <p class="hint">${model.waza} : ${played} / ${model.total}</p>
//       ${model.done ? html`<div id="done">Done</div>` : card(root)}
//       <ul>${items.map((item) => html`<li>${item}</li>`)}</ul>
//     </section>`
//
// It builds exactly the virtual nodes that `h` builds (same renderer, same `embed`): it is only another way to write them.
//
// ----------------------------------------------------------------------------
//  How it works
// ----------------------------------------------------------------------------
//
//    html`<p class="a">${x}</p>`
//         └─ the tag function receives `strings` (the fixed parts) and `values` (the ${…})
//
//    strings:  [ '<p class="a">',  '</p>' ]   ──┐ parsed ONCE per call site (cached on `strings`)
//                                               ▼
//    template: { tag: "p", attrs: [class="a"], children: [ value #0 ] }
//                                               │ at each render: the values are plugged in
//                                               ▼
//    h("p", { className: "a" }, x)
//
// ----------------------------------------------------------------------------
//  Syntax
// ----------------------------------------------------------------------------
//
//    Tags         <div>…</div>, <input … /> (self-closing). `input`, `br`, `hr`, `img` need no closing slash.
//    Attributes   id="x"            static text
//                 onClick=${msg}    a value, as it is: a message (object), a function (event → message), a boolean…
//                 class="a ${b}"    text with values: the result is a string
//                 disabled          no value: `true`
//                 `class` is written `className` for the DOM (`class` works too).
//    Children     text, <tags>, ${value}. A value may be a node, a string, a number, a list (flattened) or `false` / `null` / `undefined` (ignored).
//    Root         one node → the node itself; several (or none) → a list (or `null`), which `h` flattens as children.
//    Text         spaces are handled like JSX: the lines are trimmed and the blank ones dropped, so the indentation never shows
//                 up in the page; spaces on the same line are kept. HTML entities (`&amp;`) are not decoded: write the character.
//    Not handled  a tag given by a value (`<${Component}>`), spread of attributes, comments. A syntax error throws, with the template.
//
// Values are never parsed as markup: a text coming from the data cannot inject HTML.

import { h } from "./vdom.js";

const VALUE = "\uE000"; // stands for `${…}` in the joined template
const VOID_TAGS = new Set(["input", "br", "hr", "img"]);
const templates = new WeakMap(); // strings → parsed template

export function html(strings, ...values) {
  let template = templates.get(strings);
  if (!template) {
    template = parse(strings);
    templates.set(strings, template);
  }
  const nodes = template.map((node) => build(node, values));
  const flat = nodes.flat(Infinity);
  return flat.length === 1 ? flat[0] : flat.length === 0 ? null : flat;
}

// ── Parsing: markup → template (tags, static text, and the index of the values) ─────────────────────────────

function parse(strings) {
  if (strings.some((part) => part.includes(VALUE))) throw new Error("html: the template contains a reserved character (\\uE000)");
  const source = strings.join(VALUE);
  return parseChildren({ source, position: 0, value: 0 }, null);
}

function fail(cursor, message) {
  const context = cursor.source.replaceAll(VALUE, "${…}").replace(/\s+/g, " ").trim().slice(0, 80);
  throw new Error(`html: ${message} (in: ${context})`);
}

// Children up to the closing tag of `parent` (or the end of the template when `parent` is null).
function parseChildren(cursor, parent) {
  const nodes = [];
  const { source } = cursor;
  let text = "";
  const flush = () => {
    const cleaned = cleanText(text);
    if (cleaned) nodes.push({ text: cleaned });
    text = "";
  };
  while (cursor.position < source.length) {
    const char = source[cursor.position];
    if (char === VALUE) {
      flush();
      nodes.push({ value: cursor.value++ });
      cursor.position++;
    } else if (source.startsWith("</", cursor.position)) {
      flush();
      const end = source.indexOf(">", cursor.position);
      const name = source.slice(cursor.position + 2, end).trim();
      if (end === -1 || name !== parent) fail(cursor, `unexpected closing tag </${name}>${parent ? `, expected </${parent}>` : ""}`);
      cursor.position = end + 1;
      return nodes;
    } else if (char === "<") {
      flush();
      nodes.push(parseElement(cursor));
    } else {
      text += char;
      cursor.position++;
    }
  }
  flush();
  if (parent) fail(cursor, `missing closing tag </${parent}>`);
  return nodes;
}

function parseElement(cursor) {
  const { source } = cursor;
  const name = /^<([A-Za-z][\w-]*)/.exec(source.slice(cursor.position))?.[1];
  if (!name) fail(cursor, "a `<` must start a tag (write `${\"<\"}` for the character)");
  cursor.position += name.length + 1;
  const attrs = [];
  for (;;) {
    skipSpaces(cursor);
    if (cursor.position >= source.length) fail(cursor, `unfinished tag <${name}>`);
    if (source.startsWith("/>", cursor.position)) {
      cursor.position += 2;
      return { tag: name, attrs, children: [] };
    }
    if (source[cursor.position] === ">") {
      cursor.position++;
      return { tag: name, attrs, children: VOID_TAGS.has(name) ? [] : parseChildren(cursor, name) };
    }
    attrs.push(parseAttribute(cursor, name));
  }
}

// `name`, `name="text"`, `name='text'`, `name=${value}`, `name="text ${value} text"`.
function parseAttribute(cursor, tag) {
  const { source } = cursor;
  const name = /^[^\s=/>\uE000]+/.exec(source.slice(cursor.position))?.[0];
  if (!name) fail(cursor, `invalid attribute in <${tag}>`);
  cursor.position += name.length;
  const key = name === "class" ? "className" : name;
  if (source[cursor.position] !== "=") return { key, parts: [true] };
  cursor.position++;
  const quote = source[cursor.position];
  if (quote === VALUE) {
    cursor.position++;
    return { key, parts: [{ value: cursor.value++ }] };
  }
  if (quote !== '"' && quote !== "'") fail(cursor, `the value of \`${name}\` in <${tag}> must be quoted or be a \${value}`);
  const end = source.indexOf(quote, cursor.position + 1);
  if (end === -1) fail(cursor, `unfinished value of \`${name}\` in <${tag}>`);
  const parts = [];
  source.slice(cursor.position + 1, end).split(VALUE).forEach((literal, index) => {
    if (index > 0) parts.push({ value: cursor.value++ });
    if (literal) parts.push(literal);
  });
  cursor.position = end + 1;
  return { key, parts: parts.length ? parts : [""] };
}

function skipSpaces(cursor) {
  while (/\s/.test(cursor.source[cursor.position] ?? "")) cursor.position++;
}

// JSX rule: each line is trimmed (the first one only at its end, the last one only at its start), blank lines are dropped.
function cleanText(text) {
  const lines = text.split(/\r\n|\n|\r/);
  const kept = lines
    .map((line, index) => {
      let cleaned = index > 0 ? line.trimStart() : line;
      if (index < lines.length - 1) cleaned = cleaned.trimEnd();
      return cleaned;
    })
    .filter((line) => line !== "");
  return kept.join(" ");
}

// ── Building: template + values → virtual nodes ──────────────────────────────────────────────────────────────

function build(node, values) {
  if ("text" in node) return node.text;
  if ("value" in node) return values[node.value];
  const props = {};
  for (const { key, parts } of node.attrs) {
    // A single value keeps its type (message, function, boolean…); text and values together make a string.
    props[key] = parts.length === 1 && typeof parts[0] === "object" ? values[parts[0].value] : parts.length === 1 ? parts[0] : parts.map((part) => (typeof part === "object" ? values[part.value] : part)).join("");
  }
  return h(node.tag, props, ...mergeText(node.children.map((child) => build(child, values)).flat(Infinity)));
}

// Adjacent texts and numbers make one text node (`${a} : ${b}` is one string, as with a template literal).
function mergeText(children) {
  const merged = [];
  for (const child of children) {
    if (child === null || child === undefined || child === false) continue;
    const isText = typeof child === "string" || typeof child === "number";
    if (isText && typeof merged.at(-1) === "string") merged[merged.length - 1] += String(child);
    else merged.push(isText ? String(child) : child);
  }
  return merged;
}
