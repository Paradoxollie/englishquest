"""Convertit une image générée (PNG) en JPG optimisé pour public/art.
usage : python scripts/visuals/to-jpg.py <source.png> <sortie.jpg> <largeur> [ratio, ex. 1.6 ou 1]
"""
import sys
from PIL import Image

src, out, width = sys.argv[1], sys.argv[2], int(sys.argv[3])
ratio = float(sys.argv[4]) if len(sys.argv) > 4 else None
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
im = im.resize((width, round(width * im.size[1] / im.size[0])), Image.LANCZOS)
im.save(out, "JPEG", quality=76, optimize=True, progressive=True)
print(out, im.size)
