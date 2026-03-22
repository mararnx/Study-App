import { type HTMLAttributes, forwardRef } from 'react'
import { cn } from '@/utils/cn'

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  glass?:   boolean
  hover?:   boolean
  glow?:    boolean
  padding?: 'none' | 'sm' | 'md' | 'lg'
}

export const Card = forwardRef<HTMLDivElement, CardProps>(({
  glass   = false,
  hover   = false,
  glow    = false,
  padding = 'md',
  className,
  children,
  ...props
}, ref) => (
  <div
    ref={ref}
    className={cn(
      'rounded-2xl border transition-all duration-200',
      // Light pastel base
      'bg-white border-violet-100 shadow-card',
      // Glass effect
      glass && 'backdrop-blur-xl bg-white/85 border-violet-200',
      // Hover lift
      hover && 'hover:border-violet-200 hover:shadow-card-lg hover:-translate-y-0.5 cursor-pointer',
      // Glow on hover
      glow && 'hover:shadow-glow hover:border-primary-300',
      // Padding
      padding === 'none' && '',
      padding === 'sm'   && 'p-4',
      padding === 'md'   && 'p-5',
      padding === 'lg'   && 'p-7',
      className,
    )}
    {...props}
  >
    {children}
  </div>
))

Card.displayName = 'Card'

export const CardHeader = ({ className, ...props }: HTMLAttributes<HTMLDivElement>) => (
  <div className={cn('mb-4', className)} {...props} />
)

export const CardTitle = ({ className, ...props }: HTMLAttributes<HTMLHeadingElement>) => (
  <h3 className={cn('font-semibold text-slate-900 text-lg leading-tight', className)} {...props} />
)

export const CardDescription = ({ className, ...props }: HTMLAttributes<HTMLParagraphElement>) => (
  <p className={cn('text-sm text-slate-500 mt-1', className)} {...props} />
)

export const CardContent = ({ className, ...props }: HTMLAttributes<HTMLDivElement>) => (
  <div className={cn('', className)} {...props} />
)

export const CardFooter = ({ className, ...props }: HTMLAttributes<HTMLDivElement>) => (
  <div className={cn('mt-5 flex items-center gap-3', className)} {...props} />
)
