import { useState } from 'react'
import { MOCK_TURNOS_FIJOS } from '../../../mocks'
import type { TurnoFijo } from '../../../types'

const USE_MOCKS = import.meta.env.VITE_USE_MOCKS !== 'false'

function todayKey() {
  return new Date().toISOString().slice(0, 10)
}

export function useTurnosFijos() {
  const [turnosFijos, setTurnosFijos] = useState<TurnoFijo[]>(USE_MOCKS ? MOCK_TURNOS_FIJOS : [])
  const [loading] = useState(false)
  const [error] = useState<string | null>(null)

  function crearTurnoFijo(turnoFijo: TurnoFijo) {
    if (!USE_MOCKS) {
      // TODO: POST /api/v1/agenda/turnos-fijos
      return
    }

    setTurnosFijos((prev) => [...prev, turnoFijo])
  }

  function editarTurnoFijo(id: string, datos: Partial<TurnoFijo>) {
    if (!USE_MOCKS) {
      // TODO: PATCH /api/v1/agenda/turnos-fijos/:id
      return
    }

    setTurnosFijos((prev) => prev.map((turnoFijo) => (turnoFijo.id === id ? { ...turnoFijo, ...datos } : turnoFijo)))
  }

  function eliminarTurnoFijo(id: string) {
    if (!USE_MOCKS) {
      // TODO: DELETE /api/v1/agenda/turnos-fijos/:id
      return
    }

    setTurnosFijos((prev) => prev.filter((turnoFijo) => turnoFijo.id !== id))
  }

  function pausarTurnoFijo(id: string, hasta: string) {
    if (!USE_MOCKS) {
      // TODO: PATCH /api/v1/agenda/turnos-fijos/:id/pausar
      return
    }

    setTurnosFijos((prev) => prev.map((turnoFijo) => (turnoFijo.id === id ? { ...turnoFijo, pausadoHasta: hasta } : turnoFijo)))
  }

  function reanudarTurnoFijo(id: string) {
    if (!USE_MOCKS) {
      // TODO: PATCH /api/v1/agenda/turnos-fijos/:id/reanudar
      return
    }

    setTurnosFijos((prev) =>
      prev.map((turnoFijo) => {
        if (turnoFijo.id !== id) return turnoFijo
        const { pausadoHasta: _pausadoHasta, ...rest } = turnoFijo
        return rest
      }),
    )
  }

  function getTurnosFijosActivos() {
    const hoy = todayKey()
    return turnosFijos.filter((turnoFijo) => turnoFijo.activo && (!turnoFijo.pausadoHasta || turnoFijo.pausadoHasta < hoy))
  }

  return {
    turnosFijos,
    loading,
    error,
    crearTurnoFijo,
    editarTurnoFijo,
    eliminarTurnoFijo,
    pausarTurnoFijo,
    reanudarTurnoFijo,
    getTurnosFijosActivos,
  }
}
