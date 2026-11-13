// Effets de bord : réseau, hasard, historique. Ils reçoivent `dispatch` et renvoient des messages.
import { countTechniques, mergeGrades } from "./logic.js";

export async function resolveGrade(grade, fetchJson) {
  let result = null;
  for (const fichier of [...(grade.inclut || []), grade.fichier]) {
    const d = await fetchJson(`data/${fichier}`);
    result = result ? mergeGrades(result, d) : d;
  }
  return result;
}

const defaultFetchJson = async (url) => {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`${url} : ${res.status}`);
  return res.json();
};

export function createEffects({ fetchJson = defaultFetchJson, random = Math.random, history = globalThis.history } = {}) {
  const failed = (dispatch) => (e) => dispatch({ type: "Failed", message: `Chargement impossible (${e.message})` });
  return {
    async LoadGrades(_, dispatch) {
      try {
        const grades = await fetchJson("data/grades.json");
        const resolved = await Promise.all(grades.map((g) => resolveGrade(g, fetchJson)));
        dispatch({
          type: "GradesLoaded",
          grades: grades.map((g, i) => ({ ...g, count: countTechniques(resolved[i]) })),
          gradeId: grades[0].id,
          data: resolved[0],
        });
      } catch (e) {
        failed(dispatch)(e);
      }
    },
    async LoadGrade({ grade }, dispatch) {
      try {
        dispatch({ type: "GradeLoaded", id: grade.id, data: await resolveGrade(grade, fetchJson) });
      } catch (e) {
        failed(dispatch)(e);
      }
    },
    Random: (_, dispatch) => dispatch({ type: "Rolled", value: random() }),
    PushHistory: ({ state }) => history.pushState(state, ""),
    ReplaceHistory: () => history.replaceState(null, ""),
    HistoryBack: () => history.back(),
  };
}
