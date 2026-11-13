# Aikido Trainer

Petite application web statique (HTML/CSS/JS sans dépendance ni build) qui tire au hasard une technique d'aïkido pour l'entraînement et les révisions.

## Version

**Version actuelle : `20261113`** (format `AAAAMMJJ`, la date du jour de la mise à jour).

À chaque nouvelle version :
1. Remplacer le numéro dans `index.html` : `favicon.ico?v=...`, `style.css?v=...` et `app.js?v=...` (force le rechargement et contourne le cache).
2. Mettre la même valeur dans `const VERSION` de `sw.js` (renouvelle le cache hors ligne).
3. Mettre à jour le numéro ci-dessus.
4. Si deux versions sont publiées le même jour, ajouter un suffixe : `20261111.2`.

## Ordre des techniques (`order`)

Chaque technique des JSON (`data/*.json`, y compris les surcharges de `1er-kyo.json`) a une clé `order` (entier). Elle sert à trier les techniques d'une attaque dans le programme : `order` croissant, puis ordre alphabétique (français) à égalité.

| order | Techniques                            |
|-------|---------------------------------------|
| 1     | Ikkyo                                 |
| 2     | Nikkyo                                |
| 3     | Sankyo                                |
| 4     | Yonkyo                                |
| 5     | Gokyo                                 |
| 5     | Tenchi nage                           |
| 6     | Sokumen irimi nage                    |
| 7     | Shiho nage                            |
| 8     | Ude kime nage                         |
| 9     | Irimi nage                            |
| 10    | Kote gaeshi                           |
| 11    | Kaiten nage                           |
| 42    | toutes les autres (valeur par défaut) |

Règles :
- Une nouvelle technique reçoit l'`order` de son nom s'il est dans le tableau, sinon `42`.
- Pour changer l'`order` d'un nom, le modifier partout (2ème et 1er Kyo) et mettre à jour ce tableau et `NOMBRES` dans `tests/app.test.js` : un test vérifie la cohérence.

## Ordre des attaques (`order`)

