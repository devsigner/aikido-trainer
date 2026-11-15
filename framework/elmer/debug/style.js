// framework/elmer/debug/style.js

// The CSS of the panel (everything under `#debug`).
export const STYLE = `
#debug { position: fixed; right: 0; bottom: 0; left: 0; z-index: 20; font: 12px/1.4 ui-monospace, Menlo, monospace; pointer-events: none; }
#debug > * { pointer-events: auto; }
#debug button { all: unset; box-sizing: border-box; cursor: pointer; padding: .4rem .7rem; border-radius: 6px; background: #3a4150; color: #eceff4; font: inherit; pointer-events: auto; }
#debug button.on { background: #c0392b; }
#debug .dbg-toggle { position: absolute; right: .5rem; bottom: .5rem; background: #000c; border: 1px solid #555; }
#debug .dbg-panel { position: fixed; display: flex; flex-direction: column; background: #0d1117f2; color: #c9d1d9; border: 2px solid #c0392b; border-radius: 8px; overflow: hidden; }
#debug .dbg-bar { display: flex; align-items: center; justify-content: space-between; gap: .5rem; padding: .35rem .5rem; background: #c0392b; color: #fff; cursor: move; user-select: none; -webkit-user-select: none; touch-action: none; }
#debug .dbg-close { padding: .1rem .5rem; background: #0004; }
#debug .dbg-tabs { display: flex; gap: .4rem; padding: .5rem .5rem 0; }
#debug .dbg-content { position: relative; flex: 1; min-height: 0; display: flex; }
#debug .dbg-body { flex: 1; min-height: 0; overflow: auto; padding: .5rem; scrollbar-width: none; }
#debug .dbg-body::-webkit-scrollbar { display: none; }
#debug .dbg-copy { position: absolute; top: .4rem; right: 1.2rem; padding: .3rem .45rem; background: #30363d; }
#debug .dbg-resize { position: absolute; right: 0; bottom: 0; width: 18px; height: 18px; cursor: nwse-resize; touch-action: none; background: linear-gradient(135deg, transparent 50%, #c0392b 50%); }
#debug .dbg-fold { display: block; width: 100%; margin-bottom: .2rem; background: #161b22; color: #e8a39b; }
#debug .dbg-actions { display: flex; flex-wrap: wrap; gap: .4rem; margin-bottom: .5rem; }
#debug pre { margin: 0 0 .5rem; white-space: pre-wrap; word-break: break-all; }
#debug .dbg-row { display: flex; width: 100%; align-items: stretch; gap: .2rem; margin-bottom: .2rem; }
#debug .dbg-entry { background: #161b22; flex-grow: 1; }
#debug .dbg-restore { flex: none; display: flex; align-items: center; background: #161b22; }
#debug .dbg-entry.on { background: #30363d; }
#debug .dbg-id { color: #8b95a5; }
#debug .dbg-entry .dbg-title { display: flex; gap: .5rem; margin: 0; color: inherit; }
#debug .dbg-time { margin-left: auto; color: #8b95a5; }
#debug .dbg-meta { min-width: 0; margin-left: auto; color: #8b95a5; text-align: right; overflow-wrap: anywhere; }
#debug .dbg-detail { margin: 0 0 .6rem; padding: .5rem; border-left: 2px solid #c0392b; }
#debug .dbg-title { margin: .3rem 0; color: #e8a39b; }
#debug .dbg-change { word-break: break-all; }
`;
