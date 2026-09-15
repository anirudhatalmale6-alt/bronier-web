'use client'
import Link from 'next/link'
import { useState } from 'react'
import { Logo } from './Logo'
import { L } from '@/lib/i18n'

const NAV = [
  { href: '/', label: L.navHome },
  { href: '/proizvodi/', label: L.navProducts },
  { href: '/wpc-ograda/', label: L.navFence },
  { href: '/vizuelizator/', label: L.navVisualizer },
  { href: '/#kontakt', label: L.navContact },
]

export function Header() {
  const [open, setOpen] = useState(false)
  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur border-b border-line">
      <div className="mx-auto max-w-site px-5 h-[72px] flex items-center gap-8">
        <Link href="/" className="shrink-0" aria-label="bronier">
          <Logo className="h-7 w-auto text-ink" />
        </Link>
        <nav className="hidden md:flex items-center gap-7 text-[15px] text-muted">
          {NAV.map((n) => (
            <Link key={n.href} href={n.href} className="hover:text-ink transition-colors">{n.label}</Link>
          ))}
        </nav>
        <div className="ml-auto hidden md:block">
          <a href="tel:+38970000000"
             className="inline-flex items-center rounded-full bg-ink px-5 py-2.5 text-sm text-white hover:bg-clay transition-colors">
            {L.call}
          </a>
        </div>
        <button onClick={() => setOpen(!open)} aria-label="menu"
                className="ml-auto md:hidden h-10 w-10 grid place-items-center">
          <span className="block w-5 border-t border-ink relative before:absolute before:-top-1.5 before:left-0 before:w-5 before:border-t before:border-ink after:absolute after:top-1.5 after:left-0 after:w-5 after:border-t after:border-ink" />
        </button>
      </div>
      {open && (
        <nav className="md:hidden border-t border-line bg-white px-5 py-3 space-y-1">
          {NAV.map((n) => (
            <Link key={n.href} href={n.href} onClick={() => setOpen(false)}
                  className="block py-2.5 text-[15px] text-ink">{n.label}</Link>
          ))}
        </nav>
      )}
    </header>
  )
}
