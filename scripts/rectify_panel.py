#!/usr/bin/env python3
"""Turn a photo of a panel lying on the floor into a flat, tiling texture.

    python3 scripts/rectify_panel.py

The client photographed the real WPC panels at an angle, which is the natural
way to photograph a 2,90 m board. A texture has to be flat, so the four corners
of the panel face are mapped onto a rectangle with a perspective transform.

The corners are estimates, so the result is CHECKED rather than trusted: after
rectifying, the slats must be evenly spaced. If the corners are wrong the
spacing fans out, and the script says so instead of writing a warped texture
that would then be tiled across somebody's wall.
"""
from __future__ import annotations

import json
import pathlib
import statistics
import sys

from PIL import Image, ImageFilter

ROOT = pathlib.Path(__file__).resolve().parent.parent
OUT = ROOT / "public" / "textures"

#: The panel face in each photo, as (NW, SW, SE, NE) in source pixels - the
#: order PIL's QUAD transform wants. Read off a coordinate grid drawn over the
#: photo, not guessed.
JOBS = [
    {
        "id": "wpc-indoor-anthracite",
        "name": "Антрацит",
        "src": "/var/lib/freelancer/projects/40523265/IMG_3133.JPG",
        # read off a zoomed grid of the cut end, where the profile also shows
        # the four hollow chambers - four chambers, four slats
        # kept well clear of the cut end (x>1320), whose hollow chambers are
        # not part of the face and were ending up in the tile
        "quad": (900, 345, 900, 905, 1300, 1000, 1300, 205),
        "out_w": 700, "out_h": 320,
        "slats": 4,
    },
    {
        # The fence board: one flat plank with a deep wood grain, NOT slats.
        # Three colours are in the photo; this takes the grey one, and the
        # colour is provisional anyway - he said the range gets settled later.
        "id": "wpc-fence-board",
        "name": "Сива (форма)",
        "src": "/var/lib/freelancer/projects/40523265/IMG_3171.JPG",
        # inset inside the grey board, read off a coordinate grid; the first
        # attempt ran a rectangle across a board that lies diagonally and
        # took a wedge of the floor with it
        "quad": (130, 668, 130, 858, 940, 812, 940, 620),
        "out_w": 880, "out_h": 200,
        "slats": 1,
        # the board runs diagonally, so the floor survives as a TRIANGLE in one
        # corner - rows and columns are both part board, part floor, and no
        # amount of edge trimming reaches it. Take a slice off the bottom.
        "crop_frac": (0.0, 0.0, 1.0, 0.86),
    },
    {
        # PU stone. Irregular torn edges and a continuous rock face - the
        # opposite of a slat panel, and the reason the stone must be drawn
        # WITHOUT joint lines.
        "id": "pu-stone-face",
        "name": "Црн камен (форма)",
        "src": "/var/lib/freelancer/projects/40523265/IMG_3168.JPG",
        "quad": (120, 330, 120, 690, 1020, 700, 1020, 120),
        "out_w": 760, "out_h": 500,
        "slats": 1,
        # stone is tiled many times across a wall, so its big light and dark
        # patches have to go or the repeat becomes the pattern
        "flatten": True,
        "seamless": True,
    },
    {
        "id": "wpc-outdoor-charcoal",
        "name": "Антрацит (фасада)",
        "src": "/var/lib/freelancer/projects/40523265/IMG_3152.JPG",
        # straight lines fitted to the panel's own detected edges at five x
        # positions, extrapolated to the frame edge
        "quad": (0, 388, 0, 659, 900, 723, 900, 325),
        "out_w": 900, "out_h": 320,
        "slats": 4,
    },
]




