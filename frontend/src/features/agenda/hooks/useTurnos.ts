import { useState } from 'react'
import { createAppointment, type CreateAppointmentParams } from '../lib/appointments'
import { MOCK_TURNOS } from '../../../mocks'
import { MOCK_BARBEROS, MOCK_HORARIOS, MOCK_SERVICIOS } from '../../../mocks'
import type { Turno } from '../../../types'

const USE_MOCKS = import.meta.env.VITE_USE_MOCKS !== 'false'

export function useTurnos() {
  const [turnos, setTurnos] = useState<Turno[]>(USE_MOCKS ? MOCK_TURNOS : [])
  const [loading] = useState(false)
  const [error] = useState<string | null>(null)

  function agregarTurno(turno: Omit<Turno, 'id'>) {
    if (!USE_MOCKS) {
      // TODO: POST /api/v1/agenda/turnos
      return
    }

    const nuevo: Turno = { ...turno, id: `t-${Date.now()}` }
    setTurnos((prev) => [...prev, nuevo])
  }

  function crearTurno(params: CreateAppointmentParams) {
    if (!USE_MOCKS) {
      // TODO: POST /api/v1/agenda/turnos
      return
    }

    setTurnos((prev) => [
      ...prev,
      createAppointment(params, {
        turnos: prev,
        barberos: MOCK_BARBEROS,
        servicios: MOCK_SERVICIOS,
        horarios: MOCK_HORARIOS,
      }),
    ])
  }

  function marcarRealizado(id: string, metodoPago: Turno['metodoPago']) {
    if (!USE_MOCKS) {
      // TODO: PATCH /api/v1/agenda/turnos/:id/realizado
      return
    }

    setTurnos((prev) =>
      prev.map((turno) => (turno.id === id ? { ...turno, estado: 'REALIZADO', metodoPago } : turno)),
    )
  }

  function cancelarTurno(id: string) {
    if (!USE_MOCKS) {
      // TODO: PATCH /api/v1/agenda/turnos/:id/cancelar
      return
    }

    setTurnos((prev) => prev.map((turno) => (turno.id === id ? { ...turno, estado: 'CANCELADO' } : turno)))
  }

  function marcarNoAsistio(id: string) {
    if (!USE_MOCKS) {
      // TODO: PATCH /api/v1/agenda/turnos/:id/no-asistio
      return
    }

    setTurnos((prev) => prev.map((turno) => (turno.id === id ? { ...turno, estado: 'NO_ASISTIO' } : turno)))
  }

  return { turnos, loading, error, agregarTurno, crearTurno, marcarRealizado, cancelarTurno, marcarNoAsistio }
}
