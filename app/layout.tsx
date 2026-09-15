import './globals.css'
import type { Metadata } from 'next'
import { Header } from '@/components/Header'
import { Footer } from '@/components/Footer'
import { StickyContact } from '@/components/StickyContact'
import { L } from '@/lib/i18n'

export const metadata: Metadata = {
  title: 'Bronier Decor - WPC панели, фасади и огради',
  description: 'Современи WPC панели за ентериер и екстериер, PU камен, бамбусов фурнир и WPC огради. Пресметај количина и види како изгледа на твојот ѕид.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="mk">
      <body>
        <div className="bg-clay text-white text-center text-xs py-1.5 px-4">{L.prototypeBanner}</div>
        <Header />
        <main>{children}</main>
        <Footer />
        <StickyContact />
      </body>
    </html>
  )
}
