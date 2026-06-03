import { Navigate, Outlet } from 'react-router-dom'
import { Spinner } from '../components/ui/Spinner'
import { useAuth } from '../hooks/useAuth'

export function ProtectedRoute() {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background text-text-primary">
        <Spinner />
      </div>
    )
  }

  return user ? <Outlet /> : <Navigate to="/login" replace />
}
