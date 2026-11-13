// Effets de bord : réseau, hasard, historique. Ils reçoivent `dispatch` et renvoient des messages.
import { countTechniques, mergeGrades } from "./logic.js";

export async function resolveGrade(grade, fetchJson) {
  const fichiers = [...(grade.inclut || []), grade.fichier];
  const datas = await Promise.all(fichiers.map((f) => fetchJson(`data/${f}`)));
  return datas.reduce((acc, d) => mergeGrades(acc, d));
}

const defaultFetchJson = async (url) => {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`${url} : ${res.status}`);
  return res.json();
};

export function createEffects({ fetchJson = defaultFetchJson, random = Math.random, history = globalThis.history } = {}) {
  // Toute erreur de chargement devient un message `Failed`.
  const loading = (fn) => async (cmd, dispatch) => {
    try {
      dispatch(await fn(cmd));
    } catch (e) {
      dispatch({ type: "Failed", message: `Chargement impossible (${e.message})` });
    }
  };
  return {
    LoadGrades: loading(async () => {
      const grades = await fetchJson("data/grades.json");
      const resolved = await Promise.all(grades.map((g) => resolveGrade(g, fetchJson)));
      return {
        type: "GradesLoaded",
        grades: grades.map((g, i) => ({ ...g, count: countTechniques(resolved[i]) })),
        gradeId: grades[0].id,
        data: resolved[0],
      };
    }),
    LoadGrade: loading(async ({ grade }) => ({ type: "GradeLoaded", id: grade.id, data: await resolveGrade(grade, fetchJson) })),
    Random: (_, dispatch) => dispatch({ type: "Rolled", value: random() }),
    PushHistory: ({ state }) => history.pushState(state, ""),
    ReplaceHistory: () => history.replaceState(null, ""),
    HistoryBack: () => history.back(),
  };
}
