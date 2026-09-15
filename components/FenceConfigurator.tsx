'use client'
import { useMemo, useState } from 'react'
import { FENCE } from '@/lib/products'
import { fenceFor, mkd } from '@/lib/calc'
import { L } from '@/lib/i18n'
import { ColourPicker } from './ColourPicker'
import { QuoteSummary } from './QuoteSummary'

/**
 * The fence, drawn to the customer's own numbers: real sections, real posts,
 * gates where they asked for them. Not "25 m x price".
 *
 * The drawing and the bill of materials come from one call to fenceFor(), so
 * if the picture shows twelve sections the quantity says twelve sections.
 */
export function FenceConfigurator() {
  const [len, setLen] = useState(25)
  const [h, setH] = useState(1.8)
  const [corners, setCorners] = useState(0)
  const [gates, setGates] = useState(1)
  const [install, setInstall] = useState(false)
  const [colour, setColour] = useState(FENCE.colours[0])

  const r = useMemo(
    () => fenceFor(len, h, corners, gates, FENCE.postSpacing, FENCE.boardHeight, FENCE.gateWidth),
    [len, h, corners, gates],
  )
  const total = r.boards * FENCE.pricePerBoard + r.posts * FENCE.pricePerPost
    + r.gates * FENCE.pricePerGate + (install ? len * FENCE.installPricePerMetre : 0)

  const num = 'w-full rounded-md border border-line px-3 py-2.5 text-[15px] outline-none focus:border-ink'
  const fmt = (n: number) => n.toFixed(2).replace('.', ',')

  return (
    <div className="grid gap-10 lg:grid-cols-2">
      <div>
        <h2 className="text-2xl">{L.fenceHeading}</h2>
        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <Field label={L.fenceLength}><input type="number" step="0.5" min="1" value={len} className={num}
            onChange={(e) => setLen(Math.max(1, +e.target.value || 0))} /></Field>
          <Field label={L.fenceHeight}><input type="number" step="0.1" min="0.3" value={h} className={num}
            onChange={(e) => setH(Math.max(0.3, +e.target.value || 0))} /></Field>
          <Field label={L.corners}><input type="number" step="1" min="0" value={corners} className={num}
            onChange={(e) => setCorners(Math.max(0, Math.floor(+e.target.value || 0)))} /></Field>
          <Field label={L.gates}><input type="number" step="1" min="0" value={gates} className={num}
            onChange={(e) => setGates(Math.max(0, Math.floor(+e.target.value || 0)))} /></Field>
        </div>

        <label className="mt-4 flex items-center gap-2.5 text-sm">
          <input type="checkbox" checked={install} onChange={(e) => setInstall(e.target.checked)}
                 className="h-4 w-4 accent-[#141414]" />
          <span>{L.install}</span>
        </label>

        <div className="mt-6"><ColourPicker colours={FENCE.colours} value={colour} onChange={setColour} /></div>

        <div className="mt-7 rounded-xl border border-line overflow-hidden">
          <div className="grid grid-cols-3 divide-x divide-line text-center">
            <Stat k={L.sections} v={r.sections} />
            <Stat k={L.boards} v={r.boards} />
            <Stat k={L.posts} v={r.posts} />
          </div>
          <dl className="border-t border-line p-5 text-sm space-y-1.5">
            <Row k={L.endPosts} v={String(r.endPosts)} />
            <Row k={L.cornerPosts} v={String(r.cornerPosts)} />
            <Row k={L.linePosts} v={String(r.linePosts)} />
            <Row k={L.gates} v={String(r.gates)} />
            <Row k={L.estTotal} v={mkd(total)} />
          </dl>
          {r.note && <p className="border-t border-line px-5 py-3 text-sm text-clay-dark bg-clay-light">{r.note}</p>}
          <p className="border-t border-line px-5 py-3 text-xs text-muted">{L.fencePlaceholder}</p>
        </div>
      </div>

      <div>
        <h2 className="text-2xl">{L.previewFence}</h2>
        <FenceDrawing len={len} h={h} r={r} colour={colour} />
        <div className="mt-6">
          <QuoteSummary lines={[
            `${L.product}: ${FENCE.name}`,
            `${L.colour}: ${colour.name}`,
            `${L.fenceLength}: ${fmt(len)} m`,
            `${L.fenceHeight}: ${fmt(h)} m`,
            `${L.corners}: ${corners}`, `${L.gates}: ${gates}`,
            `${L.sections}: ${r.sections}`, `${L.boards}: ${r.boards}`, `${L.posts}: ${r.posts}`,
            `${L.install}: ${install ? 'да' : 'не'}`,
            `${L.estTotal}: ${mkd(total)}`,
          ]} />
        </div>
      </div>
    </div>
  )
}

