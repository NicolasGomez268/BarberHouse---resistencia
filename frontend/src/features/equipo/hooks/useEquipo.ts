import { useEffect, useState } from 'react'
import { MOCK_BARBEROS, MOCK_HORARIOS } from '../../../mocks'
import { apiClient } from '../../../shared/api/client'
import type { Barbero, HorarioSemanal } from '../../../types'

const USE_MOCKS = import.meta.env.VITE_USE_MOCKS !== 'false'

export function useEquipo() {
  const [barberos, setBarberos] = useState<Barbero[]>(USE_MOCKS ? MOCK_BARBEROS : [])
  const [horarios, setHorarios] = useState<HorarioSemanal[]>(USE_MOCKS ? MOCK_HORARIOS : [])
  const [loading, setLoading] = useState(!USE_MOCKS)
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
    if (USE_MOCKS) return
    setLoading(true)
    cargarEquipo().finally(() => setLoading(false))
  }, [])

  async function agregarBarbero(barbero: Omit<Barbero, 'id'>) {
    if (!USE_MOCKS) {
      try {
        await apiClient.post('/equipo', barbero)
        await cargarEquipo()
      } catch {
        setError('Error al crear el barbero')
      }
      return
    }
    const nuevo: Barbero = { ...barbero, id: `barbero-${Date.now()}` }
    setBarberos((prev) => [nuevo, ...prev])
  }

  async function actualizarBarbero(id: string, datos: Partial<Barbero>) {
    if (!USE_MOCKS) {
      try {
        await apiClient.patch(`/equipo/${id}`, datos)
        await cargarEquipo()
      } catch {
        setError('Error al actualizar el barbero')
      }
      return
    }
    setBarberos((prev) => prev.map((barbero) => (barbero.id === id ? { ...barbero, ...datos } : barbero)))
  }

  async function toggleActivo(id: string) {
    if (!USE_MOCKS) {
      try {
        await apiClient.patch(`/equipo/${id}/toggle`)
        await cargarEquipo()
      } catch {
        setError('Error al cambiar el estado del barbero')
      }
      return
    }
    setBarberos((prev) =>
      prev.map((barbero) => {
        if (barbero.id !== id) return barbero
        const isActive = !(barbero.isActive ?? barbero.activo ?? false)
        return { ...barbero, isActive, activo: isActive }
      }),
    )
  }

  async function actualizarHorario(horario: HorarioSemanal) {
    if (!USE_MOCKS) {
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
      return
    }
    setHorarios((prev) => {
      const existe = prev.find((current) => current.barberoId === horario.barberoId)
      if (existe) {
        return prev.map((current) => (current.barberoId === horario.barberoId ? horario : current))
      }
      return [...prev, horario]
    })
  }

  async function eliminarBarbero(id: string) {
    if (!USE_MOCKS) {
      try {
        await apiClient.delete(`/equipo/${id}`)
        await cargarEquipo()
      } catch {
        setError('Error al eliminar el barbero')
      }
      return
    }
    setBarberos((prev) => prev.filter((barbero) => barbero.id !== id))
    setHorarios((prev) => prev.filter((horario) => horario.barberoId !== id))
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
