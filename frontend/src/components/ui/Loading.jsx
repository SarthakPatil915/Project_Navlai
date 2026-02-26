import { cn } from '@/utils/cn'
import { Loader2 } from 'lucide-react'

function Spinner({ className, size = 'default' }) {
  const sizes = {
    sm: 'h-4 w-4',
    default: 'h-6 w-6',
    lg: 'h-8 w-8',
  }

  return <Loader2 className={cn('animate-spin', sizes[size], className)} />
}

function LoadingOverlay({ message = 'Loading...' }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/80 backdrop-blur-sm">
      <div className="flex flex-col items-center gap-4">
        <Spinner size="lg" />
        <p className="text-sm text-neutral-600">{message}</p>
      </div>
    </div>
  )
}

function Skeleton({ className, ...props }) {
  return <div className={cn('animate-pulse rounded-md bg-neutral-200', className)} {...props} />
}

export { Spinner, LoadingOverlay, Skeleton }
