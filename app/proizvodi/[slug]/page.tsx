import Link from 'next/link'
import { notFound } from 'next/navigation'
import { PRODUCTS, bySlug } from '@/lib/products'
import { PanelCalculator } from '@/components/PanelCalculator'
import { L } from '@/lib/i18n'

export function generateStaticParams() {
  return PRODUCTS.map((p) => ({ slug: p.slug }))
}

// Next 15 hands `params` over as a Promise - it is awaited, not destructured.
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const p = bySlug(slug)
  if (!p) return {}
  return { title: `${p.name} - Bronier Decor`, description: p.short }
}

const IMG: Record<string, string> = {
  'wpc-paneli-enterier': '/img/hero-wpc-enterier.jpg',
  'wpc-paneli-fasada': '/img/hero-wpc-fasada.jpg',
  'pu-kamen': '/img/hero-pu-kamen.jpg',
  'bambusov-furnir': '/img/wpc-plocka-020.jpg',
}

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const p = bySlug(slug)
  if (!p) notFound()
  return (
    <div className="mx-auto max-w-site px-5 py-10">
      <Link href="/proizvodi/" className="text-sm text-muted hover:text-ink">← {L.back}</Link>
      <div className="mt-6 grid gap-10 md:grid-cols-2 md:items-start">
        <div className="aspect-[4/3] overflow-hidden rounded-xl bg-soft">
          <img src={IMG[p.slug]} alt={p.name} className="h-full w-full object-cover" />
        </div>
        <div>
          <h1 className="text-4xl">{p.name}</h1>
          <p className="mt-3 text-lg text-muted">{p.short}</p>
          <ul className="mt-6 space-y-2">
            {p.bullets.map((b) => (
              <li key={b} className="flex gap-3 text-[15px]">
                <span className="mt-2 h-1.5 w-1.5 rounded-full bg-clay shrink-0" />{b}
              </li>
            ))}
          </ul>
          <div className="mt-8 flex flex-wrap gap-3">
            <a href="#kalkulator" className="rounded-full bg-ink px-7 py-3.5 text-white text-sm hover:bg-clay transition-colors">{L.heroCta2}</a>
            <a href="#vizuelizator" className="rounded-full border border-ink px-7 py-3.5 text-sm hover:bg-ink hover:text-white transition-colors">{L.seeBeforeCta}</a>
          </div>
        </div>
      </div>
      <div id="kalkulator" className="scroll-mt-24" />
      <div id="vizuelizator" className="mt-16 scroll-mt-24">
        <PanelCalculator product={p} />
      </div>
    </div>
  )
}
