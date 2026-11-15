// framework/elmer/debug/inspect.js

// Reading a model for the debugger (pure): a readable summary, the diff between two models, the label of a message.
// `hide` = { field: (value) => short text }: the bulky fields of the model (at the root or in a slice) shown as a summary.
const bulky = (fields, hide) => Object.fromEntries(Object.entries(fields).map(([key, value]) => [key, key in hide ? hide[key](value) : value]));

const plain = (value) => value && typeof value === "object" && !Array.isArray(value);

// The feature slices of a model: its fields that are objects.
export const sliceNames = (model) => Object.keys(model ?? {}).filter((key) => plain(model[key]));

// The model without its bulky parts, readable in a panel.
export function summarize(model, hide = {}) {
  if (!model) return model;
  const slices = Object.entries(model).filter(([, value]) => plain(value)).map(([key, value]) => [key, bulky(value, hide)]);
  return { ...bulky(model, hide), ...Object.fromEntries(slices) };
}

// Fields that differ between two models: [{ key, from, to }].
// `slices` = names of the features that own a slice of the model: their fields are diffed one by one (key "video.prompt").
export function diffModels(before, after, slices = [], hide = {}) {
  const a = summarize(before, hide) ?? {};
  const b = summarize(after, hide) ?? {};
  const differ = (from, to) => JSON.stringify(from) !== JSON.stringify(to);
  const fields = (from, to, prefix, keys) => keys.filter((key) => differ(from[key], to[key])).map((key) => ({ key: prefix + key, from: from[key], to: to[key] }));
  const keysOf = (from, to) => [...new Set([...Object.keys(from ?? {}), ...Object.keys(to ?? {})])];

  const flat = fields(a, b, "", keysOf(a, b).filter((key) => !slices.includes(key)));
  const inSlices = slices.flatMap((name) => fields(a[name] ?? {}, b[name] ?? {}, `${name}.`, keysOf(a[name], b[name])));
  return [...flat, ...inSlices];
}

// Label of a message in the log: `feature/Type` for an enveloped message.
export const labelOf = (msg) => (msg.feature ? `${msg.feature}/${msg.msg.type}` : msg.type);
