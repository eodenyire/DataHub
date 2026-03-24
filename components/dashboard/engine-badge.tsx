import { cn } from '@/lib/utils'
import type { DataEngine } from '@/lib/types'

const engineColors: Record<DataEngine, { bg: string; text: string }> = {
  druid: { bg: 'bg-chart-1/10', text: 'text-chart-1' },
  hive: { bg: 'bg-chart-2/10', text: 'text-chart-2' },
  drill: { bg: 'bg-chart-3/10', text: 'text-chart-3' },
  flink: { bg: 'bg-chart-4/10', text: 'text-chart-4' },
}

const engineNames: Record<DataEngine, string> = {
  druid: 'Druid',
  hive: 'Hive',
  drill: 'Drill',
  flink: 'Flink',
}

interface EngineBadgeProps {
  engine: DataEngine
  size?: 'sm' | 'md' | 'lg'
  showIcon?: boolean
}

export function EngineBadge({ engine, size = 'sm', showIcon = true }: EngineBadgeProps) {
  const colors = engineColors[engine]
  const name = engineNames[engine]

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full font-medium',
        colors.bg,
        colors.text,
        size === 'sm' && 'px-2 py-0.5 text-xs',
        size === 'md' && 'px-2.5 py-1 text-sm',
        size === 'lg' && 'px-3 py-1.5 text-sm'
      )}
    >
      {showIcon && (
        <span
          className={cn(
            'rounded-full',
            size === 'sm' && 'h-1.5 w-1.5',
            size === 'md' && 'h-2 w-2',
            size === 'lg' && 'h-2.5 w-2.5',
            engine === 'druid' && 'bg-chart-1',
            engine === 'hive' && 'bg-chart-2',
            engine === 'drill' && 'bg-chart-3',
            engine === 'flink' && 'bg-chart-4'
          )}
        />
      )}
      {name}
    </span>
  )
}
