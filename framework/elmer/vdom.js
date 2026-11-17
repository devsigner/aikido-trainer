// framework/elmer/vdom.js
//
// ============================================================================
//  Mini virtual DOM
// ============================================================================
//
//  Two public functions:
//
//    h(tag, props, ...children)    describes a piece of UI (a "vnode"), pure
//    createRenderer(root)          returns render(vnode, dispatch) that updates the real DOM
//
//  The app never touches the DOM: view(model) returns a vnode tree, the
//  renderer compares it with the previous one and only applies the differences.
//
//      model ──view()──▶ vnode tree ──render()──▶ real DOM
//        ▲                                          │
//        └──────── dispatch(msg) ◀── user event ────┘
//
// ----------------------------------------------------------------------------
//  1. h(): describing the tree
// ----------------------------------------------------------------------------
//
//    h("button", { id: "next", onclick: { type: "Next" } }, "Next")
//
//    ┌───────────────────────────────────────────────────────────────┐
//    │ { tag: "button",                                              │
//    │   props: { id: "next", onclick: { type: "Next" } },           │
//    │   children: ["Next"] }                                        │
//    └───────────────────────────────────────────────────────────────┘
//
//    - props set to null / undefined are dropped:  h("a", { href: null })  → no href
//    - children: arrays are flattened, null / undefined / false are dropped
//      (handy for conditions:  cond && h("p", {}, "…"),  items.map(…))
//    - a child is either a vnode (object) or a text (anything else → String)
//
//    Special props:
//      onclick, onchange…   an event handler: the value is a message, or a function
//                           (event → message). The renderer calls dispatch(message).
//      className            sets element.className
//      hidden, disabled, checked, selected, value
//                           live DOM properties (see "Live properties" below)
//      key                  identity of the element (see "Keys" below); also set as an attribute
//      anything else        setAttribute(name, value)
//
// ----------------------------------------------------------------------------
//  2. createRenderer(): rendering and diffing
// ----------------------------------------------------------------------------
//
//    const render = createRenderer(rootElement);
//    render(view(model), dispatch);        // first call: builds the DOM
//    render(view(newModel), dispatch);     // next calls: patches it
//
//    render(vnode, dispatch)
//      │
//      ├─ first call ───────────▶ create(vnode)         build everything, append to root
//      │
//      └─ next calls ───────────▶ patchNode(root.firstChild, previous, vnode)
//                                   │ returns the node to keep (or a new one)
//                                   └─ if it is a new one → root.replaceChild
//
//    The previous vnode is kept to be compared with the next one. The real DOM
//    is never read to find differences (except for the live properties).
//
// ----------------------------------------------------------------------------
//  3. patchNode(): one node
// ----------------------------------------------------------------------------
//
//        old vnode           next vnode
//            └────────┬────────┘
//                     ▼
//        ┌─────────────────────────────┐
//        │ both texts?                 │── yes ─▶ update nodeValue if different, keep the node
//        └─────────────┬───────────────┘
//                      │ no
//        ┌─────────────▼───────────────┐
//        │ text ↔ element, or the tag  │── yes ─▶ create(next): the node is replaced
//        │ is different?               │
//        └─────────────┬───────────────┘
//                      │ no
//        ┌─────────────▼───────────────┐
//        │ different `key`?            │── yes ─▶ create(next): the node is replaced
//        └─────────────┬───────────────┘
//                      │ no
//                      ▼
//        patchChildren(node, old.children, next.children)
//        setProps(node, old.props, next.props)         → same element, reused
//
// ----------------------------------------------------------------------------
//  4. patchChildren(): the list of children (by position)
// ----------------------------------------------------------------------------
//
//    Children are compared index by index (no reordering detection):
//
//      old:   [ A ][ B ][ C ][ D ]
//      next:  [ A'][ B'][ C']
//               │    │    │    └─ index 3 only in old → removed
//               └────┴────┴────── common indexes → patchNode (reuse, replace if needed)
//
//      old:   [ A ][ B ]
//      next:  [ A'][ B'][ C'][ D']
//                         └────┴─ only in next → create + appendChild
//
//    Consequence: inserting an item at the start rewrites every following item.
//    Fine for small trees like this app's; use `key` to force a fresh element.
//
// ----------------------------------------------------------------------------
//  5. setProps(): the properties of one element
// ----------------------------------------------------------------------------
//
//    old props ──▶ removed props (in old, not in next) → unsetProp (default value)
//    next props ─▶ changed props                       → setProp
//
//    ┌───────────────────┬─────────────────────────────────────────────────┐
//    │ prop              │ how it is applied                               │
//    ├───────────────────┼─────────────────────────────────────────────────┤
//    │ on*               │ element.onclick = event => dispatch(message)    │
//    │                   │ (always re-set: a closure may have changed)     │
//    │ className         │ element.className = value                       │
//    │ hidden, disabled, │ element[prop] = value  (compared to the DOM)    │
//    │ checked, selected,│                                                 │
//    │ value             │                                                 │
//    │ other             │ element.setAttribute(name, value)               │
//    └───────────────────┴─────────────────────────────────────────────────┘
//
//    Unset: on* → null, className → "", value → "", the other live props →
//    false, anything else → removeAttribute.
//
//    Live properties: the user can change them without the app knowing (typing
//    in an input, ticking a checkbox). They are therefore compared to the real
//    element, not to the previous vnode, so that the model always wins:
//      model says checked = false, user ticked the box → next render unticks it.
//
// ----------------------------------------------------------------------------
//  6. Keys: restarting an element (and its CSS animation)
// ----------------------------------------------------------------------------
//
//    Same tag but a different `key` → the element is replaced, not patched.
//    A new DOM node restarts its CSS animation:
//
//      h("div", { key: slide.count, className: "card slide-forward" }, …)
//
//      key 3 ──render──▶ key 3     same element, animation not replayed
//      key 3 ──render──▶ key 4     new element, animation plays again
//
// ----------------------------------------------------------------------------
//  Limits
// ----------------------------------------------------------------------------
//
//    - no reordering of children (positional diff only)
//    - no components, no fragments, no SVG namespace
//    - handlers are properties (element.onclick), one per event type
//    - the root contains a single vnode (root.firstChild)

