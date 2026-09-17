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
    // photograph twenty-one times, and the repeat became the pattern. The
    // panel count is a calculation; it does not have to be a drawing. So the
    // stone repeats every third panel instead, which on the same wall is seven
    // times fewer.
    const tilesAcross = seams ? across : Math.max(1, Math.round(across / 3))
    const tilesDown = seams ? down : Math.max(1, Math.round(down / 2))
    const per = Math.max(24, Math.min(512, Math.round(4096 / tilesAcross)))
    cv.width = Math.min(4096, Math.max(64, tilesAcross * per))
    // Tile DOWN as well as across. Stretching one tile over the whole height
    // was fine for a slat panel, which is 2,90 m in one piece and genuinely
    // uniform down its length - but PU stone is 60 x 120 cm, so a 2,70 m wall
    // is three courses, and one stone smeared over the lot looked like rain.
    const rowPx = Math.max(24, Math.round(per * 2.4 * (photo.height / photo.width)))
    cv.height = Math.min(4096, Math.max(64, rowPx * tilesDown))
    const g = cv.getContext('2d')!
    for (let j = 0; j < tilesDown; j++) {
      for (let i = 0; i < tilesAcross; i++) {
        // STAGGER the rows, do not mirror them.
        //
        // Mirroring was worse than the problem it fixed. Flipping a tile makes
        // its edge match its neighbour exactly, which the eye reads as a
        // butterfly - the stone wall came out as a column of symmetrical
        // kaleidoscope patterns, more obviously artificial than plain repeats.
        //
        // A half-tile horizontal offset on alternate rows is how real stone is
        // laid, introduces no symmetry, and moves the joins out of line.
        const offset = seams ? 0 : (j % 2) * (per / 2)
        g.drawImage(photo, 0, 0, srcW, photo.height,
                    i * per - offset, j * rowPx, per, rowPx)
        // the stagger leaves a gap at the row start; fill it with the tile end
        if (offset && i === 0) {
          g.drawImage(photo, 0, 0, srcW, photo.height,
                      tilesAcross * per - offset, j * rowPx, per, rowPx)
        }
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
