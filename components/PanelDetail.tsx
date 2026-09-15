'use client'
import { useEffect, useRef, useState } from 'react'
import type { Colour } from '@/lib/products'
import { panelTexture, preloadTextures } from '@/lib/texture'
import { L } from '@/lib/i18n'

/**
 * ONE panel, drawn large, with its real dimensions on it.
 *
 * Why this exists. The wall preview is drawn to scale, and that is the right
 * thing for a wall - but it means a 0,50 m wall is about sixty pixels wide on
 * screen, and three 16,8 cm pieces inside sixty pixels are not three pieces,
 * they are a smudge. No line weight fixes that; there are not enough pixels.
 * His words: "the pieces are 16,9 x 290 cm, here you can't make it small".
 *
 * So the piece gets its own drawing at a size that can actually show it,
 * independent of how big the wall is. The wall answers "how many"; this
 * answers "what is one".
 *
 * It is drawn from the same texture engine as everything else, so the finish
 * here is the finish on the wall.
 */
export function PanelDetail({
  panelWidth, panelLength, colour, slatsPerPanel,
}: {
  panelWidth: number
  panelLength: number
  colour: Colour
  slatsPerPanel?: number
}) {
  const ref = useRef<HTMLCanvasElement>(null)
  const [tick, setTick] = useState(0)

  useEffect(() => {
    let live = true
    preloadTextures([colour]).then(() => { if (live) setTick((n) => n + 1) })
    return () => { live = false }
  }, [colour])

  useEffect(() => {
    const cv = ref.current
    if (!cv) return
    const dpr = Math.min(2, window.devicePixelRatio || 1)
    const cssW = cv.clientWidth
    const cssH = 132
    cv.width = Math.round(cssW * dpr)
    cv.height = Math.round(cssH * dpr)
    cv.style.height = cssH + 'px'
    const g = cv.getContext('2d')
    if (!g) return
    g.setTransform(dpr, 0, 0, dpr, 0, 0)
    g.clearRect(0, 0, cssW, cssH)
    g.fillStyle = '#f3f2f0'
    g.fillRect(0, 0, cssW, cssH)

    // The panel is shown LYING DOWN. Standing up, a 16,8 x 290 piece at any
    // useful width would be ten screens tall; on its side the whole piece fits
    // and the slats stay readable.
    const padX = 54
    const padY = 26
    const w = cssW - padX * 2
    const h = cssH - padY * 2

    const tex = panelTexture(colour, 1, 1, 64, false, slatsPerPanel)
    g.save()
    g.beginPath(); g.rect(padX, padY, w, h); g.clip()
    // rotate so the slats run across the short side, as they do on the real piece
    g.translate(padX, padY + h)
    g.rotate(-Math.PI / 2)
    g.drawImage(tex, 0, 0, h, w)
    g.restore()

    g.strokeStyle = 'rgba(0,0,0,0.35)'
    g.lineWidth = 1
    g.strokeRect(padX + 0.5, padY + 0.5, w - 1, h - 1)

    // dimensions, written on the piece
    g.fillStyle = '#141414'
    g.font = '600 12px system-ui, sans-serif'
    g.textAlign = 'center'
    g.fillText(`${(panelLength * 100).toFixed(0)} см`, padX + w / 2, padY - 9)
    g.save()
    g.translate(padX - 12, padY + h / 2)
    g.rotate(-Math.PI / 2)
    g.fillText(`${(panelWidth * 100).toFixed(1).replace('.', ',')} см`, 0, 0)
    g.restore()

    // end arrows, so the labels read as measurements and not as a caption
    g.strokeStyle = 'rgba(20,20,20,0.45)'
    g.beginPath()
    g.moveTo(padX, padY - 5); g.lineTo(padX, padY - 13)
    g.moveTo(padX + w, padY - 5); g.lineTo(padX + w, padY - 13)
    g.moveTo(padX, padY - 9); g.lineTo(padX + w, padY - 9)
    g.stroke()
  }, [panelWidth, panelLength, colour, slatsPerPanel, tick])

  return (
    <div>
      <div className="text-sm text-muted mb-1.5">{L.onePiece}</div>
      <canvas ref={ref} className="w-full rounded-lg border border-line block" />
    </div>
  )
}
