import { cn } from '@/lib/utils'

type Status = 'completed' | 'pending' | 'failed' | 'reversed' | 'running' | 'active' | 'inactive'

const statusConfig: Record<Status, { bg: string; text: string; label: string }> = {
  completed: { bg: 'bg-success/10', text: 'text-success', label: 'Completed' },
  pending: { bg: 'bg-warning/10', text: 'text-warning', label: 'Pending' },
  failed: { bg: 'bg-destructive/10', text: 'text-destructive', label: 'Failed' },
  reversed: { bg: 'bg-muted', text: 'text-muted-foreground', label: 'Reversed' },
  running: { bg: 'bg-info/10', text: 'text-info', label: 'Running' },
  active: { bg: 'bg-success/10', text: 'text-success', label: 'Active' },
  inactive: { bg: 'bg-muted', text: 'text-muted-foreground', label: 'Inactive' },
}

interface StatusBadgeProps {
  status: Status
  size?: 'sm' | 'md'
}

export function StatusBadge({ status, size = 'sm' }: StatusBadgeProps) {
  const config = statusConfig[status]

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full font-medium',
        config.bg,
        config.text,
        size === 'sm' && 'px-2 py-0.5 text-xs',
        size === 'md' && 'px-2.5 py-1 text-sm'
      )}
    >
      <span
        className={cn(
          'rounded-full',
          size === 'sm' && 'h-1.5 w-1.5',
          size === 'md' && 'h-2 w-2',
          status === 'completed' && 'bg-success',
          status === 'active' && 'bg-success',
          status === 'pending' && 'bg-warning',
          status === 'failed' && 'bg-destructive',
          status === 'reversed' && 'bg-muted-foreground',
          status === 'running' && 'bg-info animate-pulse',
          status === 'inactive' && 'bg-muted-foreground'
        )}
      />
      {config.label}
    </span>
  )
}
