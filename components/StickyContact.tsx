import { L } from '@/lib/i18n'

/** Sticky bar on phones only. His customers come from Instagram and TikTok on
 *  a phone, and in North Macedonia they message rather than fill in forms. */
export function StickyContact() {
  const item = 'flex-1 py-3.5 text-center text-sm text-white'
  return (
    <div className="md:hidden fixed bottom-0 inset-x-0 z-50 flex bg-ink">
      <a href="tel:+38970000000" className={item}>{L.call}</a>
      <a href="viber://chat?number=%2B38970000000" className={item + ' border-l border-white/15'}>Viber</a>
      <a href="https://wa.me/38970000000" className={item + ' border-l border-white/15'}>WhatsApp</a>
    </div>
  )
}
