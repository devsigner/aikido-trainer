// framework/elmer/runtime.js

// Elm loop: message → update → view → render, then run the commands.
// The `run` function returns the `dispatch` function, which can be used to send messages to the loop.
// Optional `debug` observer: `record({ msg, before, after, cmds, events })` (`events`: published by the features, optional) after each step, and `attach({ getModel, restore })` once.
// Dev tools (browser): the last steps are always kept, and `__elmer.debug.on()` / `.off()` mount or unmount the debugger panel (module loaded on demand,
// the log is replayed into it). `devtools: { slices, hide }` configures it (see debug.js); it is mounted by default on a local host.
// `debug.on()` / `debug.off()` are remembered (localStorage): `off()` also disables the automatic mount on a local host.
const MAX_HISTORY = 200;
const HELP = [
  "__elmer.model              current model (one slice per feature)",
  "__elmer.debug.on()         mounts the debugger panel",
  "__elmer.debug.off()        unmounts it",
  "__elmer.debug.status       \"on\" or \"off\"",
  "__elmer.debug.log          (panel mounted) log entries { id, msg, before, after, cmds, events, changes, time }",
  "__elmer.debug.restore(id)  (panel mounted) time travel to the state after entry `id`; returns the model, or null",
  "__elmer.help               this help",
].join("\n");
const DEBUG_KEY = "elmer.debug"; // "on" | "off": the last choice made from the console, kept across reloads
const saved = () => { try { return localStorage.getItem(DEBUG_KEY); } catch { return null; } };
const save = (value) => { try { localStorage.setItem(DEBUG_KEY, value); } catch { /* storage unavailable: the choice is not kept */ } };
const isLocal = () => /^(localhost|127\..*|\[::1\]|.*\.local)$/.test(globalThis.location?.hostname ?? "");

export function run({ init, update, view, render, effects, subscribe, flags, debug, devtools }) {
  let model;
  const observers = debug ? [debug] : [];
  const history = [];

  const exec = (cmds) =>
    cmds.forEach((cmd) => {
      if (!effects[cmd.type]) throw new Error(`Unknown effect : ${cmd.type}`);
      effects[cmd.type](cmd, dispatch);
    });

  // Apply the next model and commands, then render the view and execute the commands.
  const apply = ([next, cmds, events = []], msg) => {
    const before = model;
    model = next;
    render(view(model), dispatch);
    // Recorded before the effects run, so that their own messages come after this one in the log.
    const entry = { msg, before, after: next, cmds, events, time: new Date().toLocaleTimeString("fr-FR") };
    history.push(entry);
    if (history.length > MAX_HISTORY) history.shift();
    observers.forEach((observer) => observer.record(entry));
    exec(cmds);
  };
  // The dispatch function is passed to the view and the effects, and is used to send messages to the loop.
  function dispatch(msg) {
    apply(update(model, msg), msg);
  }

  const control = {
    getModel: () => model,
    // Time travel: puts a past model back and redraws it (no effect is replayed).
    restore: (past) => {
      model = past;
      render(view(model), dispatch);
    },
  };
  debug?.attach(control);
  apply(init(flags), { type: "@init" });
  subscribe?.(dispatch);

  if (devtools && typeof document !== "undefined") {
    let mounted = null;
    const toggle = async (on) => {
      if (on && !mounted) {
        mounted = true; // guards against a second call while the module loads
        const panel = (await import("./debug.js")).mountDebugger(devtools.slices, devtools.hide);
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
      get model() { return model; },
      debug: { on: () => { save("on"); return toggle(true); }, off: () => { save("off"); return toggle(false); }, get status() { return mounted ? "on" : "off"; } },
      get help() { console.log(HELP); return HELP; },
    };
    if (saved() === "on" || (saved() !== "off" && isLocal())) toggle(true);
  }

  return dispatch;
}
