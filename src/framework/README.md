# Framework Elm par features

Petit framework JS pur (ES modules, sans build ni dépendance).
Aucun fichier de ce dossier n'importe quoi que ce soit hors du dossier : on peut le copier tel quel dans un autre projet.

| Fichier      | Rôle                                                                                                                      |
|--------------|---------------------------------------------------------------------------------------------------------------------------|
| `combine.js` | `defineFeature(spec)`, `combine({ nom: feature })`, `to(feature, msg)`, `embed(feature, vnode)`                                                          |
| `effects.js` | `createEffects` / `createSubscriptions(features, overrides)` : effets et abonnements des features, avec les services du navigateur par défaut (`fetchJson`, `random`, `history`, `storage`, `open`) |
| `vdom.js`    | `h()` et `createRenderer(root)` : mini DOM virtuel (les handlers sont des messages)                                       |
| `runtime.js` | `run({ init, update, view, render, effects, subscribe, flags, debug })` : boucle Elm                                      |
| `debug.js`   | `mountDebugger(slices, hide)` : panneau d'état, journal, voyage dans le temps (utilise des classes CSS `dbg-*` à fournir) |

## Une feature

Une feature est un module qui exporte **`feature`**, déclaré avec `defineFeature` (les clés inconnues sont refusées ; `model` ou `init` est obligatoire) :

```js
export const feature = defineFeature({
  model,                                       // modèle initial (statique) de sa tranche
  lazy?,                                       // true : pas de tranche tant qu'aucun message ni événement abonné ne l'atteint
  init?(flags, model) → [model, cmds, events?],  // optionnel : flags, commandes de démarrage
  messages: { Type: (model, msg, root) → [model, cmds, events?] },   // root = modèle complet, en lecture seule
  on: { EventType: (model, event, root) → [model, cmds, events?] },
  view?, effects?(deps) → { CmdType: (cmd, dispatch) => … },
  subscribe?(dispatch, deps),                  // écoute le monde extérieur (popstate…) ; dispatch écrit à cette feature
  views?: { nom: (…) => vnode },               // morceaux de vue exposés aux autres
  events?: { nom: (…) => événement },          // constructeurs des événements publiés
});
```

Le nom de la feature est sa clé dans l'objet passé à `combine` : `combine({ counter, log })` → `model.counter`, `model.log`. Un message inconnu lève « Unknown message ».

- Une feature n'écrit que sa propre tranche. Pour agir sur une autre, elle **publie un événement** (3ᵉ élément du résultat) auquel l'autre s'abonne dans `on`.
- Les événements sont livrés dans l'ordre (FIFO) ; une boucle de plus de 1000 événements lève une erreur.
- Les messages racine sont des enveloppes `{ feature, msg }` ; les commandes sont taguées avec leur feature, et la réponse d'un effet retourne à celle-ci.
- `embed` enveloppe les handlers d'une vue de feature ; un message déjà adressé (`to(...)`) est laissé tel quel.
- **Feature `lazy`** : sa tranche n'existe pas à l'`init` ; elle est créée (avec `init(flags, model)`) au premier message ou événement auquel elle est abonnée. Un `update` ou une réaction qui renvoie `UNMOUNT` comme modèle supprime la tranche (les commandes et événements sont conservés) ; un nouveau message la recrée depuis `init`. Pendant ce temps `root[name]` est `undefined` : les autres features et la vue doivent le tolérer. Une réponse d'effet tardive la recrée aussi. Avec `lazy: { events: [types] }`, seuls un message ou ces événements créent la tranche ; les autres événements sont ignorés tant qu'elle est démontée.
- `combine({ nom: feature })` renvoie `{ init, update, subscribe, effects }`, directement utilisables par `run`.

## Exemple

`examples/counter/` : deux features (compteur, journal qui réagit à un événement). Servir la racine du dépôt (`python3 -m http.server`) et ouvrir `/examples/counter/`. Le test `tests/framework.test.js` l'exerce.

## Extraire en dépôt séparé

Copier ce dossier (et `examples/`). Rien d'autre n'est requis ; pour l'import map et le service worker d'une app, enregistrer chaque fichier (voir `index.html` et `sw.js` d'Aikido Trainer).
