// framework/elmer/devtools.js

// Dev tools of `run`: the history of the steps, the `__elmer` console API, and the lazy mount of the debugger panel (debug.js).
// - The last steps are always kept, so that the panel can replay them when it is mounted later.
// - `__elmer.debug.on()` / `.off()` mount or unmount the panel; the choice is remembered (localStorage).
//   Without a choice, the panel is mounted by default on a local host.
// - `config` = { slices, hide } (see debug.js); without it (or without a browser) only the optional `observer` is used.
// - `observer` = explicit debug observer (`attach`, `record`), e.g. for tests.
const MAX_HISTORY = 200;
const DEBUG_KEY = "elmer.debug"; // "on" | "off"
const HELP = [
  "__elmer.model              current model (one slice per feature)",
  "__elmer.debug.on()         mounts the debugger panel",
  "__elmer.debug.off()        unmounts it",
  "__elmer.debug.status       \"on\" or \"off\"",
  "__elmer.debug.log          (panel mounted) log entries { id, msg, before, after, cmds, events, changes, time }",
  "__elmer.debug.restore(id)  (panel mounted) time travel to the state after entry `id`; returns the model, or null",
  "__elmer.help               this help",
].join("\n");

const saved = () => { try { return localStorage.getItem(DEBUG_KEY); } catch { return null; } };
const save = (value) => { try { localStorage.setItem(DEBUG_KEY, value); } catch { /* storage unavailable: the choice is not kept */ } };
const isLocal = () => /^(localhost|127\..*|\[::1\]|.*\.local)$/.test(globalThis.location?.hostname ?? "");

// `control` = { getModel, restore } of the loop. Returns `{ record(entry) }`, to call after each step.
export function createDevtools({ config, control, observer }) {
  const observers = observer ? [observer] : [];
  const history = [];
  observer?.attach(control);

  const record = (entry) => {
    const stamped = { ...entry, time: new Date().toLocaleTimeString("fr-FR") };
    history.push(stamped);
    if (history.length > MAX_HISTORY) history.shift();
    observers.forEach((each) => each.record(stamped));
  };

  if (config && typeof document !== "undefined") {
    let mounted = null; // null | true (loading) | the panel
    const toggle = async (on) => {
      if (on && !mounted) {
        mounted = true; // guards against a second call while the module loads
        const panel = (await import("./debug.js")).mountDebugger(config.slices, config.hide);
        panel.attach(control);
        history.forEach((entry) => panel.record(entry));
        observers.push(panel);
        mounted = panel;
      } else if (!on && mounted?.unmount) {
        observers.splice(observers.indexOf(mounted), 1);
        mounted.unmount();
        mounted = null;
      }
      return Boolean(mounted);
    };
    globalThis.__elmer = {
      get model() { return control.getModel(); },
      debug: {
        on: () => { save("on"); return toggle(true); },
        off: () => { save("off"); return toggle(false); },
        get status() { return mounted ? "on" : "off"; },
      },
      get help() { console.log(HELP); return HELP; },
    };
    if (saved() === "on" || (saved() !== "off" && isLocal())) toggle(true);
  }

  return { record };
}
