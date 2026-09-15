import { FenceConfigurator } from '@/components/FenceConfigurator'
import { FENCE } from '@/lib/products'

export const metadata = {
  title: 'WPC ограда - Bronier Decor',
  description: 'Пресметај ја твојата WPC ограда: полиња, столбови, порти и проценета цена.',
}

export default function FencePage() {
  return (
    <div className="mx-auto max-w-site px-5 py-12">
      <h1 className="text-4xl">{FENCE.name}</h1>
      <p className="mt-3 text-lg text-muted max-w-xl">{FENCE.short}</p>
      <div className="mt-12"><FenceConfigurator /></div>
    </div>
  )
}
