// Side effects: network, randomness, history. They receive `dispatch` and send messages back.
import { countTechniques, mergeGrades } from "./logic.js";

export const SKIP_VIDEO_WARNING_KEY = "aikido.skipVideoWarning";

export async function resolveGrade(grade, fetchJson) {
  const files = [...(grade.includes || []), grade.file];
  const datas = await Promise.all(files.map((file) => fetchJson(`data/${file}`)));
  return datas.reduce((merged, data) => mergeGrades(merged, data));
}

const defaultFetchJson = async (url) => {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`${url} : ${res.status}`);
  return res.json();
};

export function createEffects({ fetchJson = defaultFetchJson, random = Math.random, history = globalThis.history, storage = globalThis.localStorage, open = globalThis.open } = {}) {
  // Any loading error becomes a `Failed` message.
  const loading = (fn) => async (cmd, dispatch) => {
    try {
      dispatch(await fn(cmd));
    } catch (error) {
      dispatch({ type: "Failed", message: `Chargement impossible (${error.message})` });
    }
  };
  return {
    LoadGrades: loading(async ({ gradeId }) => {
      const grades = await fetchJson("data/grades.json");
      const first = Math.max(0, grades.findIndex((grade) => grade.id === gradeId));
      const resolved = await Promise.all(grades.map((grade) => resolveGrade(grade, fetchJson)));
      return {
        type: "GradesLoaded",
        grades: grades.map((grade, index) => ({ ...grade, count: countTechniques(resolved[index]) })),
        gradeId: grades[first].id,
        data: resolved[first],
      };
    }),
    LoadGrade: loading(async ({ grade }) => ({ type: "GradeLoaded", id: grade.id, data: await resolveGrade(grade, fetchJson) })),
    Random: (_, dispatch) => dispatch({ type: "Rolled", value: random() }),
    OpenUrl: ({ url }) => open?.(url, "_blank", "noopener"),
    SaveSkipVideoWarning: () => {
      try {
        storage?.setItem(SKIP_VIDEO_WARNING_KEY, "1");
      } catch {
        // Storage unavailable (private mode): the preference only lasts for this visit.
      }
    },
    Url: ({ mode, hash, position }) => (mode === "push" ? history.pushState({ position }, "", hash) : history.replaceState({ position }, "", hash)),
  };
}
