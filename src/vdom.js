// Mini virtual DOM: h() describes the tree, createRenderer() updates the real DOM by diffing.
// A handler (onclick, onchange…) is a message, or a function (event → message).
export function h(tag, props, ...children) {
  const clean = Object.fromEntries(Object.entries(props || {}).filter(([, value]) => value !== null && value !== undefined));
  const kids = children.flat(Infinity).filter((child) => child !== null && child !== undefined && child !== false);
  return { tag, props: clean, children: kids.map((child) => (typeof child === "object" ? child : String(child))) };
}

const PROPS_DOM = new Set(["hidden", "disabled", "checked", "selected", "value"]);

function setProp(element, key, value, context) {
  if (key.startsWith("on")) element[key.toLowerCase()] = (event) => context.dispatch(typeof value === "function" ? value(event) : value);
  else if (key === "className") element.className = value;
  else if (PROPS_DOM.has(key)) element[key] = value;
  else element.setAttribute(key, value);
}

function unsetProp(element, key) {
  if (key.startsWith("on")) element[key.toLowerCase()] = null;
  else if (key === "className") element.className = "";
  else if (PROPS_DOM.has(key)) element[key] = key === "value" ? "" : false;
  else element.removeAttribute(key);
}

function setProps(element, old, next, context) {
  for (const key of Object.keys(old)) if (!(key in next)) unsetProp(element, key);
  for (const [key, value] of Object.entries(next)) {
    // Live properties (user input) are compared to the DOM, not to the previous tree.
    if (PROPS_DOM.has(key) ? element[key] !== value : old[key] !== value || key.startsWith("on")) setProp(element, key, value, context);
  }
}

function create(vnode, context) {
  if (typeof vnode === "string") return context.doc.createTextNode(vnode);
  const element = context.doc.createElement(vnode.tag);
  for (const child of vnode.children) element.appendChild(create(child, context));
  setProps(element, {}, vnode.props, context);
  return element;
}

function patchChildren(element, old, next, context) {
  const common = Math.min(old.length, next.length);
  for (let index = 0; index < common; index++) {
    const child = element.childNodes[index];
    const patched = patchNode(child, old[index], next[index], context);
    if (patched !== child) element.replaceChild(patched, child);
  }
  for (let index = common; index < next.length; index++) element.appendChild(create(next[index], context));
  while (element.childNodes.length > next.length) element.removeChild(element.lastChild);
}

function patchNode(node, old, next, context) {
  if (typeof next === "string" || typeof old === "string" || old.tag !== next.tag) {
    if (typeof next === "string" && typeof old === "string") {
      if (old !== next) node.nodeValue = next;
      return node;
    }
    return create(next, context);
  }
  patchChildren(node, old.children, next.children, context);
  setProps(node, old.props, next.props, context);
  return node;
}

export function createRenderer(root, doc = root.ownerDocument) {
  let previous = null;
  return (vnode, dispatch) => {
    const context = { doc, dispatch };
    if (!previous) root.appendChild(create(vnode, context));
    else {
      const patched = patchNode(root.firstChild, previous, vnode, context);
      if (patched !== root.firstChild) root.replaceChild(patched, root.firstChild);
    }
    previous = vnode;
  };
}
