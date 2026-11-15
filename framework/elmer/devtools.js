// framework/elmer/devtools.js

// Dev tools of `run`: the history of the steps, the `__elmer` console API, and the lazy mount of the debugger panel (debug.js).
// - The state of the debugger is `model.elmer.debug` ("on" | "off", see elmer.js): the panel follows it after each step,
//   and `__elmer.debug.on()` / `.off()` only send `DebugOn` / `DebugOff` to the feature `elmer`.
// - The last `model.elmer.historySize` steps are always kept, so that the panel can replay them when it is mounted later.
// - `config` = { slices, hide } (see debug.js); without it (or without a browser) no panel is mounted.
// - `observer` = explicit debug observer (`attach`, `record`), e.g. for tests.
import { to } from "./feature.js";

const HELP = [
  "__elmer.model              current model (one slice per feature, the settings of the framework in `elmer`)",
  "__elmer.debug.on()         mounts the debugger panel (sets model.elmer.debug to \"on\")",
  "__elmer.debug.off()        unmounts it",
  "__elmer.debug.status       \"on\" or \"off\" (model.elmer.debug)",
  "__elmer.debug.log          (panel mounted) log entries { id, msg, before, after, cmds, events, changes, time }",
  "__elmer.debug.restore(id)  (panel mounted) time travel to the state after entry `id`; returns the model, or null",
  "__elmer.help               this help",
].join("\n");

// `control` = { getModel, restore, dispatch } of the loop. Returns `{ record(entry) }`, to call after each step.
export function createDevtools({ config, control, observer }) {
  const observers = observer ? [observer] : [];
  const history = [];
  observer?.attach(control);

  const browser = config && typeof document !== "undefined";
  let panel = null; // the mounted panel
  let loading = null; // the promise of the panel being mounted (the module is loaded on demand)

  // Mounts or unmounts the panel so that it matches `model.elmer.debug`.
  const sync = (model) => {
    const wanted = model.elmer?.debug === "on";
    if (wanted && !panel && !loading) {
      loading = (async () => {
        const mounted = (await import("./debug.js")).mountDebugger([...config.slices, "elmer"], config.hide);
        mounted.attach(control);
        history.forEach((entry) => mounted.record(entry));
        observers.push(mounted);
        panel = mounted;
        loading = null;
        sync(control.getModel()); // the setting may have changed while loading
      })();
    } else if (!wanted && panel) {
      observers.splice(observers.indexOf(panel), 1);
      panel.unmount();
      panel = null;
    }
  };

  const record = (entry) => {
    const stamped = { ...entry, time: new Date().toLocaleTimeString("fr-FR") };
    history.push(stamped);
    const size = entry.after.elmer?.historySize ?? 200;
    if (history.length > size) history.splice(0, history.length - size);
    observers.forEach((each) => each.record(stamped));
    if (browser) sync(entry.after);
  };

  if (browser) {
    const status = () => control.getModel().elmer.debug;
    const set = async (value) => {
      if (status() !== value) control.dispatch(to("elmer", { type: value === "on" ? "DebugOn" : "DebugOff" }));
      await loading;
      return Boolean(panel);
    };
    globalThis.__elmer = {
      get model() { return control.getModel(); },
      debug: { on: () => set("on"), off: () => set("off"), get status() { return status(); } },
      get help() { console.log(HELP); return HELP; },
    };
  }

  return { record };
}
