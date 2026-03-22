import { forwardRef, type ButtonHTMLAttributes } from 'react'
import { cn } from '@/utils/cn'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'success'
  size?:    'sm' | 'md' | 'lg' | 'xl'
  loading?: boolean
  fullWidth?: boolean
}

const variants = {
  primary:   'bg-primary-500 hover:bg-primary-600 active:bg-primary-700 text-white shadow-sm hover:shadow-glow border border-primary-400/30',
  secondary: 'bg-violet-50 hover:bg-violet-100 active:bg-violet-200 text-violet-700 border border-violet-200 hover:border-violet-300',
  ghost:     'hover:bg-violet-50 active:bg-violet-100 text-slate-600 hover:text-slate-900',
  danger:    'bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 hover:border-red-300',
  success:   'bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 hover:border-emerald-300',
}

const sizes = {
  sm:  'px-3 py-1.5 text-sm rounded-xl gap-1.5',
  md:  'px-4 py-2.5 text-sm rounded-xl gap-2',
  lg:  'px-5 py-3 text-base rounded-2xl gap-2',
  xl:  'px-7 py-4 text-lg rounded-2xl gap-2.5',
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(({
  variant = 'primary',
  size    = 'md',
  loading = false,
  fullWidth = false,
  className,
  children,
  disabled,
  ...props
}, ref) => (
  <button
    ref={ref}
    disabled={disabled || loading}
    className={cn(
      'inline-flex items-center justify-center font-medium transition-all duration-150',
      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-400 focus-visible:ring-offset-2 focus-visible:ring-offset-white',
      'disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none',
      'active:scale-[0.98]',
      variants[variant],
      sizes[size],
      fullWidth && 'w-full',
      className,
    )}
    {...props}
  >
    {loading && (
      <svg className="animate-spin -ml-0.5 h-4 w-4" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
      </svg>
    )}
    {children}
  </button>
))

Button.displayName = 'Button'
