import { cn } from '@/utils/cn'

interface ProgressBarProps {
  value:     number   // 0-100
  max?:      number
  size?:     'xs' | 'sm' | 'md' | 'lg'
  color?:    'primary' | 'success' | 'warning' | 'danger'
  animated?: boolean
  label?:    string
  className?: string
  showValue?: boolean
}

const colors = {
  primary: 'bg-primary-500',
  success: 'bg-emerald-500',
  warning: 'bg-amber-500',
  danger:  'bg-red-500',
}

const trackColors = {
  primary: 'bg-primary-500/15',
  success: 'bg-emerald-500/15',
  warning: 'bg-amber-500/15',
  danger:  'bg-red-500/15',
}

const heights = {
  xs: 'h-1',
  sm: 'h-1.5',
  md: 'h-2',
  lg: 'h-3',
}

export function ProgressBar({
  value,
  max       = 100,
  size      = 'md',
  color     = 'primary',
  animated  = true,
  label,
  className,
  showValue = false,
}: ProgressBarProps) {
  const pct = Math.min(100, Math.max(0, (value / max) * 100))

  return (
    <div className={cn('w-full', className)}>
      {(label || showValue) && (
        <div className="flex justify-between items-center mb-1.5">
          {label    && <span className="text-xs text-slate-400">{label}</span>}
          {showValue && <span className="text-xs font-medium text-slate-300">{Math.round(pct)}%</span>}
        </div>
      )}
      <div
        className={cn('w-full rounded-full overflow-hidden', trackColors[color], heights[size])}
        role="progressbar"
        aria-valuenow={value}
        aria-valuemax={max}
        aria-valuemin={0}
      >
        <div
          className={cn(
            'h-full rounded-full transition-all duration-700 ease-out',
            colors[color],
            animated && 'bg-gradient-to-r from-current to-current',
          )}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  )
}

// ── Progress Ring ─────────────────────────────────────────────────────────────

interface ProgressRingProps {
  value:     number   // 0-100
  size?:     number
  stroke?:   number
  color?:    string
  className?: string
  children?: React.ReactNode
}

export function ProgressRing({
  value,
  size   = 80,
  stroke = 7,
  color  = '#4052f5',
  className,
  children,
}: ProgressRingProps) {
  const r   = (size - stroke) / 2
  const circ = 2 * Math.PI * r
  const pct  = Math.min(100, Math.max(0, value))
  const offset = circ - (pct / 100) * circ

  return (
    <div className={cn('relative inline-flex items-center justify-center', className)}
         style={{ width: size, height: size }}>
      <svg
        className="-rotate-90"
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
      >
        {/* Track */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="rgba(99,102,241,0.12)"
          strokeWidth={stroke}
        />
        {/* Progress */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={color}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circ}
          strokeDashoffset={offset}
          className="transition-all duration-700 ease-out"
        />
      </svg>
      {children && (
        <div className="absolute inset-0 flex items-center justify-center">
          {children}
        </div>
      )}
    </div>
  )
}
