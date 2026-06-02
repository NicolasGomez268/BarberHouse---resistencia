import { useState } from 'react'
import { MOCK_SERVICIOS } from '../../../mocks'
import type { Servicio } from '../../../types'

const USE_MOCKS = import.meta.env.VITE_USE_MOCKS !== 'false'

export function useServicios() {
  const [servicios, setServicios] = useState<Servicio[]>(USE_MOCKS ? MOCK_SERVICIOS : [])
  const [loading] = useState(false)
  const [error] = useState<string | null>(null)

  function agregarServicio(servicio: Omit<Servicio, 'id'>) {
    if (!USE_MOCKS) {
      // TODO: POST /api/v1/servicios
      return
    }

    const nuevo: Servicio = { ...servicio, id: `srv-${Date.now()}` }
    setServicios((prev) => [nuevo, ...prev])
  }

  function actualizarServicio(id: string, datos: Partial<Servicio>) {
    if (!USE_MOCKS) {
      // TODO: PATCH /api/v1/servicios/:id
      return
    }

    setServicios((prev) => prev.map((servicio) => (servicio.id === id ? { ...servicio, ...datos } : servicio)))
  }

  function toggleActivo(id: string) {
    if (!USE_MOCKS) {
      // TODO: PATCH /api/v1/servicios/:id/toggle
      return
    }

    setServicios((prev) =>
      prev.map((servicio) =>
        servicio.id === id ? { ...servicio, isActive: !(servicio.isActive ?? true) } : servicio,
      ),
    )
  }

  function eliminarServicio(id: string) {
    if (!USE_MOCKS) {
      // TODO: DELETE /api/v1/servicios/:id
      return
    }

    const tieneTurnos = ['srv-1', 'srv-2'].includes(id)
    if (tieneTurnos) {
      throw new Error('No se puede eliminar un servicio con turnos asignados')
    }
    setServicios((prev) => prev.filter((servicio) => servicio.id !== id))
  }

  return { servicios, loading, error, agregarServicio, actualizarServicio, toggleActivo, eliminarServicio }
}
