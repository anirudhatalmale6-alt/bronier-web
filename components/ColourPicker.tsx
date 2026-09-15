'use client'
import type { Colour } from '@/lib/products'
import { L } from '@/lib/i18n'

export function ColourPicker({ colours, value, onChange }: {
  colours: Colour[]; value: Colour; onChange: (c: Colour) => void
}) {
  return (
    <div>
      <div className="text-sm text-muted mb-2">{L.chooseColour}</div>
      <p className="text-xs text-muted mb-2">{L.provisionalColours}</p>
      <div className="flex flex-wrap gap-3">
        {colours.map((c) => (
          <button key={c.id} onClick={() => onChange(c)} title={c.name}
            aria-pressed={c.id === value.id}
            className={'group w-[74px] text-left ' + (c.id === value.id ? '' : 'opacity-85 hover:opacity-100')}>
            {/* The swatch is the real photograph where there is one, so what
                he picks from and what lands on the wall are one image.

                ONE css property, not a mix. The first version set
                `backgroundImage` and the `background` shorthand in the same
                style object; React drops the whole conflicting set, and every
                swatch rendered blank while the wall behind it was correct. */}
            <span className="block h-[52px] rounded-md border-2 overflow-hidden"
                  style={{
                    borderColor: c.id === value.id ? '#141414' : '#e6e4e1',
                    background: c.texture
                      ? `url(${c.texture}) center / auto 100% repeat-x`
                      : `repeating-linear-gradient(90deg, ${c.hex} 0 6px, ${c.grain} 6px 7px)`,
                  }} />
            <span className="mt-1.5 block text-[11px] leading-tight text-muted">{c.name}</span>
          </button>
        ))}
      </div>
    </div>
  )
}
