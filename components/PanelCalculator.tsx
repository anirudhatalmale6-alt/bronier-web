'use client'
import { useMemo, useState } from 'react'
import type { Product, Orientation } from '@/lib/products'
import { compareOrientations, mkd } from '@/lib/calc'
import { L } from '@/lib/i18n'
import { preloadTextures } from '@/lib/texture'
import { WallVisualizer } from './WallVisualizer'
import { PanelDetail } from './PanelDetail'
import { ColourPicker } from './ColourPicker'
import { QuoteSummary } from './QuoteSummary'

/**
 * Calculator and visualizer, side by side and driven by one piece of state -
 * so what the customer sees and what they are told to order are the same
 * calculation, not two that happen to agree today.
 */
export function PanelCalculator({ product }: { product: Product }) {
  const [w, setW] = useState(4.2)
  const [h, setH] = useState(2.7)
  const [orientation, setOrientation] = useState<Orientation>(product.orientations[0])
  const [waste, setWaste] = useState(product.defaultWaste)
  const [colour, setColour] = useState(product.colours[0])

  const both = useMemo(
    () => compareOrientations(w, h, product.panelWidth, product.panelLength, waste),
    [w, h, product.panelWidth, product.panelLength, waste],
  )
  const r = both[orientation]
  const other = both[orientation === 'vertical' ? 'horizontal' : 'vertical']
  const total = r.recommended * product.pricePerPiece

  const num = 'w-full rounded-md border border-line px-3 py-2.5 text-[15px] outline-none focus:border-ink'
  const fmt = (n: number) => n.toFixed(2).replace('.', ',')

  return (
    <div className="grid gap-10 lg:grid-cols-2">
      <div>
        <h2 className="text-2xl">{L.calcHeading}</h2>
        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <label className="block">
            <span className="text-sm text-muted">{L.wallWidth}</span>
            <input type="number" step="0.01" min="0.1" value={w} className={num + ' mt-1.5'}
                   onChange={(e) => setW(Math.max(0.1, +e.target.value || 0))} />
          </label>
          <label className="block">
            <span className="text-sm text-muted">{L.wallHeight}</span>
            <input type="number" step="0.01" min="0.1" value={h} className={num + ' mt-1.5'}
                   onChange={(e) => setH(Math.max(0.1, +e.target.value || 0))} />
          </label>
        </div>

        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <div>
            <div className="text-sm text-muted mb-1.5">{L.orientation}</div>
            <div className="flex rounded-md border border-line overflow-hidden">
              {product.orientations.map((o) => (
                <button key={o} onClick={() => setOrientation(o)}
                  className={'flex-1 px-3 py-2.5 text-sm transition-colors ' +
                    (o === orientation ? 'bg-ink text-white' : 'hover:bg-soft')}>
                  {o === 'vertical' ? L.vertical : L.horizontal}
                </button>
              ))}
            </div>
          </div>
          <div>
            <div className="text-sm text-muted mb-1.5">{L.waste}</div>
            <div className="flex rounded-md border border-line overflow-hidden">
              {[5, 10, 15].map((p) => (
                <button key={p} onClick={() => setWaste(p)}
                  className={'flex-1 px-3 py-2.5 text-sm transition-colors ' +
                    (p === waste ? 'bg-ink text-white' : 'hover:bg-soft')}>{p}%</button>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-6"><ColourPicker colours={product.colours} value={colour} onChange={setColour} /></div>

        <div className="mt-7 rounded-xl border border-line overflow-hidden">
          <div className="grid grid-cols-2 divide-x divide-line">
            <div className="p-5">
              <div className="text-sm text-muted">{L.required}</div>
              <div className="text-3xl mt-1">{r.required}</div>
              <div className="text-xs text-muted">{L.pieces}</div>
            </div>
            <div className="p-5 bg-clay-light">
              <div className="text-sm text-clay-dark">{L.recommended}</div>
              <div className="text-3xl mt-1 text-clay-dark">{r.recommended}</div>
              <div className="text-xs text-clay-dark/80">{L.pieces} ({waste}%)</div>
            </div>
          </div>
          <dl className="border-t border-line p-5 text-sm space-y-1.5">
            <Row k={L.layout} v={r.layout} />
            <Row k={L.wallArea} v={`${fmt(r.wallArea)} m²`} />
            <Row k={L.covered} v={`${fmt(r.coveredArea)} m²`} />
            <Row k={L.estTotal} v={mkd(total)} />
          </dl>
          {r.note && <p className="border-t border-line px-5 py-3 text-sm text-clay-dark bg-clay-light">{r.note}</p>}
          {other.required !== r.required && (
            <p className="border-t border-line px-5 py-3 text-sm text-muted">
              {orientation === 'vertical' ? L.horizontal : L.vertical}:{' '}
              {other.required} {L.pieces}
              {other.required > r.required
                ? ` - ${other.required - r.required} повеќе`
                : ` - ${r.required - other.required} помалку`}
            </p>
          )}
          {product.priceIsPlaceholder && (
            <p className="border-t border-line px-5 py-3 text-xs text-muted">{L.priceNote}</p>
          )}
        </div>
      </div>

      <div>
        <h2 className="text-2xl">{L.preview}</h2>
        <div className="mt-5">
          <WallVisualizer wallWidth={w} wallHeight={h} panelWidth={product.panelWidth}
            panelLength={product.panelLength} orientation={orientation} colour={colour}
            slatsPerPanel={product.slatsPerPanel} seamless={product.seamless} />
        </div>
        <div className="mt-5">
          <PanelDetail panelWidth={product.panelWidth} panelLength={product.panelLength}
            colour={colour} slatsPerPanel={product.slatsPerPanel} />
        </div>
        <p className="mt-2 text-xs text-muted">{L.dimsNote}</p>
        {product.slatsPerPanel && (
          <p className="mt-1 text-xs text-muted">
            {L.slatsPerPanel.replace('{n}', String(product.slatsPerPanel))}
          </p>
        )}
        <div className="mt-6">
          <QuoteSummary lines={[
            `${L.product}: ${product.name}`,
            `${L.colour}: ${colour.name}`,
            `${L.wall}: ${fmt(w)} × ${fmt(h)} m`,
            `${L.orientation}: ${orientation === 'vertical' ? L.vertical : L.horizontal}`,
            `${L.required}: ${r.required} ${L.pieces}`,
            `${L.recommended}: ${r.recommended} ${L.pieces}`,
            `${L.estTotal}: ${mkd(total)}`,
          ]} />
        </div>
      </div>
    </div>
  )
}

function Row({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex justify-between gap-4">
      <dt className="text-muted">{k}</dt><dd className="text-ink text-right">{v}</dd>
    </div>
  )
}
