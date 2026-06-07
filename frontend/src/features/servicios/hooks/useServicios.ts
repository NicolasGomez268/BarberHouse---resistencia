import { isAxiosError } from 'axios'
import { useEffect, useState } from 'react'
import { apiClient } from '../../../shared/api/client'
import type { Servicio } from '../../../types'

export function useServicios() {
  const [servicios, setServicios] = useState<Servicio[]>([])
  const [loading, setLoading] = useState(true)
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
    setLoading(true)
    cargarServicios().finally(() => setLoading(false))
  }, [])

  async function agregarServicio(servicio: Omit<Servicio, 'id'>) {
    try {
      await apiClient.post('/servicios', servicio)
      await cargarServicios()
    } catch {
      setError('Error al crear el servicio')
    }
  }

  async function actualizarServicio(id: string, datos: Partial<Servicio>) {
    try {
      await apiClient.patch(`/servicios/${id}`, datos)
      await cargarServicios()
    } catch {
      setError('Error al actualizar el servicio')
    }
  }

  async function toggleActivo(id: string) {
    try {
      await apiClient.patch(`/servicios/${id}/toggle`)
      await cargarServicios()
    } catch {
      setError('Error al cambiar el estado del servicio')
    }
  }

  async function eliminarServicio(id: string) {
    try {
      await apiClient.delete(`/servicios/${id}`)
      await cargarServicios()
    } catch (error) {
      if (isAxiosError(error) && error.response?.status === 409) {
        throw new Error(error.response.data?.error ?? 'No se puede eliminar un servicio con turnos asignados')
      }
      setError('Error al eliminar el servicio')
    }
  }

  return { servicios, loading, error, agregarServicio, actualizarServicio, toggleActivo, eliminarServicio }
}
