#!/usr/bin/env python3
"""Turn his own product photographs into seamlessly tiling textures.

    python3 scripts/make_textures.py

Why his photos and not stock: these are the panels he actually sells. A stock
picture of somebody else's oak slat wall would look better and be a lie, and a
customer who orders from it gets a different product.

The hard part is tiling. A slat panel photographed straight on is a repeating
pattern, so the tile has to be an EXACT whole number of slats wide - one pixel
out and the seam shows as a stripe every repeat. The pitch is therefore
measured, not eyeballed: the column brightness profile is auto-correlated and
the strongest period inside a plausible range wins.

Vertical tiling is not attempted. On a normal wall the panel runs floor to
ceiling in one piece - 2,90 m - so the texture is stretched once over the
height and never repeats downwards. A vertical seam would only appear on a wall
taller than 2,90 m, and those get a real butt joint drawn anyway.
"""
from __future__ import annotations

import json
import pathlib
import sys

from PIL import Image, ImageStat

ROOT = pathlib.Path(__file__).resolve().parent.parent
SRC = ROOT / "public" / "img"
OUT = ROOT / "public" / "textures"

#: source photo -> (id, human name, crop box as fractions of w/h, is it slatted)
#:
#: The crops avoid the white studio background and the shadowed edges of the
#: board. Every name says what the photograph IS; none of them invents a finish
#: name he has never used.
JOBS = [
    ("akusticen-panel-8300-1.png", "oak", "Даб", (0.06, 0.10, 0.94, 0.90), True),
    ("akusticen-panel-8300-2.jpg", "natural", "Натур", (0.06, 0.10, 0.94, 0.90), True),
    ("akusticen-panel-8300-3.webp", "anthracite", "Антрацит", (0.06, 0.12, 0.94, 0.88), True),
    ("wpc-nadvoresen-001.jpg", "terracotta", "Теракота", (0.10, 0.20, 0.90, 0.80), True),
    ("wpc-nadvoresen-002.jpg", "light-oak", "Светол даб", (0.12, 0.20, 0.88, 0.80), True),
    ("pu-kamen-1.jpg", "stone-grey", "Сив камен", (0.36, 0.10, 0.64, 0.90), False),
    ("pu-kamen-2.jpg", "stone-white", "Бел камен", (0.34, 0.12, 0.66, 0.88), False),
]


