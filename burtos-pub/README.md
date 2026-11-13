# BURTOS — Publicité motion design (35 s, 4K)

Publicité entièrement animée par code : chaque image est calculée à partir du temps, puis
capturée en 4K et encodée. Rien n'est un diaporama : toutes les scènes sont des compositions
multicouches (3D CSS, particules, éclairs, caméra virtuelle, typographie cinétique).

## Livrables (`rendus/`)

| Fichier | Format |
|---|---|
| `BURTOS-pub-16x9-4K.mp4` | 3840 × 2160, 30 i/s, H.264 + AAC |
| `BURTOS-pub-vertical-9x16-4K.mp4` | 2160 × 3840, 30 i/s (TikTok / Reels / Snapchat) |
| `burtos-audio.wav` | Mixage final (voix + musique + bruitages) |

## Organisation

```
config/contenu.js      <- TOUT le contenu modifiable (produits, textes, avis, communes, contact, minutage)
config/recadrages.json <- zone conservée de chaque affiche produit
sources/affiches/      <- affiches d'origine des produits        sources/menus-prix/ <- menus et prix (à déposer)
assets/logo/  assets/produits/  assets/polices/
assets/voix-off/       <- voix off d'origine, version montée, segments
assets/musique/        <- musique générée (ou musique-perso.wav pour la remplacer)
assets/sons/           <- piste de sound design
src/moteur.js          <- moteur (temps, courbes, particules, éclairs, transitions)
src/scenes/s1…s6       <- une scène indépendante par fichier
outils/                <- préparation des assets, audio, rendu
rendus/                <- vidéos finales
```

## Remplacer un produit, une photo, un prix

1. Déposer la nouvelle affiche dans `sources/affiches/mon-produit.png` et ajouter sa ligne dans
   `config/recadrages.json` (`[haut, bas]` en pixels : la partie de l'affiche à garder).
   — ou déposer directement une photo dans `assets/produits/`.
2. Dans `config/contenu.js`, section `produits` : modifier `nom`, `categorie`, `photo`, `prix`
   (`prix: ''` = aucun prix affiché ; `prix: '8,50 €'` l'affiche automatiquement).
3. Relancer : `./outils/tout-generer.sh`

Les avis, la conversation, les communes, le téléphone, Snapchat et Instagram se changent de la
même façon dans `config/contenu.js` (`instagram: '@…'` fait apparaître la pastille dans le final).

## Voix off

La voix actuelle est une voix de synthèse générée localement (Piper, voix française « tom ») à partir
des phrases de `config/voix-off.json` : `texte` = phrase, `dit` = orthographe phonétique lue par la voix
(n'affecte jamais l'écran), `position` = seconde de départ. Modifier puis relancer `python3 outils/audio.py`.
Le modèle (`assets/voix-off/modele/fr_FR-tom-medium.onnx`, non versionné) se télécharge depuis
`huggingface.co/rhasspy/piper-voices` (fr/fr_FR/tom/medium) ; `pip install piper-tts`.
Pour revenir à un enregistrement réel : mettre `"mode": "fichier"` et ajuster le tableau `VOIX` de `outils/audio.py`.

Texte du storyboard à enregistrer pour une version complète (prononciation des noms à contrôler) :

| Nom affiché | Guide de prononciation |
|---|---|
| BUR-TOS | « beur-toss » |
| LE MONTAGNARD | « le mon-ta-gnar » |
| LE BIG STATES | « le bigue stéïtss » |
| LE SPICY | « le spaï-ci » |
| POULET MERGUEZ | « poulè mèr-guèz » |
| VIANDE TENDERS | « viande tènn-deurz » |
| CORDON-BLEU TENDERS | « cordon bleu tènn-deurz » |
| VIANDE HACHÉE POULET CURRY | « viande hachée, poulè cu-ri » |

## Musique

Composition originale générée par `outils/audio.py` (électro-funk 120 BPM, aucun sample tiers).
Pour une musique sous licence : déposer `assets/musique/musique-perso.wav` puis relancer
`python3 outils/audio.py` (la voix et les bruitages sont remixés par-dessus).

## Commandes

```
npm install                        # polices (déjà copiées dans assets/polices) — Playwright + ffmpeg requis
python3 outils/preparer_assets.py  # recadre les affiches, détoure le logo
python3 outils/audio.py            # bande son
node outils/apercu.js h 6.5 24     # images d'aperçu à 6,5 s et 24 s (h ou v)
node outils/rendu.js h             # rendu 4K 16:9      node outils/rendu.js v  -> 9:16
```
Aperçu temps réel dans un navigateur : ouvrir `src/index.html?play=1` (ajouter `&format=v` pour le vertical).

## Avant diffusion

- Les 3 avis sont des **exemples** : les remplacer par de vrais témoignages autorisés.
- La mention « MISE EN SITUATION » de la conversation est masquée (`mentionSituation` dans `config/contenu.js`).