const PROPS_DOM = new Set(["hidden", "disabled", "checked", "selected", "value"]);

// Mini virtual DOM: h() describes the tree, createRenderer() updates the real DOM by diffing.
// A handler (onclick, onchange…) is a message, or a function (event → message).
export function h(tag, props, ...children) {
  const clean = Object.fromEntries(Object.entries(props || {}).filter(([, value]) => value !== null && value !== undefined));
  const kids = children.flat(Infinity).filter((child) => child !== null && child !== undefined && child !== false);
  return { tag, props: clean, children: kids.map((child) => (typeof child === "object" ? child : String(child))) };
}

// The renderer is a function that takes a virtual node and a dispatch function,
// and renders the virtual node into the root element.
//
// It keeps track of the previous virtual node to compute the diff.
//
// returns a function that takes a virtual node and a dispatch function,
// and renders the virtual node into the root element.
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

// Create a real DOM node from a virtual node, recursively creating its children.
function create(vnode, context) {
  if (typeof vnode === "string") return context.doc.createTextNode(vnode);
  const element = context.doc.createElement(vnode.tag);
  for (const child of vnode.children) element.appendChild(create(child, context));
  setProps(element, {}, vnode.props, context);
  return element;
}

// Update a real DOM node to match the next virtual node, reusing the existing node when possible.
function patchNode(node, old, next, context) {
  if (typeof next === "string" || typeof old === "string" || old.tag !== next.tag) {
    if (typeof next === "string" && typeof old === "string") {
      if (old !== next) node.nodeValue = next;
      return node;
    }
    return create(next, context);
  }
  // A different key means a different element: replace it (restarts CSS animations).
  if (old.props.key !== next.props.key) return create(next, context);
  patchChildren(node, old.children, next.children, context);
  setProps(node, old.props, next.props, context);
  return node;
}

// Update the children of a real DOM node to match the next virtual node, reusing existing nodes when possible.
// This is a simple diffing algorithm that assumes the children are in the same order and have the same keys.
// It does not handle reordering or inserting/removing nodes in the middle of the list.
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

// Set a property of a real DOM node, with special handling for event handlers and className.
function setProp(element, key, value, context) {
  if (key.startsWith("on")) element[key.toLowerCase()] = (event) => context.dispatch(typeof value === "function" ? value(event) : value);
  else if (key === "className") element.className = value;
  else if (PROPS_DOM.has(key)) element[key] = value;
  else element.setAttribute(key, value);
}

// Unset a property of a real DOM node, restoring its default value.
function unsetProp(element, key) {
  if (key.startsWith("on")) element[key.toLowerCase()] = null;
  else if (key === "className") element.className = "";
  else if (PROPS_DOM.has(key)) element[key] = key === "value" ? "" : false;
  else element.removeAttribute(key);
}

// Update the properties of a real DOM node to match the next virtual node.
function setProps(element, old, next, context) {
  for (const key of Object.keys(old)) if (!(key in next)) unsetProp(element, key);
  for (const [key, value] of Object.entries(next)) {
    // Live properties (user input) are compared to the DOM, not to the previous tree.
    if (PROPS_DOM.has(key) ? element[key] !== value : old[key] !== value || key.startsWith("on")) setProp(element, key, value, context);
  }
}
