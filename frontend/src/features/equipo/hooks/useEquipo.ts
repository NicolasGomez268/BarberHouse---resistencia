import { useEffect, useState } from 'react'
import { apiClient } from '../../../shared/api/client'
import type { Barbero, HorarioSemanal } from '../../../types'

export function useEquipo() {
  const [barberos, setBarberos] = useState<Barbero[]>([])
  const [horarios, setHorarios] = useState<HorarioSemanal[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  async function cargarEquipo() {
    try {
      const { data } = await apiClient.get<{ barberos: Barbero[]; horarios: HorarioSemanal[] }>('/equipo')
      setBarberos(data.barberos)
      setHorarios(data.horarios)
    } catch {
      setError('Error al cargar el equipo')
    }
  }

  useEffect(() => {
    setLoading(true)
    cargarEquipo().finally(() => setLoading(false))
  }, [])

  async function agregarBarbero(barbero: Omit<Barbero, 'id'>): Promise<string | null> {
    try {
      const { data } = await apiClient.post<{ barbero: Barbero; invitacionUrl: string }>('/equipo', barbero)
      await cargarEquipo()
      return data.invitacionUrl
    } catch {
      setError('Error al crear el barbero')
      return null
    }
  }

  async function actualizarBarbero(id: string, datos: Partial<Barbero>) {
    try {
      await apiClient.patch(`/equipo/${id}`, datos)
      await cargarEquipo()
    } catch {
      setError('Error al actualizar el barbero')
    }
  }

  async function toggleActivo(id: string) {
    try {
      await apiClient.patch(`/equipo/${id}/toggle`)
      await cargarEquipo()
    } catch {
      setError('Error al cambiar el estado del barbero')
    }
  }

  async function actualizarHorario(horario: HorarioSemanal) {
    try {
      await apiClient.put(`/equipo/${horario.barberoId}/horario`, horario)
      setHorarios((prev) => {
        const existe = prev.find((h) => h.barberoId === horario.barberoId)
        if (existe) return prev.map((h) => (h.barberoId === horario.barberoId ? horario : h))
        return [...prev, horario]
      })
    } catch {
      setError('Error al guardar el horario')
    }
  }

  async function eliminarBarbero(id: string) {
    try {
      await apiClient.delete(`/equipo/${id}`)
      await cargarEquipo()
    } catch {
      setError('Error al eliminar el barbero')
    }
  }

  return {
    barberos,
    horarios,
    loading,
    error,
    agregarBarbero,
    actualizarBarbero,
    toggleActivo,
    actualizarHorario,
    eliminarBarbero,
  }
}
