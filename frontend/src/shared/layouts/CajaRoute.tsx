import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

export function CajaRoute() {
  const { user } = useAuth()
  const tieneCaja = (user?.sucursalesConAccesoCaja ?? []).length > 0
  return tieneCaja ? <Outlet /> : <Navigate to="/agenda" replace />
}
