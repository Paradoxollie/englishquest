"""Détoure une pose de mascotte (fond uni clair) en WebP transparent.
Remplissage par diffusion depuis les bords : seul le fond relié aux bords devient transparent,
les zones claires du personnage (visage, gants) restent opaques grâce au contour d'encre.
usage : python scripts/visuals/cutout.py <source.png> <sortie.webp> <taille>
"""
import sys
from collections import deque
from PIL import Image, ImageFilter

src, out, size = sys.argv[1], sys.argv[2], int(sys.argv[3])
im = Image.open(src).convert("RGB")
w, h = im.size
px = im.load()
border = [px[x, y] for x in range(0, w, 5) for y in (1, h - 2)] + [px[x, y] for y in range(0, h, 5) for x in (1, w - 2)]
bg = tuple(sorted(c[i] for c in border)[len(border) // 2] for i in range(3))
tol = 46

def is_bg(c):
    return abs(c[0] - bg[0]) + abs(c[1] - bg[1]) + abs(c[2] - bg[2]) <= tol

mask = Image.new("L", (w, h), 255)
mp = mask.load()
seen = bytearray(w * h)
q = deque()
for x in range(w):
    q.append((x, 0)); q.append((x, h - 1))
for y in range(h):
    q.append((0, y)); q.append((w - 1, y))
while q:
    x, y = q.popleft()
    i = y * w + x
    if seen[i]:
        continue
    seen[i] = 1
    if not is_bg(px[x, y]):
        continue
    mp[x, y] = 0
    if x > 0: q.append((x - 1, y))
    if x < w - 1: q.append((x + 1, y))
    if y > 0: q.append((x, y - 1))
    if y < h - 1: q.append((x, y + 1))
# Bord adouci d'un pixel
mask = mask.filter(ImageFilter.MinFilter(3)).filter(ImageFilter.GaussianBlur(0.8))
rgba = im.convert("RGBA")
rgba.putalpha(mask)
bbox = mask.getbbox()
if bbox:
    rgba = rgba.crop(bbox)
# Carré centré
side = max(rgba.size)
canvas = Image.new("RGBA", (side, side), (0, 0, 0, 0))
canvas.paste(rgba, ((side - rgba.size[0]) // 2, side - rgba.size[1]))
canvas = canvas.resize((size, size), Image.LANCZOS)
canvas.save(out, "WEBP", quality=86, method=6)
print(out, canvas.size, "fond", bg)
