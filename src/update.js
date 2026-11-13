// Modèle et mise à jour (pure) : update(model, msg) → [model, commandes].
// Les effets (réseau, hasard, historique) sont décrits par des commandes exécutées par le runtime.
import { buildPool, pickIndex } from "./logic.js";

// État d'une session de tirage ; `program` = { niveau, attaque?, technique? }.
const noSession = () => ({ screen: "home", waza: "", pool: [], total: 0, current: null, done: false, program: null });

export const initialModel = () => ({
  status: "loading", // loading | ready | error
  error: "",
  grades: [], // [{ id, label, fichier, inclut?, count }]
  gradeId: "",
  data: null,
  filters: { nouveau: false, attention: false },
  ...noSession(),
});

export const init = () => [initialModel(), [{ type: "LoadGrades" }, { type: "ReplaceHistory" }]];

const session = (model, waza) => {
  const pool = buildPool(model.data, waza, model.filters);
  return { ...model, ...noSession(), screen: "draw", waza, pool, total: pool.length };
};

export function update(model, msg) {
  switch (msg.type) {
    case "GradesLoaded":
      return [{ ...model, status: "ready", grades: msg.grades, gradeId: msg.gradeId, data: msg.data }, []];
    case "Failed":
      return [{ ...model, status: "error", error: msg.message }, []];
    case "SelectGrade": {
      const grade = model.grades.find((g) => g.id === msg.id);
      return [{ ...model, gradeId: msg.id }, [{ type: "LoadGrade", grade }]];
    }
    case "GradeLoaded":
      // Réponse périmée si l'utilisateur a changé de grade entre-temps.
      return msg.id === model.gradeId ? [{ ...model, data: msg.data }, []] : [model, []];
    case "SetFilter":
      return [{ ...model, filters: { ...model.filters, [msg.name]: msg.checked } }, []];
    case "StartSession":
      return [session(model, msg.waza), [{ type: "Random" }]];
    case "Next":
      return model.pool.length === 0
        ? [{ ...model, current: null, done: true }, []]
        : [model, [{ type: "Random" }]];
    case "Rolled": {
      if (model.screen !== "draw" || model.pool.length === 0) return [model, []];
      const i = pickIndex(model.pool, msg.value);
      return [{ ...model, current: model.pool[i], pool: model.pool.filter((_, j) => j !== i) }, []];
    }
    case "GoHome":
      return [{ ...model, ...noSession() }, []];
    case "OpenProgram":
    case "Navigate": {
      const program = msg.type === "OpenProgram" ? { niveau: 1 } : msg.to;
      return [{ ...model, screen: "program", program }, [{ type: "PushHistory", state: program }]];
    }
    case "Back":
      return [model, [{ type: "HistoryBack" }]];
    case "Popped":
      // Retour du navigateur : état d'historique = vue du programme, `null` = retour au tirage.
      if (msg.state) return model.screen === "home" ? [model, []] : [{ ...model, screen: "program", program: msg.state }, []];
      return model.screen === "program" ? [{ ...model, screen: "draw", program: null }, []] : [model, []];
    default:
      throw new Error(`Message inconnu : ${msg.type}`);
  }
}
