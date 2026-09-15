/**
 * The approved wordmark: lowercase "bronier" with the panel slats on the o.
 * Drawn as SVG rather than shipped as an image so it stays sharp at any size
 * and can take its colour from the page.
 *
 * The geometry is the same measured Jost Light metrics the logo files use
 * (upem 1000: o outer 39..511, counter 92..458, advance 550) - the letters are
 * live text here because the site loads Jost anyway, and the slats are drawn
 * on top of the o at its measured centre.
 */
export function Logo({ className = '', colour = 'currentColor' }: { className?: string; colour?: string }) {
  // 7 slats across the o, each stopping on the circle so the fluting meets the
  // ring - the version that reads as a panel rather than as a face.
  const cx = 0, cy = 0, r = 0.2095, stem = 0.053
  const inner = r - stem / 2
  const n = 4
  const bw = stem * 0.55
  const pitch = (inner * 2 - bw) / (n + 1)
  const bars = Array.from({ length: n }, (_, i) => {
    const bx = cx - inner + pitch * (i + 1) - bw / 2
    const dx = Math.abs(bx + bw / 2 - cx)
    const half = Math.sqrt(Math.max(0, inner * inner - dx * dx))
    return <rect key={i} x={bx} y={cy - half} width={bw} height={half * 2} fill={colour} />
  })
  return (
    <svg viewBox="0 0 3.35 1" className={className} role="img" aria-label="bronier">
      <text x="0" y="0.74" fill={colour} fontFamily="Jost, LatoText, sans-serif" fontWeight={300}
            fontSize="1" letterSpacing="0.05">b</text>
      <text x="0.61" y="0.74" fill={colour} fontFamily="Jost, LatoText, sans-serif" fontWeight={300}
            fontSize="1" letterSpacing="0.05">r</text>
      <g transform="translate(1.275 0.51)">
        <circle cx={0} cy={0} r={r} fill="none" stroke={colour} strokeWidth={stem} />
        {bars}
      </g>
      <text x="1.65" y="0.74" fill={colour} fontFamily="Jost, LatoText, sans-serif" fontWeight={300}
            fontSize="1" letterSpacing="0.05">nier</text>
    </svg>
  )
}
