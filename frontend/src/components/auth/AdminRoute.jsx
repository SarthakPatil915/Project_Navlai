import { Navigate, useLocation } from 'react-router-dom'
import { useAuthStore } from '@/app/store'
import { LoadingOverlay } from '@/components/ui/Loading'

export default function AdminRoute({ children }) {
  const { isAuthenticated, isLoading, user } = useAuthStore()
  const location = useLocation()

  if (isLoading) {
    return <LoadingOverlay message="Checking authentication..." />
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  if (user?.role !== 'admin') {
    return <Navigate to="/dashboard" replace />
  }

  return children
}
