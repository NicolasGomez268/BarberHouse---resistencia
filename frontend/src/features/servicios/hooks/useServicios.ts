import { useEffect, useState } from 'react'
import { MOCK_SERVICIOS } from '../../../mocks'
import { apiClient } from '../../../shared/api/client'
import type { Servicio } from '../../../types'

const USE_MOCKS = import.meta.env.VITE_USE_MOCKS !== 'false'

export function useServicios() {
  const [servicios, setServicios] = useState<Servicio[]>(USE_MOCKS ? MOCK_SERVICIOS : [])
  const [loading, setLoading] = useState(!USE_MOCKS)
  const [error, setError] = useState<string | null>(null)

  async function cargarServicios() {
    try {
      const { data } = await apiClient.get<{ servicios: Servicio[] }>('/servicios')
      setServicios(data.servicios)
    } catch {
      setError('Error al cargar los servicios')
    }
  }

  useEffect(() => {
    if (USE_MOCKS) return
    setLoading(true)
    cargarServicios().finally(() => setLoading(false))
  }, [])

  async function agregarServicio(servicio: Omit<Servicio, 'id'>) {
    if (!USE_MOCKS) {
      try {
        await apiClient.post('/servicios', servicio)
        await cargarServicios()
      } catch {
        setError('Error al crear el servicio')
      }
      return
    }
    const nuevo: Servicio = { ...servicio, id: `srv-${Date.now()}` }
    setServicios((prev) => [nuevo, ...prev])
  }

  async function actualizarServicio(id: string, datos: Partial<Servicio>) {
    if (!USE_MOCKS) {
      try {
        await apiClient.patch(`/servicios/${id}`, datos)
        await cargarServicios()
      } catch {
        setError('Error al actualizar el servicio')
      }
      return
    }
    setServicios((prev) => prev.map((servicio) => (servicio.id === id ? { ...servicio, ...datos } : servicio)))
  }

  async function toggleActivo(id: string) {
    if (!USE_MOCKS) {
      try {
        await apiClient.patch(`/servicios/${id}/toggle`)
        await cargarServicios()
      } catch {
        setError('Error al cambiar el estado del servicio')
      }
      return
    }
    setServicios((prev) =>
      prev.map((servicio) =>
        servicio.id === id ? { ...servicio, isActive: !(servicio.isActive ?? true) } : servicio,
      ),
    )
  }

  async function eliminarServicio(id: string) {
    if (!USE_MOCKS) {
      try {
        await apiClient.delete(`/servicios/${id}`)
        await cargarServicios()
      } catch {
        setError('Error al eliminar el servicio')
      }
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
