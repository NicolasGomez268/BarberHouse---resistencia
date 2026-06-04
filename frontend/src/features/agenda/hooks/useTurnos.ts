import { useEffect, useState } from 'react'
import { createAppointment, type CreateAppointmentParams } from '../lib/appointments'
import { MOCK_BARBEROS, MOCK_HORARIOS, MOCK_SERVICIOS, MOCK_TURNOS, MOCK_TURNOS_FIJOS } from '../../../mocks'
import { apiClient } from '../../../shared/api/client'
import type { MetodoPago, MetodoPagoMock, Servicio, SucursalId, Turno, TurnoFijo } from '../../../types'

const USE_MOCKS = import.meta.env.VITE_USE_MOCKS !== 'false'

function addMinutes(time: string, minutesToAdd: number) {
  const [hours, minutes] = time.split(':').map(Number)
  const totalMinutes = hours * 60 + minutes + minutesToAdd
  return `${String(Math.floor(totalMinutes / 60)).padStart(2, '0')}:${String(totalMinutes % 60).padStart(2, '0')}`
}

function getProximaFecha(fechasAgendadas: string[]) {
  const hoy = new Date().toISOString().slice(0, 10)
  const sorted = [...fechasAgendadas].sort()
  return sorted.find((f) => f >= hoy) ?? sorted[0] ?? hoy
}

