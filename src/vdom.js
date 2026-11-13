// Mini DOM virtuel : h() décrit l'arbre, createRenderer() met le vrai DOM à jour par différences.
// Un gestionnaire (onclick, onchange…) est un message, ou une fonction (événement → message).
export function h(tag, props, ...children) {
  const clean = Object.fromEntries(Object.entries(props || {}).filter(([, v]) => v !== null && v !== undefined));
  const kids = children.flat(Infinity).filter((c) => c !== null && c !== undefined && c !== false);
  return { tag, props: clean, children: kids.map((c) => (typeof c === "object" ? c : String(c))) };
}

const PROPS_DOM = new Set(["hidden", "disabled", "checked", "selected", "value"]);

function setProp(el, key, value, ctx) {
  if (key.startsWith("on")) el[key.toLowerCase()] = (e) => ctx.dispatch(typeof value === "function" ? value(e) : value);
  else if (key === "className") el.className = value;
  else if (PROPS_DOM.has(key)) el[key] = value;
  else el.setAttribute(key, value);
}

function unsetProp(el, key) {
  if (key.startsWith("on")) el[key.toLowerCase()] = null;
  else if (key === "className") el.className = "";
  else if (PROPS_DOM.has(key)) el[key] = key === "value" ? "" : false;
  else el.removeAttribute(key);
}

function setProps(el, old, next, ctx) {
  for (const k of Object.keys(old)) if (!(k in next)) unsetProp(el, k);
  for (const [k, v] of Object.entries(next)) {
    // Les propriétés vivantes (saisie utilisateur) sont comparées au DOM, pas à l'ancien arbre.
    if (PROPS_DOM.has(k) ? el[k] !== v : old[k] !== v || k.startsWith("on")) setProp(el, k, v, ctx);
  }
}

function create(v, ctx) {
  if (typeof v === "string") return ctx.doc.createTextNode(v);
  const el = ctx.doc.createElement(v.tag);
  for (const c of v.children) el.appendChild(create(c, ctx));
  setProps(el, {}, v.props, ctx);
  return el;
}

function patchChildren(el, old, next, ctx) {
  const common = Math.min(old.length, next.length);
  for (let i = 0; i < common; i++) {
    const child = el.childNodes[i];
    const patched = patchNode(child, old[i], next[i], ctx);
    if (patched !== child) el.replaceChild(patched, child);
  }
  for (let i = common; i < next.length; i++) el.appendChild(create(next[i], ctx));
  while (el.childNodes.length > next.length) el.removeChild(el.lastChild);
}

function patchNode(dom, old, next, ctx) {
  if (typeof next === "string" || typeof old === "string" || old.tag !== next.tag) {
    if (typeof next === "string" && typeof old === "string") {
      if (old !== next) dom.nodeValue = next;
      return dom;
    }
    return create(next, ctx);
  }
  patchChildren(dom, old.children, next.children, ctx);
  setProps(dom, old.props, next.props, ctx);
  return dom;
}

export function createRenderer(root, doc = root.ownerDocument) {
  let prev = null;
  return (vnode, dispatch) => {
    const ctx = { doc, dispatch };
    if (!prev) root.appendChild(create(vnode, ctx));
    else {
      const patched = patchNode(root.firstChild, prev, vnode, ctx);
      if (patched !== root.firstChild) root.replaceChild(patched, root.firstChild);
    }
    prev = vnode;
  };
}