/** Elevation of the run: posts, boards, gates - all at the real counts. */
function FenceDrawing({ len, h, r, colour }: {
  len: number; h: number; r: ReturnType<typeof fenceFor>; colour: { hex: string; grain: string }
}) {
  const VW = 900, VH = 320
  const pad = 26, ground = VH - 42
  const scale = Math.min((VW - pad * 2) / Math.max(len, 0.5), (ground - 30) / Math.max(h, 0.3))
  const y0 = ground - h * scale
  const postW = Math.max(4, 0.09 * scale)
  const boards = Math.max(1, r.boardsPerSection)
  const bh = (h * scale) / boards

  const items: React.ReactNode[] = []
  let x = pad
  let gatesLeft = r.gates
  for (let s = 0; s < r.sections; s++) {
    // spread the gates through the run rather than bunching them at one end
    const gateHere = gatesLeft > 0 && r.sections > 1 &&
      s === Math.floor((r.sections / (r.gates + 1)) * (r.gates - gatesLeft + 1))
    const segW = FENCE.postSpacing * scale
    if (gateHere) {
      const gw = FENCE.gateWidth * scale
      items.push(<rect key={'g' + s} x={x} y={y0} width={gw} height={h * scale}
        fill={colour.hex} opacity={0.35} stroke="#141414" strokeDasharray="4 3" strokeWidth={1} />)
      items.push(<line key={'gl' + s} x1={x + gw / 2} y1={y0} x2={x + gw / 2} y2={ground}
        stroke="#141414" strokeWidth={1} opacity={0.4} />)
      x += gw
      gatesLeft--
    }
    for (let b = 0; b < boards; b++) {
      items.push(<rect key={`b${s}-${b}`} x={x} y={y0 + b * bh + 0.6} width={segW} height={bh - 1.2}
        fill={b % 2 ? colour.grain : colour.hex} rx={1} />)
    }
    items.push(<rect key={'p' + s} x={x - postW / 2} y={y0 - 5} width={postW} height={h * scale + 5}
      fill="#3a3a3a" rx={1} />)
    x += segW
  }
  items.push(<rect key="pend" x={x - postW / 2} y={y0 - 5} width={postW} height={h * scale + 5}
    fill="#3a3a3a" rx={1} />)

  return (
    <div className="mt-5 rounded-lg border border-line overflow-hidden bg-[#f3f2f0]">
      <svg viewBox={`0 0 ${VW} ${VH}`} className="w-full block">
        <rect x={0} y={ground} width={VW} height={VH - ground} fill="#e7e5e2" />
        {items}
        <text x={pad} y={VH - 12} fontSize="13" fill="#6b6b6b">
          {len.toFixed(2).replace('.', ',')} m · {h.toFixed(2).replace('.', ',')} m ·{' '}
          {r.sections} {L.sections.toLowerCase()} · {r.posts} {L.posts.toLowerCase()}
        </text>
      </svg>
    </div>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <label className="block"><span className="text-sm text-muted">{label}</span>
    <div className="mt-1.5">{children}</div></label>
}
function Stat({ k, v }: { k: string; v: number }) {
  return <div className="p-5"><div className="text-sm text-muted">{k}</div>
    <div className="text-3xl mt-1">{v}</div></div>
}
function Row({ k, v }: { k: string; v: string }) {
  return <div className="flex justify-between gap-4">
    <dt className="text-muted">{k}</dt><dd className="text-ink text-right">{v}</dd></div>
}
