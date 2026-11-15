"""Convertit une image générée (PNG) en JPG optimisé pour public/art.
usage : python scripts/visuals/to-jpg.py <source.png> <sortie.jpg> <largeur> [ratio] [--whiten]
  ratio   : rapport largeur/hauteur à recadrer au centre (ex. 1.6, 0.8, 0.75, 1)
  --whiten : ramène le fond crème au blanc pur (poses des mascottes, affichées en mode « produit »)
"""
import sys
from PIL import Image

args = [a for a in sys.argv[1:] if not a.startswith("--")]
whiten = "--whiten" in sys.argv
src, out, width = args[0], args[1], int(args[2])
ratio = float(args[3]) if len(args) > 3 else None
im = Image.open(src).convert("RGB")
if ratio:
    w, h = im.size
    target_h = round(w / ratio)
    if target_h <= h:
        top = (h - target_h) // 2
        im = im.crop((0, top, w, top + target_h))
    else:
        target_w = round(h * ratio)
        left = (w - target_w) // 2
        im = im.crop((left, 0, left + target_w, h))
if whiten:
    # Couleur du fond : médiane des bords de l'image.
    w, h = im.size
    border = [im.getpixel((x, y)) for x in range(0, w, 7) for y in (2, h - 3)] + [im.getpixel((x, y)) for y in range(0, h, 7) for x in (2, w - 3)]
    bg = [sorted(c[i] for c in border)[len(border) // 2] for i in range(3)]
    lut = []
    for i in range(3):
        lut += [min(255, round(v * 255 / max(bg[i], 1))) for v in range(256)]
    im = im.point(lut)
im = im.resize((width, round(width * im.size[1] / im.size[0])), Image.LANCZOS)
im.save(out, "JPEG", quality=78, optimize=True, progressive=True)
print(out, im.size)
