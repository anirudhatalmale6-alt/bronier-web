/**
 * The panel material, from his own product photographs where one exists and
 * drawn where one does not.
 *
 * One function serves both visualizers, so the flat wall preview and the photo
 * overlay can never show different materials for the same choice.
 *
 * SCALE - the thing that was wrong.
 *
 * The tile was laid down once per panel. A tile holds 5-8 slat periods, so a
 * 4,20 m wall drew about 200 strips while the calculator counted 25 pieces:
 * the panel was never visible as a panel, and no wall size made it look like
 * the 16,8 cm piece he sells. His words: "here you can't make it small".
 *
 * Now the photo is resampled so that exactly `slatsPerPanel` slats land inside
 * each panel width, and the joint BETWEEN panels is drawn on top. Both counts
 * are then true at once: the slats are slat-sized, and the joints are where
 * the calculator says the pieces meet.
 *
 * `slatsPerPanel` is an assumption (4 across 16,8 cm = a 4,2 cm slat) and is
 * labelled as one on screen until he confirms it.
 */
import type { Colour } from './products'

const cache = new Map<string, HTMLImageElement>()

/** Load every texture once, up front, so a swatch click redraws instantly. */
export function preloadTextures(colours: Colour[]): Promise<void> {
  const jobs = colours
    .map((c) => c.texture)
    .filter((u): u is string => !!u && !cache.has(u))
    .map((u) => new Promise<void>((done) => {
      const im = new Image()
      im.onload = () => { cache.set(u, im); done() }
      im.onerror = () => done()          // a missing file falls back to drawn
      im.src = u
    }))
  return Promise.all(jobs).then(() => undefined)
}

export function textureReady(c: Colour) {
  return !!c.texture && cache.has(c.texture)
}

export function panelTexture(
  colour: Colour,
  /** how many panels fit across the area being textured */
  panelsAcross: number,
  /** how many panel lengths fit down it */
  panelsDown: number,
  pxPerPanel = 64,
  seams = true,
  /** slats milled into one panel - see the note above */
  slatsPerPanel?: number,
  /** wall width / wall height, so a seamless tile is not distorted */
  wallAspect?: number,
): HTMLCanvasElement {
  const across = Math.max(1, Math.ceil(panelsAcross))
  const down = Math.max(1, Math.ceil(panelsDown))
  const cv = document.createElement('canvas')

  const photo = colour.texture ? cache.get(colour.texture) : undefined
  if (photo) {
    // How much of the tile is one panel's worth of slats. Whole periods only,
    // so the crop still tiles without a seam.
    const perTile = Math.max(1, colour.slatsPerTile ?? 1)
    const perPanel = Math.max(1, Math.min(perTile, slatsPerPanel ?? perTile))
    const srcW = Math.round(photo.width * (perPanel / perTile))
    // One repeat of the photograph = one panel.
    // HOW OFTEN THE PICTURE REPEATS.
    //
    // On a slat panel the repeat must be exactly one panel, because the joint
    // between panels is a real thing the customer will see.
    //
    // On a seamless material it must NOT be. PU stone has no visible joint, so
    // tying the picture to the 60 cm panel meant a 4,20 m wall showed the same
    // photograph twenty-one times, and the repeat became the pattern.
    const tilesAcross = seams ? across : Math.max(1, Math.round(across / 3))
    const per = Math.max(24, Math.min(512, Math.round(4096 / tilesAcross)))
    cv.width = Math.min(4096, Math.max(64, tilesAcross * per))

    // THE TILE MUST KEEP ITS OWN SHAPE.
    //
    // The old code set the row height from a fixed 2.4 factor. On a slat panel
    // that is harmless - a slat looks the same however it is stretched down its
    // length. On stone it was fatal: a landscape photograph of rock was being
    // squeezed into a portrait cell, so the wall came out looking like motion
    // blur rather than stone.
    //
    // So the tile is drawn at its OWN aspect ratio, and the number of rows is
    // whatever then fills a canvas shaped like the wall.
    const srcAspect = photo.width / photo.height
    let rowPx: number
    let tilesDown: number
    if (seams) {
      rowPx = Math.max(24, Math.round(per * 2.4 / srcAspect))
      tilesDown = down
    } else {
      rowPx = Math.max(24, Math.round(per / srcAspect))
      const wantH = cv.width / Math.max(0.2, wallAspect ?? (across / Math.max(1, down)))
      tilesDown = Math.max(1, Math.round(wantH / rowPx))
    }
    cv.height = Math.min(4096, Math.max(64, rowPx * tilesDown))

    const g = cv.getContext('2d')!
    for (let j = 0; j < tilesDown; j++) {
      // Half-tile offset on alternate rows, the way stone is actually laid.
      // Draw one column BEYOND each end rather than wrapping a copy round -
      // the wrap left a hard vertical seam straight down the middle of the
      // wall, which is the line he photographed and sent back.
      const offset = seams ? 0 : (j % 2) * (per / 2)
      for (let i = -1; i <= tilesAcross; i++) {
        g.drawImage(photo, 0, 0, srcW, photo.height,
                    i * per + offset, j * rowPx, per, rowPx)
      }
    }
    if (seams) {
      // the joint between two panels - deeper than the grooves between slats,
      // because it is where one piece ends and the next begins
      const jw = Math.max(1.5, per * 0.035)
      for (let i = 1; i < across; i++) {
        g.fillStyle = 'rgba(0,0,0,0.55)'
        g.fillRect(i * per - jw / 2, 0, jw, cv.height)
        g.fillStyle = 'rgba(255,255,255,0.10)'
        g.fillRect(i * per + jw / 2, 0, jw * 0.5, cv.height)
      }
      for (let j = 1; j < down; j++) {
        g.fillStyle = 'rgba(0,0,0,0.35)'
        g.fillRect(0, j * rowPx - 1, cv.width, 2.5)
      }
    }
    return cv
  }

  // ---- drawn fallback, for a finish he has not photographed yet -----------
  // (uses `across`/`down` directly - it has no photograph to keep square)
  const w = Math.min(4096, Math.max(64, Math.round(across * pxPerPanel)))
  const h = Math.min(4096, Math.max(64, Math.round(down * pxPerPanel * 3)))
  cv.width = w
  cv.height = h
  const g = cv.getContext('2d')!

  g.fillStyle = colour.hex
  g.fillRect(0, 0, w, h)
  g.strokeStyle = colour.grain
  for (let x = 0; x < w; x += 2) {
    g.globalAlpha = 0.06 + ((x * 37) % 11) / 90
    g.beginPath(); g.moveTo(x + 0.5, 0); g.lineTo(x + 0.5, h); g.stroke()
  }
  g.globalAlpha = 1

  if (seams) {
    const step = w / across
    for (let i = 0; i <= across; i++) {
      const x = i * step
      g.fillStyle = 'rgba(0,0,0,0.42)'
      g.fillRect(x - step * 0.055, 0, step * 0.11, h)
      g.fillStyle = 'rgba(255,255,255,0.16)'
      g.fillRect(x + step * 0.055, 0, step * 0.045, h)
    }
    const vstep = h / down
    for (let j = 1; j < down; j++) {
      g.fillStyle = 'rgba(0,0,0,0.28)'
      g.fillRect(0, j * vstep - 1, w, 2)
    }
  }
  return cv
}
