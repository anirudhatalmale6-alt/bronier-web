/**
 * The panel texture, drawn rather than downloaded.
 *
 * One function serves both visualizers, so the flat wall preview and the
 * photo overlay can never show different materials for the same choice.
 *
 * It is generated at the product's REAL panel width, so a 16,8 cm slat drawn
 * across a 4,2 m wall gives 25 slats and not "about that many". When his own
 * photography arrives this is the single place an image replaces a drawing.
 */
import type { Colour } from './products'

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
  const w = Math.min(4096, Math.max(64, Math.round(across * pxPerPanel)))
  const h = Math.min(4096, Math.max(64, Math.round(down * pxPerPanel * 3)))
  const cv = document.createElement('canvas')
  cv.width = w
  cv.height = h
  const g = cv.getContext('2d')!

  g.fillStyle = colour.hex
  g.fillRect(0, 0, w, h)

  // wood grain along the length of the panel
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
      // the groove between two slats, then the light catching the next edge
      g.fillStyle = 'rgba(0,0,0,0.42)'
      g.fillRect(x - step * 0.055, 0, step * 0.11, h)
      g.fillStyle = 'rgba(255,255,255,0.16)'
      g.fillRect(x + step * 0.055, 0, step * 0.045, h)
    }
    // butt joints where one panel ends and the next begins
    const vstep = h / down
    for (let j = 1; j < down; j++) {
      g.fillStyle = 'rgba(0,0,0,0.28)'
      g.fillRect(0, j * vstep - 1, w, 2)
    }
  }
  return cv
}
