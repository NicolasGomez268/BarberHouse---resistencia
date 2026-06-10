import { isAxiosError } from 'axios'
import { useEffect, useState } from 'react'
import type { CreateAppointmentParams } from '../lib/appointments'
import { apiClient } from '../../../shared/api/client'
import type { MetodoPago, Servicio, SucursalId, Turno, TurnoFijo } from '../../../types'

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

export function useTurnos(servicios: Servicio[] = [], sucursalId?: SucursalId) {
  const [turnos, setTurnos] = useState<Turno[]>([])
  const [turnosFijos, setTurnosFijos] = useState<TurnoFijo[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const params = sucursalId ? { sucursalId } : {}
    const load = async () => {
      setLoading(true)
      setError(null)
      try {
        const [{ data: td }, { data: fd }] = await Promise.all([
          apiClient.get<{ turnos: Turno[] }>('/agenda', { params }),
          apiClient.get<{ turnosFijos: TurnoFijo[] }>('/agenda/fijos', { params }),
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
  }, [sucursalId])

  async function crearTurno(params: CreateAppointmentParams) {
    const servicio = servicios.find((s) => s.id === params.serviceId)
    const horaFin = servicio ? addMinutes(params.startTime, servicio.duracionMinutos) : undefined
    try {
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
    } catch (error) {
      if (isAxiosError(error) && error.response?.status === 409) {
        throw new Error(error.response.data?.error ?? 'Ya existe un turno para ese horario', { cause: error })
      }
      throw new Error('Error al crear el turno', { cause: error })
    }
  }

  async function marcarRealizado(id: string, metodoPago: Turno['metodoPago']) {
    try {
      const { data } = await apiClient.patch<{ turno: Turno }>(`/agenda/${id}/realizado`, { metodoPago })
      setTurnos((prev) => prev.map((t) => (t.id === id ? data.turno : t)))
    } catch {
      setError('Error al marcar el turno como realizado')
    }
  }

  async function cancelarTurno(id: string) {
    try {
      const { data } = await apiClient.patch<{ turno: Turno }>(`/agenda/${id}/cancelar`)
      setTurnos((prev) => prev.map((t) => (t.id === id ? data.turno : t)))
    } catch {
      setError('Error al cancelar el turno')
    }
  }

  async function marcarNoAsistio(id: string) {
    try {
      const { data } = await apiClient.patch<{ turno: Turno }>(`/agenda/${id}/no-asistio`)
      setTurnos((prev) => prev.map((t) => (t.id === id ? data.turno : t)))
    } catch {
      setError('Error al registrar inasistencia')
    }
  }

  async function marcarAusenteFijo(turnoId: string) {
    try {
      const { data } = await apiClient.patch<{ turno: Turno }>(`/agenda/${turnoId}/ausente-fijo`)
      setTurnos((prev) => prev.map((t) => (t.id === turnoId ? data.turno : t)))
    } catch {
      setError('Error al registrar ausencia del turno fijo')
    }
  }

  async function liberarTurnoFijo(
    turnoId: string,
    nuevoCliente: {
      clienteNombre: string
      clienteTelefono?: string
      servicioId: string
      metodoPago?: MetodoPago
    },
  ) {
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
  }

  async function generarProximoTurnoFijo(turnoFijoId: string) {
    try {
      const { data } = await apiClient.post<{ turnos: Turno[] }>(`/agenda/fijos/${turnoFijoId}/generar-proximo`)
      if (data.turnos.length > 0) {
        setTurnos((prev) => [...prev, ...data.turnos])
      }
    } catch {
      // no-op: el turno fijo puede no existir aún en Firestore
    }
  }

  async function crearTurnoFijo(datos: Omit<TurnoFijo, 'id' | 'proximaFecha'>) {
    const proximaFecha = getProximaFecha(datos.fechasAgendadas)
    try {
      const { data } = await apiClient.post<{ turnoFijo: TurnoFijo }>('/agenda/fijos', { ...datos, proximaFecha })
      setTurnosFijos((prev) => [...prev, data.turnoFijo])
      await apiClient.post(`/agenda/fijos/${data.turnoFijo.id}/generar-proximo`)
      const loadParams = sucursalId ? { sucursalId } : {}
      const { data: refreshed } = await apiClient.get<{ turnos: Turno[] }>('/agenda', { params: loadParams })
      setTurnos(refreshed.turnos)
    } catch (error) {
      if (isAxiosError(error) && error.response?.status === 409) {
        throw new Error(error.response.data?.error ?? 'Ya existe un turno fijo en ese horario', { cause: error })
      }
      setError('Error al crear el turno fijo')
      throw new Error('Error al crear el turno fijo', { cause: error })
    }
  }

  async function editarTurnoFijo(id: string, datos: Partial<TurnoFijo>, cascadeToFutureTurnos = false) {
    try {
      const { data } = await apiClient.patch<{ turnoFijo: TurnoFijo }>(`/agenda/fijos/${id}`, {
        ...datos,
        cascadeToFutureTurnos,
      })
      setTurnosFijos((prev) => prev.map((tf) => (tf.id === id ? data.turnoFijo : tf)))
      if (cascadeToFutureTurnos) {
        const params = sucursalId ? { sucursalId } : {}
        const { data: refreshed } = await apiClient.get<{ turnos: Turno[] }>('/agenda', { params })
        setTurnos(refreshed.turnos)
      }
    } catch {
      setError('Error al editar el turno fijo')
    }
  }

  async function editarTurno(
    id: string,
    datos: { hora?: string; horaFin?: string; barberoId?: string; sucursalId?: SucursalId; servicioId?: string },
  ) {
    const { data } = await apiClient.patch<{ turno: Turno }>(`/agenda/${id}`, datos)
    setTurnos((prev) => prev.map((t) => (t.id === id ? data.turno : t)))
  }

  async function eliminarTurnoFijo(id: string) {
    try {
      await apiClient.delete(`/agenda/fijos/${id}`)
      setTurnosFijos((prev) => prev.filter((tf) => tf.id !== id))
    } catch {
      setError('Error al eliminar el turno fijo')
    }
  }

  return {
    turnos,
    turnosFijos,
    loading,
    error,
    crearTurno,
    marcarRealizado,
    cancelarTurno,
    marcarNoAsistio,
    marcarAusenteFijo,
    liberarTurnoFijo,
    generarProximoTurnoFijo,
    crearTurnoFijo,
    editarTurnoFijo,
    editarTurno,
    eliminarTurnoFijo,
  }
}
