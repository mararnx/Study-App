import { type ReactNode, useState } from 'react'
import { cn } from '@/utils/cn'

interface TooltipProps {
  content:  string
  children: ReactNode
  side?:    'top' | 'bottom' | 'left' | 'right'
  className?: string
}

export function Tooltip({ content, children, side = 'top', className }: TooltipProps) {
  const [visible, setVisible] = useState(false)

  const positions = {
    top:    'bottom-full left-1/2 -translate-x-1/2 mb-2',
    bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
    left:   'right-full top-1/2 -translate-y-1/2 mr-2',
    right:  'left-full top-1/2 -translate-y-1/2 ml-2',
  }

  return (
    <div
      className="relative inline-flex"
      onMouseEnter={() => setVisible(true)}
      onMouseLeave={() => setVisible(false)}
      onFocus={()    => setVisible(true)}
      onBlur={()     => setVisible(false)}
    >
      {children}
      {visible && (
        <div
          className={cn(
            'absolute z-50 px-2.5 py-1.5 text-xs font-medium text-white',
            'bg-surface-800 border border-white/10 rounded-xl shadow-lg',
            'whitespace-nowrap pointer-events-none animate-fade-in',
            positions[side],
            className,
          )}
        >
          {content}
        </div>
      )}
    </div>
  )
}
