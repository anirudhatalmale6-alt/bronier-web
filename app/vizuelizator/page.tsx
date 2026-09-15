import { RoomVisualizer } from '@/components/RoomVisualizer'
import { L } from '@/lib/i18n'

export const metadata = {
  title: 'Визуелизатор - види го на твојот ѕид | Bronier Decor',
  description: 'Качи фотографија од твојата просторија и види како изгледа со WPC панели, PU камен или бамбусов фурнир.',
}

export default function VisualizerPage() {
  return (
    <div className="mx-auto max-w-site px-5 py-12">
      <h1 className="text-4xl">{L.vizTitle}</h1>
      <p className="mt-3 text-lg text-muted max-w-2xl">{L.vizLead}</p>
      <div className="mt-10"><RoomVisualizer /></div>
    </div>
  )
}
