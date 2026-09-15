/**
 * Putting a flat panel texture onto a wall in somebody's own photograph.
 *
 * A wall in a photo is almost never a rectangle on screen - it is a
 * quadrilateral, because the camera saw it at an angle. So the customer marks
 * the four corners of their wall and the texture is mapped onto that shape with
 * a real projective transform (a homography), which is what makes the slats
 * converge towards the far end instead of sitting on the picture like a sticker.
 *
 * Canvas 2D has no perspective transform - `setTransform` is affine only. The
 * standard way round it, and the one used here, is to cut the texture into a
 * grid of small triangles and draw each one affinely. Over enough triangles the
 * error disappears; at 24x24 it is well under a pixel on a 1600px photo.
 */

export type Pt = { x: number; y: number }

/**
 * Homography taking the unit square (0,0)-(1,1) to four destination points,
 * solved directly rather than with a general matrix library - eight equations,
 * eight unknowns, Gaussian elimination.
 */
export function homography(dst: [Pt, Pt, Pt, Pt]): number[] {
  const [p0, p1, p2, p3] = dst            // TL, TR, BR, BL
  const src: Pt[] = [{ x: 0, y: 0 }, { x: 1, y: 0 }, { x: 1, y: 1 }, { x: 0, y: 1 }]
  const A: number[][] = []
  const b: number[] = []
  for (let i = 0; i < 4; i++) {
    const s = src[i], d = [p0, p1, p2, p3][i]
    A.push([s.x, s.y, 1, 0, 0, 0, -s.x * d.x, -s.y * d.x]); b.push(d.x)
    A.push([0, 0, 0, s.x, s.y, 1, -s.x * d.y, -s.y * d.y]); b.push(d.y)
  }
  const h = solve(A, b)
  return [...h, 1]                         // h33 fixed at 1
}

function solve(A: number[][], b: number[]): number[] {
  const n = b.length
  const M = A.map((row, i) => [...row, b[i]])
  for (let col = 0; col < n; col++) {
    let piv = col
    for (let r = col + 1; r < n; r++) if (Math.abs(M[r][col]) > Math.abs(M[piv][col])) piv = r
    ;[M[col], M[piv]] = [M[piv], M[col]]
    const d = M[col][col] || 1e-12
    for (let c = col; c <= n; c++) M[col][c] /= d
    for (let r = 0; r < n; r++) {
      if (r === col) continue
      const f = M[r][col]
      if (!f) continue
      for (let c = col; c <= n; c++) M[r][c] -= f * M[col][c]
    }
  }
  return M.map((row) => row[n])
}

/** Apply a homography to a point in unit space. */
export function project(h: number[], u: number, v: number): Pt {
  const d = h[6] * u + h[7] * v + h[8]
  return { x: (h[0] * u + h[1] * v + h[2]) / d, y: (h[3] * u + h[4] * v + h[5]) / d }
}

/**
 * Draw `tex` onto the quad `dst`, with perspective.
 *
 * `grid` is how finely the texture is cut up. 24 is the point where raising it
 * further stops changing the picture and only costs time.
 */
export function drawWarped(
  g: CanvasRenderingContext2D,
  tex: CanvasImageSource,
  texW: number,
  texH: number,
  dst: [Pt, Pt, Pt, Pt],
  grid = 24,
) {
  const h = homography(dst)
  for (let i = 0; i < grid; i++) {
    for (let j = 0; j < grid; j++) {
      const u0 = i / grid, u1 = (i + 1) / grid
      const v0 = j / grid, v1 = (j + 1) / grid
      const a = project(h, u0, v0), b = project(h, u1, v0)
      const c = project(h, u1, v1), d = project(h, u0, v1)
      // texture-space corners of this cell
      const sx0 = u0 * texW, sx1 = u1 * texW
      const sy0 = v0 * texH, sy1 = v1 * texH
      tri(g, tex, [sx0, sy0], [sx1, sy0], [sx0, sy1], a, b, d)
      tri(g, tex, [sx1, sy0], [sx1, sy1], [sx0, sy1], b, c, d)
    }
  }
}

/**
 * One affine-mapped triangle. The clip is inset by a hair and the draw is
 * expanded by a hair, because a clip exactly on the edge leaves a visible
 * hairline seam between neighbouring triangles on a high-DPI screen.
 */
function tri(
  g: CanvasRenderingContext2D, tex: CanvasImageSource,
  s0: [number, number], s1: [number, number], s2: [number, number],
  d0: Pt, d1: Pt, d2: Pt,
) {
  g.save()
  g.beginPath()
  // Grow each triangle around its own centroid before clipping.
  //
  // A clip edge is antialiased, so two triangles meeting exactly leave a row of
  // half-covered pixels - which reads as a thin dark line, and a 24x24 grid of
  // them is a grid drawn across the customer's wall. Overlapping the clips
  // means every boundary pixel is painted twice and ends up fully opaque.
  // 1.2% was not enough at this size; the overlap has to be at least a pixel
  // wide on screen, hence a floor in pixels rather than a bare percentage.
  const cx = (d0.x + d1.x + d2.x) / 3, cy = (d0.y + d1.y + d2.y) / 3
  const span = Math.max(
    Math.hypot(d0.x - cx, d0.y - cy),
    Math.hypot(d1.x - cx, d1.y - cy),
    Math.hypot(d2.x - cx, d2.y - cy)) || 1
  const k = Math.max(0.02, 1.2 / span)        // >= 1.2px of overlap
  const grow = (p: Pt) => ({ x: p.x + (p.x - cx) * k, y: p.y + (p.y - cy) * k })
  const e0 = grow(d0), e1 = grow(d1), e2 = grow(d2)
  g.moveTo(e0.x, e0.y); g.lineTo(e1.x, e1.y); g.lineTo(e2.x, e2.y); g.closePath()
  g.clip()

  // Affine map taking the source triangle onto the destination one.
  //
  // Derived the plain way rather than from a copied closed form: take the two
  // source edges as a basis, the two destination edges as their images, and the
  // linear part is one times the inverse of the other. The first version here
  // was a lifted formula with the signs wrong, and the result was that nothing
  // drew at all - a silent blank wall rather than a visibly skewed one.
  const ux = s1[0] - s0[0], uy = s1[1] - s0[1]
  const vx = s2[0] - s0[0], vy = s2[1] - s0[1]
  const det = ux * vy - vx * uy
  if (Math.abs(det) < 1e-9) { g.restore(); return }
  const px = d1.x - d0.x, py = d1.y - d0.y
  const qx = d2.x - d0.x, qy = d2.y - d0.y
  const a = (px * vy - qx * uy) / det
  const b = (py * vy - qy * uy) / det
  const c = (qx * ux - px * vx) / det
  const d = (qy * ux - py * vx) / det
  const e = d0.x - (a * s0[0] + c * s0[1])
  const f = d0.y - (b * s0[0] + d * s0[1])
  g.transform(a, b, c, d, e, f)
  g.drawImage(tex, 0, 0)
  g.restore()
}

/** Is the point inside the quad? Used for hit-testing the corner handles. */
export function inQuad(p: Pt, q: [Pt, Pt, Pt, Pt]) {
  let inside = false
  for (let i = 0, j = 3; i < 4; j = i++) {
    const a = q[i], b = q[j]
    if ((a.y > p.y) !== (b.y > p.y) &&
        p.x < ((b.x - a.x) * (p.y - a.y)) / (b.y - a.y) + a.x) inside = !inside
  }
  return inside
}
