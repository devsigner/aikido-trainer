// URL ⇄ model: #/grade[/waza[/program[/attack[/technique]]]] (hash routing works on GitHub Pages).
export function toHash(model) {
  const parts = [model.gradeId];
  if (model.screen !== "home") parts.push(model.waza);
  if (model.screen === "program") {
    const { level, attack, technique } = model.program;
    parts.push("program");
    if (level >= 2) parts.push(attack);
    if (level === 3) parts.push(technique);
  }
  return `#/${parts.map(encodeURIComponent).join("/")}`;
}

// Returns { grade?, waza?, program? }; an unreadable URL gives an empty route (home).
export function parseHash(hash) {
  let parts;
  try {
    parts = String(hash || "").replace(/^#\/?/, "").split("/").filter(Boolean).map(decodeURIComponent);
  } catch {
    return {};
  }
  const [grade, waza, segment, attack, technique] = parts;
  const program = segment === "program" ? { level: technique ? 3 : attack ? 2 : 1, attack, technique } : null;
  return { grade, waza, program };
}
