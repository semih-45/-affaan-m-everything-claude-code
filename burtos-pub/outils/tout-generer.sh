#!/bin/bash
# Régénère tout : assets -> audio -> vidéo 16:9 4K -> vidéo 9:16 4K
set -e
cd "$(dirname "$0")/.."
python3 outils/preparer_assets.py
python3 outils/audio.py
node outils/rendu.js h
node outils/rendu.js v
ls -la rendus/*.mp4
