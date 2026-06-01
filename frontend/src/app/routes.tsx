import { Navigate, Route, Routes } from 'react-router-dom'
import { AgendaPage } from '../pages/AgendaPage'
import { CajaPage } from '../pages/CajaPage'
import { EquipoPage } from '../pages/EquipoPage'
import { InventarioPage } from '../pages/InventarioPage'
import { LoginPage } from '../pages/LoginPage'
import { ServiciosPage } from '../pages/ServiciosPage'
import { AdminLayout } from '../shared/layouts/AdminLayout'
import { ProtectedRoute } from '../shared/layouts/ProtectedRoute'

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route element={<ProtectedRoute />}>
        <Route element={<AdminLayout />}>
          <Route index element={<Navigate to="/agenda" replace />} />
          <Route path="/agenda" element={<AgendaPage />} />
          <Route path="/equipo" element={<EquipoPage />} />
          <Route path="/servicios" element={<ServiciosPage />} />
          <Route path="/inventario" element={<InventarioPage />} />
          <Route path="/caja" element={<CajaPage />} />
        </Route>
      </Route>
    </Routes>
  )
}
