'use client'
import { useCallback, useEffect, useRef, useState } from 'react'
import type { Colour, Product } from '@/lib/products'
import { PRODUCTS } from '@/lib/products'
import { panelTexture, preloadTextures } from '@/lib/texture'
import { drawWarped, type Pt } from '@/lib/warp'
import { L } from '@/lib/i18n'
import { ColourPicker } from './ColourPicker'

/**
 * "I upload a real picture and it makes how it will look."
 *
 * The customer's own photograph, their own wall, marked by dragging four
 * corners. The panels are then mapped onto that quadrilateral with a proper
 * perspective transform, so on an angled wall the slats converge the way the
 * room does.
 *
 * Two things make it read as real rather than as a sticker:
 *   1. the shading of the original wall is kept. The photo's own light and
 *      shadow are multiplied back over the new material, so a dark corner
 *      stays a dark corner;
 *   2. the slat width comes from the wall width the customer types, so the
 *      panels are the size they would actually be - 16,8 cm on a 4,2 m wall is
 *      25 slats, and it looks like 25 slats.
 *
 * No AI, nothing uploaded anywhere: the photo never leaves the phone. The API
 * an image model would need can be dropped in later behind the same controls.
 */
export function RoomVisualizer({ initial }: { initial?: Product }) {
  const [product, setProduct] = useState<Product>(initial ?? PRODUCTS[0])
  const [colour, setColour] = useState<Colour>((initial ?? PRODUCTS[0]).colours[0])
  const [img, setImg] = useState<HTMLImageElement | null>(null)
  const [quad, setQuad] = useState<[Pt, Pt, Pt, Pt] | null>(null)
  const [wallWidth, setWallWidth] = useState(4.2)
  const [wallHeight, setWallHeight] = useState(2.7)
  const [blend, setBlend] = useState(0.62)
  const [showBefore, setShowBefore] = useState(false)
  const [drag, setDrag] = useState<number | null>(null)
  const [texTick, setTexTick] = useState(0)
  const cvRef = useRef<HTMLCanvasElement>(null)
  const wrapRef = useRef<HTMLDivElement>(null)

  // Load every photographed finish once, then force one repaint. Without the
  // repaint the first render draws the fallback and only corrects itself when
  // something else happens to change.
  useEffect(() => {
    let live = true
    preloadTextures(PRODUCTS.flatMap((p) => p.colours))
      .then(() => { if (live) setTexTick((t) => t + 1) })
    return () => { live = false }
  }, [])

  const onFile = useCallback((f: File) => {
    const url = URL.createObjectURL(f)
    const im = new Image()
    im.onload = () => {
      setImg(im)
      // start with a quad over the middle of the picture - most people photograph
      // the wall they mean, and dragging four handles beats drawing from nothing
      const w = im.width, h = im.height
      setQuad([
        { x: w * 0.18, y: h * 0.16 }, { x: w * 0.82, y: h * 0.16 },
        { x: w * 0.82, y: h * 0.80 }, { x: w * 0.18, y: h * 0.80 },
      ])
      URL.revokeObjectURL(url)
    }
    im.src = url
  }, [])

  // redraw whenever anything changes
  useEffect(() => {
    const cv = cvRef.current
    if (!cv || !img || !quad) return
    const maxW = wrapRef.current?.clientWidth ?? 900
    const scale = Math.min(1, maxW / img.width)
    cv.width = Math.round(img.width * scale)
    cv.height = Math.round(img.height * scale)
    const g = cv.getContext('2d')!
    g.clearRect(0, 0, cv.width, cv.height)
    g.drawImage(img, 0, 0, cv.width, cv.height)
    if (showBefore) return

    const q = quad.map((p) => ({ x: p.x * scale, y: p.y * scale })) as [Pt, Pt, Pt, Pt]

    const across = wallWidth / product.panelWidth
    const down = Math.max(1, wallHeight / product.panelLength)
    const tex = panelTexture(colour, across, down, 64, !product.seamless, product.slatsPerPanel, wallWidth / wallHeight)

    // 1. the material, built on its OWN canvas first.
    //
    //    drawWarped clips each little triangle, and a clip leaves a
    //    half-transparent edge. Multiplying the photo over those edges turned
    //    every triangle boundary into a dark line - a 24x24 grid drawn neatly
    //    across the customer's wall. Composing the panels separately and
    //    laying the finished sheet down once removes the grid entirely,
    //    because by then the sheet is opaque.
    const off = document.createElement('canvas')
    off.width = cv.width
    off.height = cv.height
    const og = off.getContext('2d')!
    drawWarped(og, tex, tex.width, tex.height, q)

    // 2. the room's own light and shade, multiplied back on top. This is the
    //    step that stops it looking pasted on - without it the new wall is
    //    evenly lit while everything around it is not.
    og.globalCompositeOperation = 'multiply'
    og.globalAlpha = blend
    og.drawImage(img, 0, 0, cv.width, cv.height)
    og.globalCompositeOperation = 'destination-in'   // keep only the panels
    og.globalAlpha = 1
    og.drawImage(off, 0, 0)
    og.globalCompositeOperation = 'source-over'

    g.save()
    g.beginPath()
    g.moveTo(q[0].x, q[0].y); g.lineTo(q[1].x, q[1].y)
    g.lineTo(q[2].x, q[2].y); g.lineTo(q[3].x, q[3].y); g.closePath()
    g.clip()
    g.drawImage(off, 0, 0)
    g.restore()

    // handles
    q.forEach((p, i) => {
      g.beginPath(); g.arc(p.x, p.y, 9, 0, Math.PI * 2)
      g.fillStyle = i === drag ? '#141414' : 'rgba(255,255,255,0.92)'
      g.fill(); g.lineWidth = 2; g.strokeStyle = '#141414'; g.stroke()
    })
    g.beginPath()
    g.moveTo(q[0].x, q[0].y); g.lineTo(q[1].x, q[1].y)
    g.lineTo(q[2].x, q[2].y); g.lineTo(q[3].x, q[3].y); g.closePath()
    g.setLineDash([5, 4]); g.strokeStyle = 'rgba(20,20,20,0.55)'; g.lineWidth = 1.5; g.stroke()
    g.setLineDash([])
  }, [img, quad, colour, product, wallWidth, wallHeight, blend, showBefore, drag, texTick])

  const toImg = (e: React.PointerEvent) => {
    const cv = cvRef.current!, img0 = img!
    const r = cv.getBoundingClientRect()
    const sx = img0.width / r.width, sy = img0.height / r.height
    return { x: (e.clientX - r.left) * sx, y: (e.clientY - r.top) * sy }
  }
  const down = (e: React.PointerEvent) => {
    if (!quad || !img) return
    const p = toImg(e)
    let best = -1, bd = Infinity
    quad.forEach((c, i) => {
      const d = Math.hypot(c.x - p.x, c.y - p.y)
      if (d < bd) { bd = d; best = i }
    })
    // generous on touch: a fingertip is not a mouse pointer
    if (bd < img.width * 0.08) { setDrag(best); (e.target as Element).setPointerCapture(e.pointerId) }
  }
  const move = (e: React.PointerEvent) => {
    if (drag === null || !quad) return
    const p = toImg(e)
    const next = [...quad] as [Pt, Pt, Pt, Pt]
    next[drag] = p
    setQuad(next)
  }
  const up = () => setDrag(null)

  const download = () => {
    const cv = cvRef.current
    if (!cv) return
    // redraw without the handles so the saved picture is clean
    const out = document.createElement('canvas')
    out.width = cv.width; out.height = cv.height
    const g = out.getContext('2d')!
    g.drawImage(cv, 0, 0)
    const a = document.createElement('a')
    a.download = `bronier-${product.slug}-${colour.id}.png`
    a.href = out.toDataURL('image/png')
    a.click()
  }

  const num = 'w-full rounded-md border border-line px-3 py-2.5 text-[15px] outline-none focus:border-ink'

  return (
    <div>
      <div className="grid gap-8 lg:grid-cols-[1.4fr_1fr]">
        <div ref={wrapRef}>
          {!img ? (
            <label className="block cursor-pointer rounded-xl border-2 border-dashed border-line
                              hover:border-ink transition-colors p-12 text-center">
              <input type="file" accept="image/*" className="hidden"
                     onChange={(e) => e.target.files?.[0] && onFile(e.target.files[0])} />
              <div className="text-lg">{L.vizUpload}</div>
              <p className="mt-2 text-sm text-muted max-w-sm mx-auto">{L.vizUploadHint}</p>
              <span className="mt-5 inline-block rounded-full bg-ink px-6 py-3 text-sm text-white">
                {L.vizChoose}
              </span>
            </label>
          ) : (
            <>
              <canvas ref={cvRef}
                className="w-full rounded-xl border border-line block touch-none select-none"
                onPointerDown={down} onPointerMove={move} onPointerUp={up} onPointerCancel={up} />
              <p className="mt-2 text-sm text-muted">{L.vizDragHint}</p>
              <div className="mt-3 flex flex-wrap gap-2">
                <button onClick={() => setShowBefore((v) => !v)}
                  className="rounded-full border border-ink px-5 py-2.5 text-sm hover:bg-ink hover:text-white transition-colors">
                  {showBefore ? L.vizAfter : L.vizBefore}
                </button>
                <button onClick={download}
                  className="rounded-full bg-ink px-5 py-2.5 text-sm text-white hover:bg-muted transition-colors">
                  {L.vizSave}
                </button>
                <label className="rounded-full border border-line px-5 py-2.5 text-sm cursor-pointer hover:border-ink">
                  <input type="file" accept="image/*" className="hidden"
                         onChange={(e) => e.target.files?.[0] && onFile(e.target.files[0])} />
                  {L.vizAnother}
                </label>
              </div>
            </>
          )}
        </div>

        <div>
          <div className="text-sm text-muted mb-2">{L.product}</div>
          <select value={product.slug} className={num}
            onChange={(e) => {
              const p = PRODUCTS.find((x) => x.slug === e.target.value)!
              setProduct(p); setColour(p.colours[0])
            }}>
            {PRODUCTS.map((p) => <option key={p.slug} value={p.slug}>{p.name}</option>)}
          </select>

          <div className="mt-6"><ColourPicker colours={product.colours} value={colour} onChange={setColour} /></div>

          <div className="mt-6 grid grid-cols-2 gap-3">
            <label className="block"><span className="text-sm text-muted">{L.wallWidth}</span>
              <input type="number" step="0.1" min="0.3" value={wallWidth} className={num + ' mt-1.5'}
                     onChange={(e) => setWallWidth(Math.max(0.3, +e.target.value || 0))} /></label>
            <label className="block"><span className="text-sm text-muted">{L.wallHeight}</span>
              <input type="number" step="0.1" min="0.3" value={wallHeight} className={num + ' mt-1.5'}
                     onChange={(e) => setWallHeight(Math.max(0.3, +e.target.value || 0))} /></label>
          </div>
          <p className="mt-2 text-xs text-muted">
            {Math.ceil(wallWidth / product.panelWidth)} {L.slatsAcross}
          </p>
          {product.slatsPerPanel && (
            <p className="mt-1 text-xs text-muted">
              {L.slatsPerPanel.replace('{n}', String(product.slatsPerPanel))}
            </p>
          )}

          <label className="mt-6 block">
            <span className="text-sm text-muted">{L.vizLight}</span>
            <input type="range" min={0} max={0.9} step={0.02} value={blend}
                   onChange={(e) => setBlend(+e.target.value)}
                   className="mt-2 w-full accent-[#141414]" />
          </label>
          <p className="mt-1 text-xs text-muted">{L.vizLightHint}</p>

          <p className="mt-6 text-xs text-muted border-t border-line pt-4">{L.vizPrivacy}</p>
        </div>
      </div>
    </div>
  )
}
