"""Recadre les affiches (sources/affiches) -> assets/produits, et détoure le logo rond.
Usage : python3 outils/preparer_assets.py
Le recadrage [haut, bas] (en px sur l'affiche 864x1232) est lu dans config/recadrages.json."""
import json, os
from PIL import Image, ImageDraw
R = os.path.join(os.path.dirname(__file__), '..')
crops = json.load(open(os.path.join(R, 'config/recadrages.json')))
for slug, (top, bot) in crops.items():
    im = Image.open(os.path.join(R, f'sources/affiches/{slug}.png')).convert('RGB')
    im.crop((0, top, im.width, bot)).save(os.path.join(R, f'assets/produits/{slug}.jpg'), quality=95)
    print(slug, im.size, '->', (im.width, bot - top))
lg = Image.open(os.path.join(R, 'sources/logo-original.png')).convert('RGB')
S = lg.width; ss = 2
m = Image.new('L', (S * ss, S * ss), 0)
c, r = S * ss / 2, 1068 / 2362 * S * ss
ImageDraw.Draw(m).ellipse((c - r, c - r, c + r, c + r), fill=255)
m = m.resize((S, S), Image.LANCZOS)
lg.putalpha(m)
b = int(S / 2 - 1068 / 2362 * S) - 4
lg = lg.crop((b, b, S - b, S - b)).resize((1400, 1400), Image.LANCZOS)
lg.save(os.path.join(R, 'assets/logo/logo-rond.png'))
print('logo ok')
