import { cn } from '@/utils/cn'

function Badge({ className, variant = 'default', children, ...props }) {
  const variants = {
    default: 'bg-neutral-900 text-neutral-50',
    secondary: 'bg-neutral-100 text-neutral-900',
    destructive: 'bg-red-500 text-neutral-50',
    outline: 'text-neutral-950 border border-neutral-200',
    success: 'bg-green-100 text-green-800',
    warning: 'bg-yellow-100 text-yellow-800',
    info: 'bg-blue-100 text-blue-800',
  }

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-md px-2.5 py-0.5 text-xs font-medium transition-colors',
        variants[variant],
        className
      )}
      {...props}
    >
      {children}
    </span>
  )
}

export { Badge }
