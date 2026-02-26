import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/Button'
import { Home, ArrowLeft } from 'lucide-react'

export default function NotFoundPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4">
      <div className="text-center">
        <h1 className="text-8xl font-bold text-neutral-200">404</h1>
        <h2 className="mt-4 text-2xl font-semibold text-neutral-900">Page Not Found</h2>
        <p className="mt-2 text-neutral-600">
          Sorry, we couldn't find the page you're looking for.
        </p>
        <div className="mt-8 flex items-center justify-center gap-4">
          <Button variant="outline" onClick={() => window.history.back()} className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Go Back
          </Button>
          <Link to="/">
            <Button className="gap-2">
              <Home className="h-4 w-4" />
              Home
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
