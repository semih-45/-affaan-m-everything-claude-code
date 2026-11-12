# BURTOS — Publicité motion design (40 s, 4K, 30 i/s)

Publicité entièrement animée par code : chaque image est calculée à partir du temps `t`,
puis rendue en 4K par Chromium et encodée par ffmpeg. Aucune séquence n'est une image fixe.

## Livrables (`out/`)

| Fichier | Format |
|---|---|
| `BURTOS_pub_4K_16x9.mp4` | 3840 × 2160, horizontal, avec voix off |
| `BURTOS_pub_4K_9x16.mp4` | 2160 × 3840, vertical (réseaux sociaux), avec voix off |
| `…_sans-voix.mp4` | mêmes vidéos, musique + bruitages seuls (pour poser une vraie voix) |
| `audio-mix.wav`, `audio-sans-voix.wav` | bandes-son seules |

## Organisation

```
src/config.js          ← TOUT le contenu modifiable (textes, produits, prix, contacts, minutage)
src/scenes/01-intro.js … 06-outro.js   ← une scène indépendante par fichier
src/engine.js, fx.js   ← moteur (timeline, transitions, particules, énergie)
src/style.css          ← mise en page ; les règles « .v … » concernent le format vertical
assets/products/       ← photos des sandwichs
assets/fonts/          ← polices (Montserrat, Luckiest Guy — licence SIL OFL)
audio/make_audio.py    ← musique + bruitages (synthèse) + mixage de la voix
audio/voice/           ← voix off (vo1…vo6.wav) et texte (lines.txt)
tools/render.js        ← rendu image par image
build.sh               ← reconstruit tout
```

## Remplacer une photo de produit

1. Déposer la nouvelle image dans `assets/products/` (JPG ou PNG, idéalement ≥ 1600 px de large ;
   n'importe quel ratio : la carte s'adapte, la photo n'est jamais déformée).
2. Soit garder le même nom de fichier, soit modifier la ligne `image:` du produit dans `src/config.js`.
3. Nom, catégorie, prix et ingrédients se changent dans la même ligne. Un prix vide (`price: ''`) masque la pastille.
4. Ajouter / retirer un produit : ajouter / retirer une ligne dans `products` et un repère dans `cues.select`
   (1 produit = 1 seconde).
5. Relancer `./build.sh`.

## Autres réglages (`src/config.js`)

- `brand.logoImage` : chemin d'un PNG transparent pour utiliser le logo officiel à la place du logo vectoriel.
- `brand.phone`, `brand.snapchat`, `brand.instagram` : coordonnées de la scène finale (un champ vide n'est pas affiché).
- `chat`, `reviews`, `zones`, `mapInfo`, `text` : contenus des scènes 3 à 6.
- `showDisclaimers` : mentions « mise en situation » des scènes 3 et 4.

## Aperçu et rendu

Prérequis : Node.js + Playwright (Chromium), ffmpeg, Python 3 avec `numpy` et `scipy`.

```bash
./build.sh                                              # tout (≈ 20 min)
node tools/render.js horizontal --still 9.5 image.png   # une image de contrôle à t = 9,5 s
```

Aperçu temps réel : ouvrir `src/index.html` dans Chrome (ajouter `?format=vertical` pour le 9:16),
barre d'espace pour lire, clic sur la barre du bas pour naviguer.

## Voix off

Générée localement avec Piper (voix française libre `fr_FR-siwis-medium`) :

```bash
pip install piper-tts
echo "Texte" | python3 -m piper -m fr_FR-siwis-medium.onnx --length-scale 0.9 -f audio/voice/vo1.wav
```

Pour une voix enregistrée : remplacer `audio/voice/vo1.wav` … `vo6.wav` (mêmes durées approximatives),
puis `./build.sh`. Les instants de départ sont dans `vo` (`src/config.js`).

## Ressources et droits

- Musique et bruitages : créations originales générées par `audio/make_audio.py` — libres d'usage commercial.
- Polices : Montserrat et Luckiest Guy (SIL Open Font License).
- Photos produits : visuels fournis par BURTOS.
- Aucun personnage, logo, interface ou musique protégés par des tiers n'est utilisé.
