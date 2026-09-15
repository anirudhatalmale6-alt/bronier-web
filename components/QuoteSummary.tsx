'use client'
import { useState } from 'react'
import { L } from '@/lib/i18n'

/**
 * The quote step. Static export means no server, so instead of posting a form
 * into a void this hands the finished project to WhatsApp or Viber with every
 * choice already written into the message - which is how his customers get in
 * touch anyway. When the site goes on a server this same summary posts to an
 * inbox as well; the text it builds does not change.
 */
export function QuoteSummary({ lines }: { lines: string[] }) {
  const [f, setF] = useState({ name: '', phone: '', city: '' })
  const body = [L.yourProject, ...lines, '', `${L.name}: ${f.name}`,
    `${L.phone}: ${f.phone}`, `${L.city}: ${f.city}`].join('\n')
  const enc = encodeURIComponent(body)
  const inp = 'w-full rounded-md border border-line px-3 py-2.5 text-sm outline-none focus:border-ink'
  return (
    <div id="ponuda" className="rounded-xl border border-line p-6 bg-soft">
      <h3 className="text-xl">{L.quoteTitle}</h3>
      <p className="mt-1 text-sm text-muted">{L.quoteText}</p>
      <div className="mt-4 rounded-md bg-white border border-line p-4 text-sm">
        {lines.map((l, i) => <div key={i} className="flex justify-between gap-4 py-0.5">
          <span className="text-muted">{l.split(': ')[0]}</span>
          <span className="text-ink text-right">{l.split(': ').slice(1).join(': ')}</span>
        </div>)}
      </div>
      <div className="mt-4 grid gap-3 sm:grid-cols-3">
        <input className={inp} placeholder={L.name} value={f.name}
               onChange={(e) => setF({ ...f, name: e.target.value })} />
        <input className={inp} placeholder={L.phone} value={f.phone}
               onChange={(e) => setF({ ...f, phone: e.target.value })} />
        <input className={inp} placeholder={L.city} value={f.city}
               onChange={(e) => setF({ ...f, city: e.target.value })} />
      </div>
      <div className="mt-4 flex flex-wrap gap-3">
        <a href={`https://wa.me/38970000000?text=${enc}`}
           className="rounded-full bg-ink px-6 py-3 text-sm text-white hover:bg-clay transition-colors">
          {L.sendWhatsapp}
        </a>
        <a href={`viber://forward?text=${enc}`}
           className="rounded-full border border-ink px-6 py-3 text-sm hover:bg-ink hover:text-white transition-colors">
          {L.sendViber}
        </a>
      </div>
    </div>
  )
}