export function useTurnos(servicios: Servicio[] = []) {
  const [turnos, setTurnos] = useState<Turno[]>(USE_MOCKS ? MOCK_TURNOS : [])
  const [turnosFijos, setTurnosFijos] = useState<TurnoFijo[]>(USE_MOCKS ? MOCK_TURNOS_FIJOS : [])
  const [loading, setLoading] = useState(!USE_MOCKS)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (USE_MOCKS) return
    const load = async () => {
      setLoading(true)
      setError(null)
      try {
        const [{ data: td }, { data: fd }] = await Promise.all([
          apiClient.get<{ turnos: Turno[] }>('/agenda'),
          apiClient.get<{ turnosFijos: TurnoFijo[] }>('/agenda/fijos'),
        ])
        setTurnos(td.turnos)
        setTurnosFijos(fd.turnosFijos)
      } catch {
        setError('Error al cargar la agenda')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  async function agregarTurno(turno: Omit<Turno, 'id'>) {
    if (!USE_MOCKS) {
      try {
        const { data } = await apiClient.post<{ turno: Turno }>('/agenda', turno)
        setTurnos((prev) => [...prev, data.turno])
      } catch {
        setError('Error al crear el turno')
      }
      return
    }
    const nuevo: Turno = { ...turno, id: `t-${Date.now()}` }
    setTurnos((prev) => [...prev, nuevo])
  }

  async function crearTurno(params: CreateAppointmentParams) {
    if (!USE_MOCKS) {
      try {
        const servicio = servicios.find((s) => s.id === params.serviceId)
        const horaFin = servicio ? addMinutes(params.startTime, servicio.duracionMinutos) : undefined
        const { data } = await apiClient.post<{ turno: Turno }>('/agenda', {
          sucursalId: params.sucursalId,
          barberoId: params.barberId,
          servicioId: params.serviceId,
          clienteNombre: params.clienteNombre,
          clienteTelefono: params.clienteTelefono,
          fecha: params.date,
          hora: params.startTime,
          horaFin,
        })
        setTurnos((prev) => [...prev, data.turno])
      } catch {
        setError('Error al crear el turno')
      }
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

  async function marcarRealizado(id: string, metodoPago: Turno['metodoPago']) {
    if (!USE_MOCKS) {
      try {
        const { data } = await apiClient.patch<{ turno: Turno }>(`/agenda/${id}/realizado`, { metodoPago })
        setTurnos((prev) => prev.map((t) => (t.id === id ? data.turno : t)))
      } catch {
        setError('Error al marcar el turno como realizado')
      }
      return
    }
    setTurnos((prev) =>
      prev.map((turno) => (turno.id === id ? { ...turno, estado: 'REALIZADO', metodoPago } : turno)),
    )
  }

  async function cancelarTurno(id: string) {
    if (!USE_MOCKS) {
      try {
        const { data } = await apiClient.patch<{ turno: Turno }>(`/agenda/${id}/cancelar`)
        setTurnos((prev) => prev.map((t) => (t.id === id ? data.turno : t)))
      } catch {
        setError('Error al cancelar el turno')
      }
      return
    }
    setTurnos((prev) => prev.map((turno) => (turno.id === id ? { ...turno, estado: 'CANCELADO' } : turno)))
  }

  async function marcarNoAsistio(id: string) {
    if (!USE_MOCKS) {
      try {
        const { data } = await apiClient.patch<{ turno: Turno }>(`/agenda/${id}/no-asistio`)
        setTurnos((prev) => prev.map((t) => (t.id === id ? data.turno : t)))
      } catch {
        setError('Error al registrar inasistencia')
      }
      return
    }
    setTurnos((prev) => prev.map((turno) => (turno.id === id ? { ...turno, estado: 'NO_ASISTIO' } : turno)))
  }

  async function marcarAusenteFijo(turnoId: string) {
    if (!USE_MOCKS) {
      try {
        const { data } = await apiClient.patch<{ turno: Turno }>(`/agenda/${turnoId}/ausente-fijo`)
        setTurnos((prev) => prev.map((t) => (t.id === turnoId ? data.turno : t)))
      } catch {
        setError('Error al registrar ausencia del turno fijo')
      }
      return
    }
    setTurnos((prev) => prev.map((turno) => (turno.id === turnoId ? { ...turno, estado: 'AUSENTE_FIJO' } : turno)))
  }

  async function liberarTurnoFijo(
    turnoId: string,
    nuevoCliente: {
      clienteNombre: string
      clienteTelefono?: string
      servicioId: string
      metodoPago?: MetodoPago | MetodoPagoMock
    },
  ) {
    if (!USE_MOCKS) {
      try {
        const { data } = await apiClient.post<{ turno: Turno }>(`/agenda/${turnoId}/reemplazo-fijo`, nuevoCliente)
        setTurnos((prev) =>
          prev
            .map((t) => (t.id === turnoId ? { ...t, estado: 'AUSENTE_FIJO' as const } : t))
            .concat(data.turno),
        )
      } catch {
        setError('Error al asignar el reemplazo')
      }
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

  async function generarProximoTurnoFijo(turnoFijoId: string) {
    if (!USE_MOCKS) {
      try {
        const { data } = await apiClient.post<{ turnos: Turno[] }>(`/agenda/fijos/${turnoFijoId}/generar-proximo`)
        if (data.turnos.length > 0) {
          setTurnos((prev) => [...prev, ...data.turnos])
        }
      } catch {
        // no-op: puede que el fijo no exista aún en Firestore
      }
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

  async function crearTurnoFijo(turnoFijo: TurnoFijo) {
    if (!USE_MOCKS) {
      try {
        const { id: _id, proximaFecha: _pf, ...datos } = turnoFijo
        const proximaFecha = getProximaFecha(datos.fechasAgendadas)
        const { data } = await apiClient.post<{ turnoFijo: TurnoFijo }>('/agenda/fijos', {
          ...datos,
          proximaFecha,
        })
        setTurnosFijos((prev) => [...prev, data.turnoFijo])
        // genera los turnos con el ID real de Firestore
        const { data: td } = await apiClient.post<{ turnos: Turno[] }>(`/agenda/fijos/${data.turnoFijo.id}/generar-proximo`)
        if (td.turnos.length > 0) setTurnos((prev) => [...prev, ...td.turnos])
      } catch {
        setError('Error al crear el turno fijo')
      }
      return
    }
    setTurnosFijos((prev) => [...prev, turnoFijo])
  }

  async function editarTurnoFijo(id: string, datos: Partial<TurnoFijo>) {
    if (!USE_MOCKS) {
      try {
        const { data } = await apiClient.patch<{ turnoFijo: TurnoFijo }>(`/agenda/fijos/${id}`, datos)
        setTurnosFijos((prev) => prev.map((tf) => (tf.id === id ? data.turnoFijo : tf)))
      } catch {
        setError('Error al editar el turno fijo')
      }
      return
    }
    setTurnosFijos((prev) => prev.map((turnoFijo) => (turnoFijo.id === id ? { ...turnoFijo, ...datos } : turnoFijo)))
  }

  async function eliminarTurnoFijo(id: string) {
    if (!USE_MOCKS) {
      try {
        await apiClient.delete(`/agenda/fijos/${id}`)
        setTurnosFijos((prev) => prev.filter((tf) => tf.id !== id))
      } catch {
        setError('Error al eliminar el turno fijo')
      }
      return
    }
    setTurnosFijos((prev) => prev.filter((turnoFijo) => turnoFijo.id !== id))
  }

  async function pausarTurnoFijo(id: string, hasta: string) {
    if (!USE_MOCKS) {
      try {
        const { data } = await apiClient.patch<{ turnoFijo: TurnoFijo }>(`/agenda/fijos/${id}/pausar`, { hasta })
        setTurnosFijos((prev) => prev.map((tf) => (tf.id === id ? data.turnoFijo : tf)))
      } catch {
        setError('Error al pausar el turno fijo')
      }
      return
    }
    setTurnosFijos((prev) => prev.map((turnoFijo) => (turnoFijo.id === id ? { ...turnoFijo, pausadoHasta: hasta } : turnoFijo)))
  }

  async function reanudarTurnoFijo(id: string) {
    if (!USE_MOCKS) {
      try {
        const { data } = await apiClient.patch<{ turnoFijo: TurnoFijo }>(`/agenda/fijos/${id}/reanudar`)
        setTurnosFijos((prev) => prev.map((tf) => (tf.id === id ? data.turnoFijo : tf)))
      } catch {
        setError('Error al reanudar el turno fijo')
      }
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