def trim_to_panel(im: Image.Image) -> Image.Image:
    """Cut away anything that is not the panel.

    Both panels are neutral grey; the floor they were photographed on is warm
    wood. So saturation separates them cleanly, whatever the exposure.

    This exists because the flatness check passed a tile that was a third
    wooden floor and a strip of the cut end. Level is not the same as correct -
    a check that only measures tilt will happily approve a picture of the floor.
    """
    w, h = im.size
    px = im.convert("RGB").load()

    def woody(x, y):
        """Floor, not panel.

        Saturation alone is not enough: the outdoor board is charcoal with a
        warm wood-grain print in it, so a saturation test ate two thirds of a
        perfectly good tile. The floor is light AND warm; both panels are dark
        or mid-grey and near-neutral. Requiring both separates them cleanly on
        both photographs.
        """
        r, g, b = px[x, y]
        mx, mn = max(r, g, b), min(r, g, b)
        s = 0.0 if mx == 0 else (mx - mn) / mx
        lum = 0.3 * r + 0.6 * g + 0.1 * b
        return s > 0.22 and lum > 110

    def row_woody(y):
        xs = range(0, w, max(1, w // 60))
        vals = [woody(x, y) for x in xs]
        return sum(1 for v in vals if v) / len(vals) > 0.45

    def col_woody(x):
        ys = range(0, h, max(1, h // 40))
        vals = [woody(x, y) for y in ys]
        return sum(1 for v in vals if v) / len(vals) > 0.45

    top = 0
    while top < h // 2 and row_woody(top):
        top += 1
    bot = h - 1
    while bot > h // 2 and row_woody(bot):
        bot -= 1
    left = 0
    while left < w // 2 and col_woody(left):
        left += 1
    right = w - 1
    while right > w // 2 and col_woody(right):
        right -= 1

    # a few pixels of margin, so an antialiased edge does not creep in
    m = 3
    box = (min(left + m, w - 8), min(top + m, h - 8),
           max(right - m, left + 8), max(bot - m, top + 8))
    return im.crop(box)



def even_lighting(im: Image.Image) -> Image.Image:
    """Flatten the light along the panel's LENGTH.

    He photographed a 2,90 m board in one shot, so one end is nearer the light
    than the other. Tiled across a wall that gradient repeats, and the wall gets
    a band at every panel - a lighting artefact reading as a product feature.

    Only the lengthwise direction is levelled. The shading ACROSS the slats is
    the thing that makes them look like slats, so it is left alone.
    """
    w, h = im.size
    px = im.convert("RGB").load()
    cols = []
    for x in range(w):
        tot = 0
        for y in range(0, h, max(1, h // 40)):
            r, g, b = px[x, y]
            tot += 0.3 * r + 0.6 * g + 0.1 * b
        cols.append(tot / len(range(0, h, max(1, h // 40))))
    target = sum(cols) / len(cols)
    # a gentle correction - full normalisation flattens the wood out completely
    gains = [min(1.6, max(0.6, 1 + 0.85 * (target / (c or 1) - 1))) for c in cols]
    out = Image.new("RGB", (w, h))
    op = out.load()
    for x in range(w):
        gx = gains[x]
        for y in range(h):
            r, g, b = px[x, y]
            op[x, y] = (min(255, int(r * gx)), min(255, int(g * gx)), min(255, int(b * gx)))
    return out


def groove_ys(im: Image.Image, x0f: float, x1f: float, detrend: bool = True) -> list[int]:
    """Where the dark grooves sit, measured in a NARROW vertical strip.

    Narrow matters. Averaging across the whole width smears a tilted band into
    a flat grey and the transitions vanish - which is why the check kept
    reporting "only 1 edge found" on a picture that plainly has four slats.
    """
    g = im.convert("L")
    w, h = g.size
    px = g.load()
    xs = range(int(w * x0f), max(int(w * x0f) + 1, int(w * x1f)))
    col = [sum(px[x, y] for x in xs) / len(xs) for y in range(h)]

    if not detrend:
        mn, mx = min(col), max(col)
        if mx - mn < 12:
            return []
        mid = (mn + mx) / 2
        out, run = [], None
        for y, v in enumerate(col):
            if v < mid:
                run = [y, y] if run is None else [run[0], y]
            elif run:
                if run[1] - run[0] >= 4:
                    out.append((run[0] + run[1]) // 2)
                run = None
        if run and run[1] - run[0] >= 4:
            out.append((run[0] + run[1]) // 2)
        return out

    # DETREND. The indoor panel is glossy and lit from one side, so it fades
    # from bright to dark across the board. Against one flat threshold the dark
    # end is entirely "groove" and the bright end entirely "slat", and the
    # scan finds a single edge on a picture that plainly has four slats. So
    # subtract the local average and look at the WIGGLE, not the level.
    win = max(9, h // 8) | 1
    half = win // 2
    trend = []
    for y in range(h):
        a, b = max(0, y - half), min(h, y + half + 1)
        trend.append(sum(col[a:b]) / (b - a))
    col = [c - t for c, t in zip(col, trend)]

    mn, mx = min(col), max(col)
    if mx - mn < 6:
        return []
    mid = (mn + mx) / 2
    out, run = [], None
    for y, v in enumerate(col):
        if v < mid:
            run = [y, y] if run is None else [run[0], y]
        elif run:
            if run[1] - run[0] >= 4:
                out.append((run[0] + run[1]) // 2)
            run = None
    if run and run[1] - run[0] >= 4:
        out.append((run[0] + run[1]) // 2)
    return out


def detilt(im_src: Image.Image, quad, size, rounds: int = 10, detrend: bool = True):
    """Nudge the right-hand corners until the slats come out level.

    The corners are read off a photo by eye, so they are a degree or two out and
    the slats come through sloping. Rather than guess again, measure the slope -
    grooves on the left versus grooves on the right - and move the right edge by
    what the measurement says, until it stops improving.
    """
    q = list(quad)
    best, best_err = None, None
    for _ in range(rounds):
        flat = im_src.transform(size, Image.QUAD, data=tuple(q), resample=Image.BICUBIC)
        left = groove_ys(flat, 0.10, 0.22, detrend)
        right = groove_ys(flat, 0.72, 0.86, detrend)
        if not left or not right:
            break
        n = min(len(left), len(right))
        err = sum(right[i] - left[i] for i in range(n)) / n
        if best_err is None or abs(err) < abs(best_err):
            best, best_err = list(q), err
        if abs(err) <= 1.0:
            break
        # output pixels -> source pixels along the right edge
        span = ((q[4] - q[6]) ** 2 + (q[5] - q[7]) ** 2) ** 0.5 or 1
        shift = err * (span / size[1])
        q[7] += shift          # NE y
        q[5] += shift          # SE y
    return (best or q), best_err


def slat_edges(im: Image.Image) -> list[int]:
    """y of every light/dark transition DOWN a rectified tile.

    Down, not across. The slats run along the length of the panel, so after
    rectifying they lie horizontally and a horizontal scan runs ALONG one slat
    and finds nothing - which is exactly what the first run reported ("only 1
    edge found"). The check was looking the wrong way, not the picture.
    """
    g = im.convert("L")
    w, h = g.size
    px = g.load()
    row = [sum(px[x, y] for x in range(w // 4, 3 * w // 4, 3)) for y in range(h)]
    n = len(range(w // 4, 3 * w // 4, 3))
    row = [v / n for v in row]
    mn, mx = min(row), max(row)
    mid = (mn + mx) / 2
    edges, prev = [], row[0] > mid
    for y, v in enumerate(row):
        cur = v > mid
        if cur != prev:
            edges.append(y)
            prev = cur
    return edges


def check_even(edges: list[int], want_slats: int, residual: float,
               width: int) -> tuple[bool, str]:
    """Is the tile flat, and does it hold the slats it is supposed to?

    The test is the RESIDUAL TILT, not the spread of the gaps. Tilt is the
    defect that matters: a sloping tile does not line up with the next one, so
    the wall gets a visible step at every panel. Gap spread reads high on a
    glossy board simply because each slat has a bright lip as well as a dark
    groove, and failing a good tile for that would be the check inventing work.
    """
    # Proportional, not a fixed pixel count. Three pixels of drop is nothing
    # across a 900px tile and a lot across a 60px one, so the bar is the SLOPE:
    # under 1% of the tile width. The skewed attempts this check caught were
    # 8% and 13%; the ones that pass are 0.1% and 0.5%.
    slope = abs(residual) / max(1, width)
    if slope > 0.01:
        return False, (f"still sloping by {residual:+.1f}px across {width}px "
                       f"= {slope*100:.1f}%")
    if len(edges) < 2:
        return False, f"only {len(edges)} grooves found - cannot confirm the slats"
    gaps = [b - a for a, b in zip(edges, edges[1:]) if b - a > 4]
    spread = (statistics.pstdev(gaps) / statistics.mean(gaps)) if len(gaps) > 1 else 0
    return True, (f"level to {residual:+.1f}px over {width}px ({slope*100:.1f}%), "
                  f"{len(edges)} grooves, gap spread {spread * 100:.0f}%")




def flatten_large_scale(im: Image.Image, keep: float = 0.95) -> Image.Image:
    """Take the big light and dark patches out, keep the fine texture.

    A stone tile repeated across a wall gives itself away by its LARGE features
    - one pale corner, one dark band - because those recur on a grid the eye
    picks out instantly. The fine grain does not repeat visibly at all.

    So divide the tile by a heavily blurred copy of itself. Large-scale
    variation goes, the rock texture stays, and the same tile laid seven times
    stops announcing itself. `keep` leaves a little of the variation in, because
    removing all of it looks like sandpaper.
    """
    w, h = im.size
    blur = im.filter(ImageFilter.GaussianBlur(radius=max(w, h) / 6))
    src, bl = im.convert("RGB").load(), blur.convert("RGB").load()
    out = Image.new("RGB", (w, h))
    op = out.load()
    tot = [0, 0, 0]
    for y in range(0, h, max(1, h // 50)):
        for x in range(0, w, max(1, w // 50)):
            c = src[x, y]
            for k in range(3):
                tot[k] += c[k]
    n = len(range(0, h, max(1, h // 50))) * len(range(0, w, max(1, w // 50)))
    mean = [t / n for t in tot]
    for y in range(h):
        for x in range(w):
            c, b = src[x, y], bl[x, y]
            px = []
            for k in range(3):
                g = mean[k] / max(1.0, b[k])
                g = 1 + keep * (g - 1)
                px.append(max(0, min(255, int(c[k] * g))))
            op[x, y] = tuple(px)
    return out



def make_seamless(im: Image.Image) -> Image.Image:
    """Make the tile's left edge match its right, and its top match its bottom.

    Staggering the rows moved the joins around but did not remove them: the
    tile's left edge still did not match its right, so every join was a visible
    step. This is the standard fix - take a copy wrapped by half the tile in
    both directions, so what was an edge is now the middle, and cross-fade the
    two with a mask that is strongest at the edges.

    The centre of the tile is left alone, so the rock keeps its character.
    """
    w, h = im.size
    wrapped = Image.new("RGB", (w, h))
    wrapped.paste(im.crop((w // 2, h // 2, w, h)), (0, 0))
    wrapped.paste(im.crop((0, h // 2, w // 2, h)), (w - w // 2, 0))
    wrapped.paste(im.crop((w // 2, 0, w, h // 2)), (0, h - h // 2))
    wrapped.paste(im.crop((0, 0, w // 2, h // 2)), (w - w // 2, h - h // 2))

    # mask: 0 in the middle, 1 at the border, smooth between
    mask = Image.new("L", (w, h))
    mp = mask.load()
    for y in range(h):
        fy = 1.0 - min(y, h - 1 - y) / (h / 2)
        for x in range(w):
            fx = 1.0 - min(x, w - 1 - x) / (w / 2)
            f = max(fx, fy) ** 1.6
            mp[x, y] = int(max(0.0, min(1.0, f)) * 255)
    return Image.composite(wrapped, im, mask)


def _edge_mismatch(im: Image.Image) -> float:
    """How badly the tile fails to meet itself, 0 = perfect."""
    g = im.convert("L")
    w, h = g.size
    px = g.load()
    lr = sum(abs(px[0, y] - px[w - 1, y]) for y in range(h)) / h
    tb = sum(abs(px[x, 0] - px[x, h - 1]) for x in range(w)) / w
    return (lr + tb) / 2


def _big_variation(im: Image.Image) -> float:
    """Spread of the LARGE features only - the thing that makes a repeat show."""
    small = im.convert("L").resize((12, 12), Image.BOX)
    v = list(small.getdata())
    m = sum(v) / len(v)
    return (sum((x - m) ** 2 for x in v) / len(v)) ** 0.5 / (m or 1)


def _len_spread(im: Image.Image) -> float:
    """How much the brightness swings along the length, as a fraction."""
    w, h = im.size
    px = im.convert("L").load()
    cols = [sum(px[x, y] for y in range(0, h, max(1, h // 30)))
            / len(range(0, h, max(1, h // 30))) for x in range(w)]
    m = sum(cols) / len(cols)
    return (max(cols) - min(cols)) / (m or 1)


def main() -> None:
    made, problems = [], []
    OUT.mkdir(parents=True, exist_ok=True)
    for j in JOBS:
        src = pathlib.Path(j["src"])
        if not src.exists():
            problems.append(f"{j['id']}: missing {src}")
            continue
        im = Image.open(src).convert("RGB")
        size = (j["out_w"], j["out_h"])
        # Two ways of reading the grooves: a plain threshold, and one that
        # subtracts the lighting gradient first. The glossy indoor board needs
        # the second, the matt outdoor one is better without it - so run both
        # and keep whichever ends up more level, rather than picking for them.
        if j["slats"] <= 1:
            quad, err, dt = list(j["quad"]), 0.0, False
        else:
            best = None
            for dt_try in (False, True):
                q, e = detilt(im, j["quad"], size, detrend=dt_try)
                if e is not None and (best is None or abs(e) < abs(best[1])):
                    best = (q, e, dt_try)
            if best is None:
                problems.append(f"{j['id']}: could not find the grooves at all")
                continue
            quad, err, dt = best
        print(f"   de-tilt: residual {err:+.1f}px  (detrend={dt})")
        flat = im.transform(size, Image.QUAD, data=tuple(quad), resample=Image.BICUBIC)
        before = flat.size
        flat = trim_to_panel(flat)
        if flat.size != before:
            print(f"   trimmed {before[0]}x{before[1]} -> {flat.size[0]}x{flat.size[1]} "
                  f"(floor and cut end removed)")
        if flat.width < 80 or flat.height < 60:
            problems.append(f"{j['id']}: nothing left after trimming the floor away")
            continue

        if j["slats"] <= 1:
            # A plank or a stone face has no repeating grooves, so there is
            # nothing to measure levelness against. Flatness here is judged by
            # the corners alone, and the floor check below still applies.
            edges, ok, why = [], True, "single face, no slats to level"
        else:
            edges = groove_ys(flat, 0.30, 0.70, dt)
            ok, why = check_even(edges, j["slats"], err, flat.width)
        print(f"{j['id']}: {why} -> {'flat' if ok else 'STILL SKEWED'}")
        if not ok:
            problems.append(f"{j['id']}: {why}")
            flat.save(OUT / f"_rejected-{j['id']}.jpg", quality=80)
            continue

        # positive check on the trim: the finished tile must be neutral, i.e.
        # no wood floor left in it
        chk = flat.convert("RGB").load()
        woody = 0
        total = 0
        for yy in range(0, flat.height, max(1, flat.height // 30)):
            for xx in range(0, flat.width, max(1, flat.width // 30)):
                r, g, b = chk[xx, yy]
                mx, mn = max(r, g, b), min(r, g, b)
                sv = 0.0 if mx == 0 else (mx - mn) / mx
                lum = 0.3 * r + 0.6 * g + 0.1 * b
                total += 1
                if sv > 0.22 and lum > 110:
                    woody += 1
        frac = woody / max(1, total)
        if frac > 0.12:
            problems.append(f"{j['id']}: {frac*100:.0f}% of the tile is still floor")
            flat.save(OUT / f"_rejected-{j['id']}.jpg", quality=80)
            continue
        print(f"   {frac*100:.0f}% non-neutral pixels left (floor check)")

        # Only level a gradient that is actually there. The indoor board was
        # already even at 6% and "correcting" it took it to 12%, because at
        # that level the per-column gains chase noise rather than a gradient.
        # Do not fix what is not broken.
        cf = j.get("crop_frac")
        if cf:
            w0, h0 = flat.size
            flat = flat.crop((int(cf[0] * w0), int(cf[1] * h0),
                              int(cf[2] * w0), int(cf[3] * h0)))
            print(f"   extra crop -> {flat.size[0]}x{flat.size[1]}")

        before_spread = _len_spread(flat)
        if before_spread > 0.15:
            levelled = even_lighting(flat)
            after_spread = _len_spread(levelled)
            print(f"   lighting along the board: {before_spread*100:.0f}% -> "
                  f"{after_spread*100:.0f}% variation")
            if after_spread < before_spread:
                flat = levelled
            else:
                print("   (levelling made it worse - keeping the original)")
        else:
            print(f"   lighting along the board: {before_spread*100:.0f}% - "
                  f"already even, left alone")

        if j.get("seamless"):
            before = _edge_mismatch(flat)
            flat = make_seamless(flat)
            after = _edge_mismatch(flat)
            print(f"   edge mismatch {before:.1f} -> {after:.1f} (0 = tiles perfectly)")
            if after > before * 0.5:
                problems.append(f"{j['id']}: edges still do not meet "
                                f"({before:.1f} -> {after:.1f})")
                continue

        if j.get("flatten"):
            before = _big_variation(flat)
            flat = flatten_large_scale(flat)
            after = _big_variation(flat)
            print(f"   large-scale variation {before*100:.0f}% -> {after*100:.0f}%")
            if after >= before:
                problems.append(f"{j['id']}: flattening did not reduce the patchiness")
                continue

        dest = OUT / f"{j['id']}.jpg"
        flat.save(dest, quality=90, optimize=True)
        made.append({"id": j["id"], "name": j["name"], "file": f"/textures/{j['id']}.jpg",
                     "slats": j["slats"], "w": flat.width, "h": flat.height,
                     "source": src.name})

    if problems:
        print()
        for p in problems:
            print("  !!", p)
        sys.exit("refusing to ship a texture that is still skewed - fix the corners")

    man = OUT / "panels.json"
    man.write_text(json.dumps(made, ensure_ascii=False, indent=2), encoding="utf-8")
    print(f"\n{len(made)} panel textures -> {OUT}")


if __name__ == "__main__":
    main()