Chaque attaque des JSON a aussi une clé `order` (entier), qui trie la liste des attaques du programme : `order` croissant, puis ordre alphabétique (français) à égalité. Ce tableau fait référence (une valeur par nom d'attaque, identique dans tous les waza et grades) :

| order | Attaque |
|-------|---------|
| 1     | Katate dori |
| 2     | Aï hammi katate dori |
| 3     | Ryote dori |
| 4     | Katate ryote dori (ou morote dori) |
| 5     | Kata dori |
| 6     | Yokomen uchi |
| 7     | Shomen uchi |
| 8     | Chudan tsuki |
| 9     | Ryo kata dori |
| 10     | Ushiro ryote dori |
| 11     | Ushiro ryo kata dori |
| 12     | Ushiro ryo hiji dori |
| 13     | Kata dori men uchi |
| 14     | Diverses formes d'attaques |
| 15     | Muna dori |
| 16     | Jodan tsuki |
| 17     | Ushiro eri dori |
| 18     | Ushiro katate dori kubi shime |
| 19     | Diverses applications |
| 20     | Divers saisies et frappes |
| 42    | toutes les autres (valeur par défaut) |

Mêmes règles que pour les techniques : une nouvelle attaque reçoit la valeur de son nom si elle est dans le tableau, sinon `42` ; pour changer une valeur, la modifier partout et mettre à jour ce tableau et `ATTAQUES` dans `tests/app.test.js`.

## Programme

Le bouton « Voir le programme » (écran de tirage, sous « Retour à l'accueil ») ouvre le listing complet du waza et du grade sélectionnés, sans toucher à la session (techniques déjà tirées conservées). Les filtres 🆕/⚠️ ne s'y appliquent pas.

1. Liste de toutes les attaques (triées par `order`, puis alphabétique).
2. Clic sur une attaque : sa carte et la liste de ses techniques (triées par `order`, puis alphabétique).
3. Clic sur une technique : sa carte (formes, badges, note, vidéo) et, dessous, les autres attaques du même waza qui ont la même technique (nom comparé sans casse ni accents). Un clic sur l'une d'elles ouvre sa carte.

Le bouton ← et le retour du navigateur (`history`) remontent d'un niveau, puis reviennent au tirage.

## Application mobile (PWA)

Installable sur l'écran d'accueil (iOS : Partager → « Sur l'écran d'accueil » ; Android : « Installer l'application ») et utilisable hors ligne.

- `manifest.webmanifest` : mode `standalone`, portrait, couleurs `#14171c`, icônes `icons/icon-192.png` et `icons/icon-512.png` (maskable). Toutes les URLs sont relatives (le site est servi sous `/aikido-trainer/` en production).
- `icons/apple-touch-icon.png` (180 px) pour iOS. Balises `apple-mobile-web-app-*` et `theme-color` dans `index.html`, `viewport-fit=cover` avec marges `env(safe-area-inset-*)` dans `style.css`.
- `sw.js` : précache tous les fichiers (dont les JSON de `data/`), stratégie réseau d'abord puis cache. Tout nouveau fichier de données ou d'icône doit être ajouté à `PRECACHE` (un test le vérifie pour `data/`).
- Le service worker exige HTTPS (ou `localhost`) : il fonctionne en production (GitHub Pages) et en local, mais pas sur l'IP du réseau local en HTTP.

## URLs

- Production (GitHub Pages) : https://devsigner.github.io/aikido-trainer
- Dépôt : https://github.com/devsigner/aikido-trainer (branche `main`, publication automatique au push)

## Développement local

Un serveur HTTP est nécessaire (`fetch()` des fichiers JSON ne fonctionne pas en `file://`). Depuis le dossier du projet :

```
corepack enable  # active le gestionnaire de paquets (Node ≥ 20)
yarn install     # une seule fois (installe http-server)
yarn server
```

Puis ouvrir http://localhost:8000. `yarn server` lance `http-server` sur le port 8000 avec le cache désactivé (`-c-1`).

Sans yarn, tout serveur statique convient :

```
python3 -m http.server 8000
# ou
ruby -run -ehttpd . -p8000
```

## Tests

Aucune dépendance de test : lanceur intégré à Node (≥ 20).

```
yarn test
```

`tests/app.test.js` charge le vrai `app.js` dans un faux DOM (`vm`) et couvre : validité des JSON (format, doublons, orthographe), fusion des grades (sans perte), pondération et filtres, tirage sans répétition, programme (attaques, techniques, mêmes techniques, retour), écrans (accueil, tirage, fin de waza, retour à l'accueil), cohérence du numéro de version (`index.html` ↔ `sw.js` ↔ `CLAUDE.md`) et configuration mobile (balises, manifeste, icônes, précache du service worker). `app.js` doit se terminer par `init();`. Lancer les tests avant chaque commit et en ajouter pour toute nouvelle règle.

## Structure

```
index.html            Page unique (accueil + écran de tirage)
favicon.ico           Icône du site (caractère 道, PNG 16/32/48/64 px intégrés)
style.css
manifest.webmanifest   Manifeste PWA
sw.js                 Service worker (hors ligne)
icons/                Icônes de l'application (192, 512, apple-touch-icon)
app.js                Logique (chargement, fusion des grades, tirage)
data/grades.json      Liste des grades disponibles
data/2eme-kyo.json    Techniques du 2ème Kyo
data/1er-kyo.json     Techniques propres au 1er Kyo + surcharges
tests/app.test.js     Tests (node:test)
package.json          Scripts `yarn server` et `yarn test`, gestionnaire de paquets (`packageManager`)
yarn.lock             Versions verrouillées des dépendances
```

## Données (JSON)

Un fichier par grade :

```json
{
  "grade": "2ème Kyo",
  "waza": {
    "Tachi waza": [
      {
        "nom": "Aï hammi katate dori",
        "techniques": [
          {
            "nom": "Nikkyo",
            "formes": ["Omote", "Ura"],
            "nouveau": false,
            "attention": true,
            "note": null,
            "video": null,
            "order": 2
          }
        ]
      }
    ]
  }
}
```

- Waza : `Tachi waza`, `Suwari waza`, `Hanmi Handachi waza`.
- `formes` : tableau, vide s'il n'y a pas de forme à tirer.
- `nouveau` (🆕) et `attention` (⚠️) : marqueurs portés par la technique entière.
- `note` : texte libre affiché sous la technique (ex. « Naname », « 3 formes différentes »). `video` : URL, le lien n'est affiché que s'il existe.
- Orthographe harmonisée : Nikkyo, Sankyo, première lettre en majuscule puis minuscules (ex. « Kote gaeshi »).
- Ajouter un grade : créer `data/<id>.json`, puis ajouter une entrée dans `data/grades.json` (`id`, `label`, `fichier`, et éventuellement `inclut`).

### Héritage entre grades

`grades.json` accepte `inclut` : liste de fichiers chargés avant le fichier du grade. Le 1er Kyo inclut le 2ème Kyo (`"inclut": ["2eme-kyo.json"]`), le 2ème Kyo charge uniquement son fichier.

`mergeGrades` (dans `app.js`) fusionne par nom (waza, attaque, technique) : le fichier du grade prime. `1er-kyo.json` ne contient donc que les techniques nouvelles et des surcharges minimales (nom + marqueurs) pour les techniques communes dont les marqueurs diffèrent (🆕 du 2ème Kyo devient ⚠️ au 1er Kyo). Ne pas recopier les données du 2ème Kyo.

## Règles de l'application

- **Accueil** : sélecteur de grade (avec le nombre de techniques), filtres 🆕 Nouveautés / ⚠️ Attention, puis un bouton par waza (ordre défini par `WAZA_ORDER`).
- **Filtres** : aucun coché = tout ; un seul = techniques ayant ce marqueur ; les deux = l'un OU l'autre. Un waza sans technique correspondante est désactivé.
- **Tirage** : uniforme sur toutes les combinaisons `attaque × technique × forme`, pondéré. Poids ×1,5 pour `nouveau` et ×1,5 pour `attention` (cumulables), constantes `POIDS_NOUVEAU` et `POIDS_ATTENTION` en haut de `app.js`.
- **Sans répétition** : une combinaison déjà tirée ne ressort pas pendant la session. Quand tout est passé, « Waza terminé 🎉 ».
- **Session** : réinitialisée par « Retour à l'accueil ». Les filtres sont pris en compte au choix du waza.
- **Affichage** : waza, attaque, technique, forme, badges 🆕/⚠️, note, lien vidéo, compteur de progression (« n / total », par combinaison).
- **Boutons** : « Technique suivante » (même waza) et « Retour à l'accueil ».
- Le compteur du sélecteur de grade compte les techniques par attaque, sans multiplier par les formes.
