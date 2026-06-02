import { useState } from 'react'
import { MOCK_BARBEROS, MOCK_HORARIOS } from '../../../mocks'
import type { Barbero, HorarioSemanal } from '../../../types'

const USE_MOCKS = import.meta.env.VITE_USE_MOCKS !== 'false'

export function useEquipo() {
  const [barberos, setBarberos] = useState<Barbero[]>(USE_MOCKS ? MOCK_BARBEROS : [])
  const [horarios, setHorarios] = useState<HorarioSemanal[]>(USE_MOCKS ? MOCK_HORARIOS : [])
  const [loading] = useState(false)
  const [error] = useState<string | null>(null)

  function agregarBarbero(barbero: Omit<Barbero, 'id'>) {
    if (!USE_MOCKS) {
      // TODO: POST /api/v1/equipo/barberos
      return
    }

    const nuevo: Barbero = { ...barbero, id: `barbero-${Date.now()}` }
    setBarberos((prev) => [nuevo, ...prev])
  }

  function actualizarBarbero(id: string, datos: Partial<Barbero>) {
    if (!USE_MOCKS) {
      // TODO: PATCH /api/v1/equipo/barberos/:id
      return
    }

    setBarberos((prev) => prev.map((barbero) => (barbero.id === id ? { ...barbero, ...datos } : barbero)))
  }

  function toggleActivo(id: string) {
    if (!USE_MOCKS) {
      // TODO: PATCH /api/v1/equipo/barberos/:id/toggle
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

  function actualizarHorario(horario: HorarioSemanal) {
    if (!USE_MOCKS) {
      // TODO: PUT /api/v1/equipo/barberos/:id/horario
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

  function eliminarBarbero(id: string) {
    if (!USE_MOCKS) {
      // TODO: DELETE /api/v1/equipo/barberos/:id
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
