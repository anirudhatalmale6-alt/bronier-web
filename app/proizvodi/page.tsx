import Link from 'next/link'
import { PRODUCTS } from '@/lib/products'
import { L } from '@/lib/i18n'

const IMG: Record<string, string> = {
  'wpc-paneli-enterier': '/img/akusticen-panel-8300-2.jpg',
  'wpc-paneli-fasada': '/img/wpc-nadvoresen-002.jpg',
  'pu-kamen': '/img/pu-kamen-2.jpg',
  'bambusov-furnir': '/img/wpc-plocka-021.jpg',
}

export default function Catalog() {
  return (
    <div className="mx-auto max-w-site px-5 py-14">
      <h1 className="text-4xl">{L.navProducts}</h1>
      <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {PRODUCTS.map((p) => (
          <Link key={p.slug} href={`/proizvodi/${p.slug}/`} className="group block">
            <div className="aspect-[4/3] overflow-hidden rounded-xl bg-soft">
              <img src={IMG[p.slug]} alt="" loading="lazy"
                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.04]" />
            </div>
            <h2 className="mt-3 text-xl">{p.name}</h2>
            <p className="mt-1 text-sm text-muted">{p.short}</p>
            <p className="mt-2 text-sm text-clay">
              {(p.panelWidth * 100).toFixed(1).replace('.', ',')} × {(p.panelLength * 100).toFixed(0)} см
            </p>
          </Link>
        ))}
        <Link href="/wpc-ograda/" className="group block">
          <div className="aspect-[4/3] overflow-hidden rounded-xl bg-soft">
            <img src="/img/wpc-nadvoresen-001.jpg" alt="" loading="lazy"
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.04]" />
          </div>
          <h2 className="mt-3 text-xl">WPC ограда</h2>
          <p className="mt-1 text-sm text-muted">Комплетен систем за надворешна ограда.</p>
        </Link>
      </div>
    </div>
  )
}
