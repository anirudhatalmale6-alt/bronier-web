import Link from 'next/link'
import { PRODUCTS, FENCE } from '@/lib/products'
import { L } from '@/lib/i18n'

const CATS = [
  { href: '/wpc-ograda/', name: 'WPC огради', img: '/img/wpc-nadvoresen-001.jpg' },
  { href: '/proizvodi/wpc-paneli-enterier/', name: 'WPC панели за ентериер', img: '/img/akusticen-panel-8300-2.jpg' },
  { href: '/proizvodi/wpc-paneli-fasada/', name: 'WPC фасадни панели', img: '/img/wpc-nadvoresen-002.jpg' },
  { href: '/proizvodi/pu-kamen/', name: 'PU камен', img: '/img/pu-kamen-2.jpg' },
  { href: '/proizvodi/bambusov-furnir/', name: 'Бамбусов фурнир', img: '/img/wpc-plocka-021.jpg' },
]

export default function Home() {
  return (
    <>
      <section className="relative">
        <div className="mx-auto max-w-site px-5 pt-16 pb-14 md:pt-24 md:pb-20 grid gap-10 md:grid-cols-2 md:items-center">
          <div className="fade-up">
            <h1 className="text-4xl md:text-6xl leading-[1.05]">{L.heroTitle}</h1>
            <p className="mt-5 text-lg text-muted max-w-md">{L.heroText}</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/proizvodi/" className="rounded-full bg-ink px-7 py-3.5 text-white text-sm hover:bg-clay transition-colors">{L.heroCta}</Link>
              <Link href="/proizvodi/wpc-paneli-enterier/#kalkulator" className="rounded-full border border-ink px-7 py-3.5 text-sm hover:bg-ink hover:text-white transition-colors">{L.heroCta2}</Link>
            </div>
          </div>
          <div className="aspect-[4/3] overflow-hidden rounded-xl bg-soft">
            <img src="/img/wpc-nadvoresen-001.jpg" alt="" className="h-full w-full object-cover" />
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-site px-5 py-8">
        <h2 className="text-2xl mb-6">{L.categories}</h2>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {CATS.map((c) => (
            <Link key={c.href} href={c.href} className="group block">
              <div className="aspect-[4/3] overflow-hidden rounded-xl bg-soft">
                <img src={c.img} alt="" loading="lazy"
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.04]" />
              </div>
              <div className="mt-3 flex items-center justify-between">
                <span className="text-[17px]">{c.name}</span>
                <span className="text-muted group-hover:text-clay transition-colors">→</span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section id="vizuelizator" className="mt-16 bg-soft border-y border-line">
        <div className="mx-auto max-w-site px-5 py-16 grid gap-8 md:grid-cols-2 md:items-center">
          <div>
            <h2 className="text-3xl">{L.seeBeforeTitle}</h2>
            <p className="mt-3 text-muted max-w-md">{L.seeBeforeText}</p>
            <Link href="/proizvodi/wpc-paneli-enterier/#vizuelizator"
              className="mt-7 inline-block rounded-full bg-ink px-7 py-3.5 text-white text-sm hover:bg-clay transition-colors">
              {L.seeBeforeCta}
            </Link>
          </div>
          <div className="rounded-xl border border-line bg-white p-3">
            <div className="aspect-[16/10] rounded-lg overflow-hidden"
              style={{ background: 'repeating-linear-gradient(90deg,#c69a63 0 26px,#a97e4c 26px 28px)' }} />
            <div className="mt-3 flex gap-2">
              {['#c69a63', '#7d5336', '#3c3f41', '#9b9b97', '#ece9e4'].map((c) => (
                <span key={c} className="h-8 w-8 rounded border border-line" style={{ background: c }} />
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-site px-5 py-16 grid gap-8 md:grid-cols-2 md:items-center">
        <div className="order-2 md:order-1 rounded-xl border border-line p-6">
          <div className="text-sm text-muted">{L.wallWidth}</div>
          <div className="mt-1 h-11 rounded-md border border-line px-3 flex items-center text-[15px]">4,20</div>
          <div className="mt-4 text-sm text-muted">{L.wallHeight}</div>
          <div className="mt-1 h-11 rounded-md border border-line px-3 flex items-center text-[15px]">2,70</div>
          <div className="mt-5 grid grid-cols-2 gap-px bg-line rounded-lg overflow-hidden">
            <div className="bg-white p-4"><div className="text-xs text-muted">{L.required}</div><div className="text-2xl">25</div></div>
            <div className="bg-clay-light p-4"><div className="text-xs text-clay-dark">{L.recommended}</div><div className="text-2xl text-clay-dark">28</div></div>
          </div>
        </div>
        <div className="order-1 md:order-2">
          <h2 className="text-3xl">{L.calcTitle}</h2>
          <p className="mt-3 text-muted max-w-md">{L.calcText}</p>
          <Link href="/proizvodi/wpc-paneli-enterier/#kalkulator"
            className="mt-7 inline-block rounded-full bg-ink px-7 py-3.5 text-white text-sm hover:bg-clay transition-colors">
            {L.calcCta}
          </Link>
        </div>
      </section>

      <section className="bg-soft border-y border-line">
        <div className="mx-auto max-w-site px-5 py-16">
          <h2 className="text-3xl mb-8">{L.whyTitle}</h2>
          <div className="grid gap-x-8 gap-y-5 sm:grid-cols-2 lg:grid-cols-3">
            {L.why.map((x) => (
              <div key={x} className="flex gap-3 items-start">
                <span className="mt-2 h-1.5 w-1.5 rounded-full bg-clay shrink-0" />
                <span className="text-[17px]">{x}</span>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  )
}
