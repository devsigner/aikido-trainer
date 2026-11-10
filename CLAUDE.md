# Aikido Trainer

Petite application web statique (HTML/CSS/JS sans dépendance ni build) qui tire au hasard une technique d'aïkido pour l'entraînement et les révisions.

## Version

**Version actuelle : `20261111.2`** (format `AAAAMMJJ`, la date du jour de la mise à jour).

À chaque nouvelle version :
1. Remplacer le numéro dans `index.html` : `style.css?v=...` et `app.js?v=...` (force le rechargement et contourne le cache).
2. Mettre à jour le numéro ci-dessus.
3. Si deux versions sont publiées le même jour, ajouter un suffixe : `20261111.2`.

## URLs

- Production (GitHub Pages) : https://devsigner.github.io/aikido-trainer
- Dépôt : https://github.com/devsigner/aikido-trainer (branche `main`, publication automatique au push)

## Développement local

Un serveur HTTP est nécessaire (`fetch()` des fichiers JSON ne fonctionne pas en `file://`). Depuis le dossier du projet :

```
python3 -m http.server 8000
# ou
ruby -run -ehttpd . -p8000
```

Puis ouvrir http://localhost:8000.

## Structure

```
index.html            Page unique (accueil + écran de tirage)
style.css
app.js                Logique (chargement, fusion des grades, tirage)
data/grades.json      Liste des grades disponibles
data/2eme-kyo.json    Techniques du 2ème Kyo
data/1er-kyo.json     Techniques propres au 1er Kyo + surcharges
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
          { "nom": "Nikkyo", "formes": ["Omote", "Ura"], "nouveau": false, "attention": true, "note": null, "video": null }
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
- Les lignes `*` de Yokomen uchi du tableau d'origine sont traitées comme `attention`.
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
