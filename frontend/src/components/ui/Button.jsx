import { forwardRef } from 'react'
import { cn } from '@/utils/cn'

const Button = forwardRef(
  ({ className, variant = 'default', size = 'default', disabled, children, ...props }, ref) => {
    const baseStyles =
      'inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-neutral-950 disabled:pointer-events-none disabled:opacity-50'

    const variants = {
      default: 'bg-neutral-900 text-neutral-50 shadow hover:bg-neutral-900/90',
      destructive: 'bg-red-500 text-neutral-50 shadow-sm hover:bg-red-500/90',
      outline: 'border border-neutral-200 bg-white shadow-sm hover:bg-neutral-100 hover:text-neutral-900',
      secondary: 'bg-neutral-100 text-neutral-900 shadow-sm hover:bg-neutral-100/80',
      ghost: 'hover:bg-neutral-100 hover:text-neutral-900',
      link: 'text-neutral-900 underline-offset-4 hover:underline',
    }

    const sizes = {
      default: 'h-9 px-4 py-2',
      sm: 'h-8 rounded-md px-3 text-xs',
      lg: 'h-10 rounded-md px-8',
      icon: 'h-9 w-9',
    }

    return (
      <button
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        ref={ref}
        disabled={disabled}
        {...props}
      >
        {children}
      </button>
    )
  }
)

Button.displayName = 'Button'

export { Button }