def slat_pitch(im: Image.Image) -> int | None:
    """Horizontal period of the slats, in pixels, by auto-correlation.

    Returns None when nothing periodic stands out - a stone texture has no
    pitch, and pretending it does would crop it to a meaningless width.
    """
    g = im.convert("L")
    w, h = g.size
    px = g.load()
    col = [sum(px[x, y] for y in range(0, h, max(1, h // 120))) for x in range(w)]
    mean = sum(col) / len(col)
    col = [c - mean for c in col]

    # Two things the first version got wrong, and both produced a 7-pixel
    # "slat": the score was divided by a FIXED norm, so short lags won simply
    # by having more terms to add up, and the search started at w/60, which on
    # an 800px photo is a 13px period - JPEG noise, not a plank.
    #
    # Normalise per sample, and bound the search by how many slats a panel
    # photographed straight on can plausibly show: between 2 and 24.
    best, best_score = None, 0.0
    lo, hi = max(12, w // 24), max(16, w // 2)
    for p in range(lo, hi):
        n = w - p
        if n < w // 4:
            break
        num = sum(col[i] * col[i + p] for i in range(n)) / n
        den = (sum(c * c for c in col[:n]) / n) or 1.0
        s = num / den
        if s > best_score:
            best_score, best = s, p
    # a flat surface auto-correlates weakly at every lag; demand a real peak
    if best is None or best_score <= 0.30:
        return None

    # HARMONICS. A pattern with period 50 also correlates strongly at 100, 150,
    # 200 - and the peak picker happily returns one of those. That is what
    # happened here: the oak tile was cut at 160px and called five slats, when
    # the real slat is about 50px and the tile holds sixteen. Everything
    # downstream then believed a panel had five slats when the picture drew
    # thirteen, so the "slats per panel" control had almost nothing to crop.
    #
    # So walk down the divisors and take the SMALLEST period that still scores
    # within a whisker of the best. That is the fundamental.
    def score(p: int) -> float:
        n = w - p
        if n < w // 4:
            return 0.0
        num = sum(col[i] * col[i + p] for i in range(n)) / n
        den = (sum(c * c for c in col[:n]) / n) or 1.0
        return num / den

    fundamental = best
    for div in range(2, 13):
        cand = round(best / div)
        if cand < max(8, w // 200):
            break
        if score(cand) >= best_score * 0.80:
            fundamental = cand
    return fundamental


def make(job) -> dict | None:
    name, tid, label, box, slatted = job
    src = SRC / name
    if not src.exists():
        print(f"  !! missing {name}")
        return None
    im = Image.open(src).convert("RGB")
    w, h = im.size
    x0, y0, x1, y1 = (int(box[0] * w), int(box[1] * h), int(box[2] * w), int(box[3] * h))
    crop = im.crop((x0, y0, x1, y1))

    repeats = 1
    if slatted:
        p = slat_pitch(crop)
        if p:
            # as many whole periods as fit, so the tile is wide enough to keep
            # the natural variation between slats instead of one cloned slat
            repeats = max(1, min(8, crop.width // p))
            crop = crop.crop((0, 0, p * repeats, crop.height))
            print(f"  {tid}: pitch {p}px x {repeats} = {crop.width}px tile")
        else:
            print(f"  {tid}: no clear pitch, using the crop as-is")
    else:
        # stone has no period - mirror it so the left and right edges match
        mirror = crop.transpose(Image.FLIP_LEFT_RIGHT)
        both = Image.new("RGB", (crop.width * 2, crop.height))
        both.paste(crop, (0, 0)); both.paste(mirror, (crop.width, 0))
        crop = both
        print(f"  {tid}: mirrored to {crop.width}px")

    # keep it small - this is repeated across a wall, not viewed on its own
    target_h = 420
    if crop.height > target_h:
        crop = crop.resize((max(8, round(crop.width * target_h / crop.height)), target_h),
                           Image.LANCZOS)
    OUT.mkdir(parents=True, exist_ok=True)
    dest = OUT / f"{tid}.jpg"
    crop.save(dest, quality=88, optimize=True)

    # Check the claim before writing it down: count the dark grooves actually
    # in the tile and compare with `repeats`. A manifest that says five when
    # the file holds sixteen is how this went wrong the first time.
    if slatted:
        g = crop.convert("L")
        row = [g.getpixel((x, g.height // 2)) for x in range(g.width)]
        mn, mx = min(row), max(row)
        cut = mn + (mx - mn) * 0.45
        n, dip = 0, False
        for v in row:
            if v < cut and not dip:
                n, dip = n + 1, True
            elif v >= cut:
                dip = False
        if abs(n - repeats) > max(1, repeats * 0.25):
            print(f"     WARNING {tid}: tile holds {n} grooves but repeats says {repeats}")
            repeats = n

    st = ImageStat.Stat(crop)
    avg = tuple(round(c) for c in st.mean)
    return {"id": tid, "name": label, "file": f"/textures/{tid}.jpg",
            "repeats": repeats, "avg": "#%02x%02x%02x" % avg,
            "w": crop.width, "h": crop.height, "source": name}


def main() -> None:
    made = [m for m in (make(j) for j in JOBS) if m]
    if len(made) != len(JOBS):
        sys.exit(f"only {len(made)} of {len(JOBS)} textures were built - not writing a "
                 f"partial manifest that the site would silently render without")
    (OUT / "manifest.json").write_text(json.dumps(made, ensure_ascii=False, indent=2),
                                       encoding="utf-8")
    print(f"\n{len(made)} textures -> {OUT}")


if __name__ == "__main__":
    main()
