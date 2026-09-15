/**
 * The panel material, from his own product photographs where one exists and
 * drawn where one does not.
 *
 * One function serves both visualizers, so the flat wall preview and the photo
 * overlay can never show different materials for the same choice.
 *
 * SCALE, and the one assumption in it: a photo tile is laid down so that one
 * repeat spans ONE PANEL WIDTH. That makes the panel joints land in the right
 * places - 16,8 cm panels across a 4,2 m wall give 25 joints, which is what
 * the calculator counts - and it means the slats per panel are whatever his
 * photograph shows. If a tile turns out to be two panels wide rather than one,
 * the fix is one number in products.ts, not new code. Flagged to him.
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
): HTMLCanvasElement {
  const across = Math.max(1, Math.ceil(panelsAcross))
  const down = Math.max(1, Math.ceil(panelsDown))
  const cv = document.createElement('canvas')

  const photo = colour.texture ? cache.get(colour.texture) : undefined
  if (photo) {
    // One repeat of the photograph = one panel.
    const per = Math.max(24, Math.min(256, Math.round(4096 / across)))
    cv.width = Math.min(4096, Math.max(64, across * per))
    // Tile DOWN as well as across. Stretching one tile over the whole height
    // was fine for a slat panel, which is 2,90 m in one piece and genuinely
    // uniform down its length - but PU stone is 60 x 120 cm, so a 2,70 m wall
    // is three courses, and one stone smeared over the lot looked like rain.
    const rowPx = Math.max(24, Math.round(per * 2.4 * (photo.height / photo.width)))
    cv.height = Math.min(4096, Math.max(64, rowPx * down))
    const g = cv.getContext('2d')!
    for (let j = 0; j < down; j++) {
      for (let i = 0; i < across; i++) {
        g.drawImage(photo, i * per, j * rowPx, per, rowPx)
      }
    }
    if (seams && down > 1) {
      for (let j = 1; j < down; j++) {
        g.fillStyle = 'rgba(0,0,0,0.28)'
        g.fillRect(0, j * rowPx - 1, cv.width, 2)
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
