'use client'
import { useEffect, useRef, useState } from 'react'
import type { Colour, Orientation } from '@/lib/products'
import { panelTexture, preloadTextures } from '@/lib/texture'

/**
 * Draws the chosen product onto a wall at the customer's own measurements.
 *
 * The panels are drawn from the SAME numbers the calculator counts with, so
 * the picture and the quantity can never disagree - a visualizer that draws a
 * decorative approximation while the calculator counts something else is two
 * different answers to one question.
 *
 * Seams are real: each panel edge is where a panel edge would be. That is the
 * point of showing it, and a wall 4,20 m wide with a 16,8 cm panel shows 25
 * seams because it takes 25 panels.
 *
 * The material comes from lib/texture.ts - his own product photograph where
 * there is one, a drawn approximation where there is not. Shared with the
 * photo-upload visualizer so one swatch cannot mean two different things.
 */
export function WallVisualizer({
  wallWidth, wallHeight, panelWidth, panelLength, orientation, colour,
  showSeams = true, slatsPerPanel, seamless = false,
}: {
  wallWidth: number
  wallHeight: number
  panelWidth: number
  panelLength: number
  orientation: Orientation
  colour: Colour
  showSeams?: boolean
  slatsPerPanel?: number
  /** PU stone: torn interlocking edges, so no joint is ever visible */
  seamless?: boolean
}) {
  const ref = useRef<HTMLCanvasElement>(null)
  const [texTick, setTexTick] = useState(0)

  // the flat preview and the photo overlay share one material engine, so the
  // swatch a customer picks looks the same in both
  useEffect(() => {
    let live = true
    preloadTextures([colour]).then(() => { if (live) setTexTick((n) => n + 1) })
    return () => { live = false }
  }, [colour])

  useEffect(() => {
    const cv = ref.current
    if (!cv) return
    const dpr = Math.min(2, window.devicePixelRatio || 1)
    const cssW = cv.clientWidth
    const cssH = Math.round(cssW * 0.62)
    cv.width = Math.round(cssW * dpr)
    cv.height = Math.round(cssH * dpr)
    cv.style.height = cssH + 'px'
    const g = cv.getContext('2d')
    if (!g) return
    g.setTransform(dpr, 0, 0, dpr, 0, 0)
    g.clearRect(0, 0, cssW, cssH)

    const W = Math.max(0.1, wallWidth)
    const H = Math.max(0.1, wallHeight)

    // Fit the wall into the canvas with room for the floor and a margin.
    const pad = 26
    const floor = 34
    const availW = cssW - pad * 2
    const availH = cssH - pad - floor
    const scale = Math.min(availW / W, availH / H)
    const wpx = W * scale
    const hpx = H * scale
    const x0 = (cssW - wpx) / 2
    const y0 = cssH - floor - hpx

    // room behind the wall
    g.fillStyle = '#f3f2f0'
    g.fillRect(0, 0, cssW, cssH)
    g.fillStyle = '#e7e5e2'
    g.fillRect(0, cssH - floor, cssW, floor)

    g.save()
    g.beginPath()
    g.rect(x0, y0, wpx, hpx)
    g.clip()

    // base coat: his own product photograph where there is one, tiled at the
    // real panel width, otherwise the drawn fallback
    // seams=false: the joints are drawn on the canvas below, at final scale
    const tex = panelTexture(colour, W / panelWidth, Math.max(1, H / panelLength),
                             64, false, slatsPerPanel, W / H)
    if (orientation === 'vertical') {
      g.drawImage(tex, x0, y0, wpx, hpx)
    } else {
      // lying down: rotate the material rather than re-generating it
      g.save()
      g.translate(x0, y0 + hpx)
      g.rotate(-Math.PI / 2)
      g.drawImage(tex, 0, 0, hpx, wpx)
      g.restore()
    }

    // THE PANEL JOINTS, drawn here at final scale rather than inside the
    // texture.
    //
    // They used to live in the texture, which is then scaled down to fit the
    // canvas - on a 0,50 m wall that is a 768px image squeezed into 60px, and
    // the joints disappeared with it. The wall showed a field of identical
    // stripes and you could not see that it was three pieces of 16,8 cm. His
    // words: "here you can't make it small".
    //
    // Drawn on the canvas they stay one crisp line at any wall size, and their
    // count is exactly what the calculator sells.
    const stepPx = panelWidth * scale
    const lengthPx = panelLength * scale
    if (showSeams && !seamless) {
      // The joint has to beat the photo's OWN grooves, which are already
      // near-black and about 5px wide. A 1,4px dark line among them is
      // invisible - which is why the wall read as one striped field instead of
      // 25 pieces. A light lip against a deep line reads as an edge at any
      // size, the way a real butt joint catches the light.
      const jw = Math.max(2.5, Math.min(6, stepPx * 0.11))
      const deep = 'rgba(0,0,0,0.80)'
      const lip = 'rgba(255,255,255,0.55)'
      if (orientation === 'vertical') {
        for (let i = 1; i * stepPx < wpx - 0.5; i++) {
          const x = x0 + i * stepPx
          g.fillStyle = lip; g.fillRect(x - jw / 2 - jw * 0.5, y0, jw * 0.5, hpx)
          g.fillStyle = deep; g.fillRect(x - jw / 2, y0, jw, hpx)
        }
        for (let j = 1; j * lengthPx < hpx - 0.5; j++) {
          const y = y0 + j * lengthPx
          g.fillStyle = deep; g.fillRect(x0, y - jw / 2, wpx, jw)
        }
      } else {
        for (let i = 1; i * stepPx < hpx - 0.5; i++) {
          const y = y0 + i * stepPx
          g.fillStyle = lip; g.fillRect(x0, y - jw / 2 - jw * 0.5, wpx, jw * 0.5)
          g.fillStyle = deep; g.fillRect(x0, y - jw / 2, wpx, jw)
        }
        for (let j = 1; j * lengthPx < wpx - 0.5; j++) {
          const x = x0 + j * lengthPx
          g.fillStyle = deep; g.fillRect(x - jw / 2, y0, jw, hpx)
        }
      }
    }

    // a soft light from the left, so it reads as a room and not a swatch
    const grad = g.createLinearGradient(x0, 0, x0 + wpx, 0)
    grad.addColorStop(0, 'rgba(255,255,255,0.16)')
    grad.addColorStop(0.45, 'rgba(255,255,255,0)')
    grad.addColorStop(1, 'rgba(0,0,0,0.13)')
    g.fillStyle = grad
    g.fillRect(x0, y0, wpx, hpx)
    g.restore()

    // wall outline + a human figure for scale, which is the thing that makes
    // "2,7 m high" mean something
    g.strokeStyle = 'rgba(0,0,0,0.18)'
    g.lineWidth = 1
    g.strokeRect(x0 + 0.5, y0 + 0.5, wpx - 1, hpx - 1)

    const manH = 1.7 * scale
    if (manH > 24 && x0 + wpx + 14 < cssW) {
      const mx = Math.min(cssW - 16, x0 + wpx + 16)
      const my = cssH - floor
      g.fillStyle = 'rgba(20,20,20,0.22)'
      g.beginPath(); g.arc(mx, my - manH + manH * 0.08, manH * 0.075, 0, Math.PI * 2); g.fill()
      g.fillRect(mx - manH * 0.06, my - manH * 0.83, manH * 0.12, manH * 0.5)
      g.fillRect(mx - manH * 0.05, my - manH * 0.36, manH * 0.04, manH * 0.36)
      g.fillRect(mx + manH * 0.01, my - manH * 0.36, manH * 0.04, manH * 0.36)
    }

    // dimension labels
    g.fillStyle = '#6b6b6b'
    g.font = '12px system-ui, sans-serif'
    g.textAlign = 'center'
    g.fillText(`${W.toFixed(2).replace('.', ',')} m`, x0 + wpx / 2, cssH - floor + 21)
    g.save()
    g.translate(Math.max(11, x0 - 9), y0 + hpx / 2)
    g.rotate(-Math.PI / 2)
    g.fillText(`${H.toFixed(2).replace('.', ',')} m`, 0, 0)
    g.restore()
  }, [wallWidth, wallHeight, panelWidth, panelLength, orientation, colour, showSeams,
      slatsPerPanel, seamless, texTick])

  return (
    <div className="w-full">
      <canvas ref={ref} className="w-full rounded-lg border border-line block" />
    </div>
  )
}
