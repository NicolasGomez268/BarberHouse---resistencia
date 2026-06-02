import { useState } from 'react'
import { createAppointment, type CreateAppointmentParams } from '../lib/appointments'
import { MOCK_BARBEROS, MOCK_HORARIOS, MOCK_SERVICIOS, MOCK_TURNOS, MOCK_TURNOS_FIJOS } from '../../../mocks'
import type { MetodoPago, MetodoPagoMock, Turno, TurnoFijo } from '../../../types'

const USE_MOCKS = import.meta.env.VITE_USE_MOCKS !== 'false'

function addMinutes(time: string, minutesToAdd: number) {
  const [hours, minutes] = time.split(':').map(Number)
  const totalMinutes = hours * 60 + minutes + minutesToAdd
  return `${String(Math.floor(totalMinutes / 60)).padStart(2, '0')}:${String(totalMinutes % 60).padStart(2, '0')}`
}

export function useTurnos() {
  const [turnos, setTurnos] = useState<Turno[]>(USE_MOCKS ? MOCK_TURNOS : [])
  const [turnosFijos, setTurnosFijos] = useState<TurnoFijo[]>(USE_MOCKS ? MOCK_TURNOS_FIJOS : [])
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
        turnosFijos,
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

  function marcarAusenteFijo(turnoId: string) {
    if (!USE_MOCKS) {
      // TODO: PATCH /api/v1/agenda/turnos/:id/ausente-fijo
      return
    }

    setTurnos((prev) => prev.map((turno) => (turno.id === turnoId ? { ...turno, estado: 'AUSENTE_FIJO' } : turno)))
  }

  function liberarTurnoFijo(
    turnoId: string,
    nuevoCliente: {
      clienteNombre: string
      clienteTelefono?: string
      servicioId: string
      metodoPago?: MetodoPago | MetodoPagoMock
    },
  ) {
    if (!USE_MOCKS) {
      // TODO: POST /api/v1/agenda/turnos/:id/reemplazo-fijo
      return
    }

    setTurnos((prev) => {
      const turnoOriginal = prev.find((turno) => turno.id === turnoId && turno.estado === 'AUSENTE_FIJO')
      if (!turnoOriginal) return prev
      const servicio = MOCK_SERVICIOS.find((current) => current.id === nuevoCliente.servicioId)

      const reemplazo: Turno = {
        id: `reemplazo-fijo-${Date.now()}`,
        sucursalId: turnoOriginal.sucursalId,
        fecha: turnoOriginal.fecha,
        hora: turnoOriginal.hora,
        horaFin:
          turnoOriginal.hora && servicio
            ? addMinutes(turnoOriginal.hora, servicio.duracionMinutos)
            : turnoOriginal.horaFin,
        barberoId: turnoOriginal.barberoId,
        servicioId: nuevoCliente.servicioId,
        clienteNombre: nuevoCliente.clienteNombre,
        clienteTelefono: nuevoCliente.clienteTelefono,
        metodoPago: nuevoCliente.metodoPago,
        estado: 'PENDIENTE',
        esFijo: false,
        esReemplazoFijo: true,
        turnoOriginalId: turnoOriginal.id,
        creadoPor: turnoOriginal.barberoId,
      }

      return [...prev, reemplazo]
    })
  }

  function generarProximoTurnoFijo(turnoFijoId: string) {
    if (!USE_MOCKS) {
      // TODO: POST /api/v1/agenda/turnos-fijos/:id/generar-proximo
      return
    }

    setTurnosFijos((prev) => {
      const turnoFijo = prev.find((current) => current.id === turnoFijoId)
      if (!turnoFijo) return prev

      const hoy = new Date().toISOString().slice(0, 10)
      const servicio = MOCK_SERVICIOS.find((current) => current.id === turnoFijo.servicioId)
      const fechasFuturas = turnoFijo.fechasAgendadas.filter((fecha) => fecha >= hoy).sort()

      setTurnos((currentTurnos) => {
        const fechasPendientes = fechasFuturas.filter(
          (fecha) =>
            !currentTurnos.some(
              (turno) => turno.turnoFijoId === turnoFijo.id && turno.fecha === fecha && turno.estado !== 'CANCELADO',
            ),
        )

        const nuevosTurnos = fechasPendientes.map((fecha) => ({
          id: `fijo-${turnoFijo.id}-${fecha}`,
          sucursalId: turnoFijo.sucursalId,
          fecha,
          hora: turnoFijo.hora,
          horaFin: servicio ? addMinutes(turnoFijo.hora, servicio.duracionMinutos) : undefined,
          barberoId: turnoFijo.barberoId,
          servicioId: turnoFijo.servicioId,
          clienteNombre: turnoFijo.clienteNombre,
          clienteTelefono: turnoFijo.clienteTelefono,
          estado: 'PENDIENTE' as const,
          esFijo: true,
          turnoFijoId: turnoFijo.id,
          creadoPor: 'sistema',
        }))

        return [...currentTurnos, ...nuevosTurnos]
      })

      const proximaFecha = fechasFuturas[0] ?? turnoFijo.fechasAgendadas.sort()[0] ?? turnoFijo.proximaFecha

      return prev.map((current) => (current.id === turnoFijoId ? { ...current, proximaFecha } : current))
    })
  }

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
    const hoy = new Date().toISOString().slice(0, 10)
    return turnosFijos.filter((turnoFijo) => turnoFijo.activo && (!turnoFijo.pausadoHasta || turnoFijo.pausadoHasta < hoy))
  }

  return {
    turnos,
    turnosFijos,
    loading,
    error,
    agregarTurno,
    crearTurno,
    marcarRealizado,
    cancelarTurno,
    marcarNoAsistio,
    marcarAusenteFijo,
    liberarTurnoFijo,
    generarProximoTurnoFijo,
    crearTurnoFijo,
    editarTurnoFijo,
    eliminarTurnoFijo,
    pausarTurnoFijo,
    reanudarTurnoFijo,
    getTurnosFijosActivos,
  }
}
