import Link from 'next/link'
import { Logo } from './Logo'
import { L } from '@/lib/i18n'

export function Footer() {
  return (
    <footer id="kontakt" className="mt-24 border-t border-line bg-soft">
      <div className="mx-auto max-w-site px-5 py-14 grid gap-10 md:grid-cols-3">
        <div>
          <Logo className="h-7 w-auto text-ink" />
          <p className="mt-4 text-sm text-muted max-w-xs">
            Декоративни панели за ентериер и екстериер. Струмица, Северна Македонија.
          </p>
        </div>
        <div className="text-sm">
          <div className="text-ink mb-3">{L.navProducts}</div>
          <ul className="space-y-2 text-muted">
            <li><Link href="/proizvodi/wpc-paneli-enterier/">WPC панели за ентериер</Link></li>
            <li><Link href="/proizvodi/wpc-paneli-fasada/">WPC фасадни панели</Link></li>
            <li><Link href="/proizvodi/pu-kamen/">PU камен</Link></li>
            <li><Link href="/proizvodi/bambusov-furnir/">Бамбусов фурнир</Link></li>
            <li><Link href="/wpc-ograda/">WPC ограда</Link></li>
          </ul>
        </div>
        <div className="text-sm">
          <div className="text-ink mb-3">{L.navContact}</div>
          <ul className="space-y-2 text-muted">
            <li><a href="tel:+38970000000">+389 70 000 000</a></li>
            <li><a href="https://wa.me/38970000000">WhatsApp</a></li>
            <li><a href="viber://chat?number=%2B38970000000">Viber</a></li>
          </ul>
          <p className="mt-4 text-xs text-muted/70">Телефонскиот број е примерок.</p>
        </div>
      </div>
      <div className="border-t border-line py-5 text-center text-xs text-muted">
        © {new Date().getFullYear()} Bronier Decor
      </div>
    </footer>
  )
}
