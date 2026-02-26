import { forwardRef } from 'react'
import { cn } from '@/utils/cn'

const Select = forwardRef(({ className, children, error, ...props }, ref) => {
  return (
    <select
      ref={ref}
      className={cn(
        'flex h-9 w-full items-center justify-between rounded-md border border-neutral-200 bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-neutral-500 focus:outline-none focus:ring-1 focus:ring-neutral-950 disabled:cursor-not-allowed disabled:opacity-50',
        error && 'border-red-500 focus:ring-red-500',
        className
      )}
      {...props}
    >
      {children}
    </select>
  )
})

Select.displayName = 'Select'

export { Select }
