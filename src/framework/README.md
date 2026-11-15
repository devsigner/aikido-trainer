# Framework Elm par features

Petit framework JS pur (ES modules, sans build ni dépendance).
Aucun fichier de ce dossier n'importe quoi que ce soit hors du dossier : on peut le copier tel quel dans un autre projet.

| Fichier      | Rôle                                                                                                                      |
|--------------|---------------------------------------------------------------------------------------------------------------------------|
| `combine.js` | `combine(features)`, `to(feature, msg)`, `embed(feature, vnode)`                                                          |
| `effects.js` | `createEffects` / `createSubscriptions(features, overrides)` : effets et abonnements des features, avec les services du navigateur par défaut (`fetchJson`, `random`, `history`, `storage`, `open`) |
| `vdom.js`    | `h()` et `createRenderer(root)` : mini DOM virtuel (les handlers sont des messages)                                       |
| `runtime.js` | `run({ init, update, view, render, effects, subscribe, flags, debug })` : boucle Elm                                      |
| `debug.js`   | `mountDebugger(slices, hide)` : panneau d'état, journal, voyage dans le temps (utilise des classes CSS `dbg-*` à fournir) |

## Une feature

```js
{
  name,                                        // clé de sa tranche : model[name]
  init(flags) → [model, cmds, events?],
  update(model, msg, root) → [model, cmds, events?],   // root = modèle complet, en lecture seule
  on: { EventType: (model, event, root) → [model, cmds, events?] },
  view?, effects?(deps) → { CmdType: (cmd, dispatch) => … },
  subscribe?(dispatch, deps),                  // écoute le monde extérieur (popstate…) ; dispatch écrit à cette feature
}
```

- Une feature n'écrit que sa propre tranche. Pour agir sur une autre, elle **publie un événement** (3ᵉ élément du résultat) auquel l'autre s'abonne dans `on`.
- Les événements sont livrés dans l'ordre (FIFO) ; une boucle de plus de 1000 événements lève une erreur.
- Les messages racine sont des enveloppes `{ feature, msg }` ; les commandes sont taguées avec leur feature, et la réponse d'un effet retourne à celle-ci.
- `embed` enveloppe les handlers d'une vue de feature ; un message déjà adressé (`to(...)`) est laissé tel quel.
- `combine(features)` renvoie `{ init, update, effects }`, directement utilisables par `run`.

## Exemple

`examples/counter/` : deux features (compteur, journal qui réagit à un événement). Servir la racine du dépôt (`python3 -m http.server`) et ouvrir `/examples/counter/`. Le test `tests/framework.test.js` l'exerce.

## Extraire en dépôt séparé

Copier ce dossier (et `examples/`). Rien d'autre n'est requis ; pour l'import map et le service worker d'une app, enregistrer chaque fichier (voir `index.html` et `sw.js` d'Aikido Trainer).
