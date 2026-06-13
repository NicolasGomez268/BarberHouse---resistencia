import { ConflictError } from '../../shared/errors'
import { paquetesRepository } from '../paquetes/paquetes.repository'
import { agendaRepository } from './agenda.repository'
import type { TurnoInsertData } from './agenda.repository'
import type {
  CreateTurnoFijoInput,
  CreateTurnoInput,
  ReemplazoFijoInput,
  TurnoData,
  TurnoFijoData,
  TurnosFijosFilters,
  TurnosFilters,
  UpdateTurnoFijoInput,
  UpdateTurnoInput,
} from './agenda.schemas'

export class AgendaService {
  // ── Validación de conflictos ───────────────────────────────────────────────

  private async checkSlotConflict(
    barberoId: string,
    fecha: string,
    hora: string,
    opts: { excludeTurnoId?: string; excludeTurnoFijoId?: string } = {},
  ): Promise<void> {
    const [turnosPorFecha, fijosPorHora] = await Promise.all([
      agendaRepository.findTurnosByBarberoFecha(barberoId, fecha),
      agendaRepository.findTurnosFijosByBarberoHora(barberoId, hora),
    ])

    const hasConflict = turnosPorFecha.some((t) => {
      if (opts.excludeTurnoId && t.id === opts.excludeTurnoId) return false
      const estado = t.estado
      return (
        t.hora === hora &&
        estado !== 'CANCELADO' &&
        estado !== 'NO_ASISTIO' &&
        estado !== 'AUSENTE_FIJO'
      )
    })
    if (hasConflict) throw new ConflictError('El barbero ya tiene un turno en esa fecha y hora')

    const hasFijoConflict = fijosPorHora.some((fijo) => {
      if (opts.excludeTurnoFijoId && fijo.id === opts.excludeTurnoFijoId) return false
      const isScheduled = (fijo.fechasAgendadas ?? []).includes(fecha)
      if (!isScheduled) return false
      const isReleased = turnosPorFecha.some(
        (t) => t.turnoFijoId === fijo.id && t.estado === 'AUSENTE_FIJO',
      )
      return !isReleased
    })
    if (hasFijoConflict) throw new ConflictError('El barbero tiene un turno fijo programado en esa fecha y hora')
  }

  // ── Turnos ────────────────────────────────────────────────────────────────

  listTurnos(filters: TurnosFilters): Promise<TurnoData[]> {
    return agendaRepository.findTurnos(filters)
  }

  async createTurno(input: CreateTurnoInput, creadoPor: string): Promise<TurnoData> {
    await this.checkSlotConflict(input.barberoId, input.fecha, input.hora)
    if (input.paquetePrepagId) {
      await paquetesRepository.decrementarUso(input.paquetePrepagId)
    }
    return agendaRepository.insertTurno({
      ...input,
      prepagado: input.paquetePrepagId ? true : input.prepagado,
      creadoPor,
      estado: 'PENDIENTE',
    })
  }

  realizarTurno(id: string, metodoPago: string, montoEfectivo?: number, montoTransferencia?: number): Promise<TurnoData> {
    return agendaRepository.patchTurnoRealizado(id, metodoPago, montoEfectivo, montoTransferencia)
  }

  async updateTurno(id: string, input: UpdateTurnoInput): Promise<TurnoData> {
    const current = await agendaRepository.findTurno(id)
    if (!current) throw new Error('TURNO_NOT_FOUND')

    if (input.barberoId !== undefined || input.hora !== undefined) {
      await this.checkSlotConflict(
        input.barberoId ?? current.barberoId ?? '',
        current.fecha ?? '',
        input.hora ?? current.hora ?? '',
        { excludeTurnoId: id, excludeTurnoFijoId: current.turnoFijoId },
      )
    }

    return agendaRepository.patchTurno(id, input)
  }

  cancelarTurno(id: string): Promise<TurnoData> {
    return agendaRepository.patchTurnoEstado(id, 'CANCELADO')
  }

  marcarNoAsistio(id: string): Promise<TurnoData> {
    return agendaRepository.patchTurnoEstado(id, 'NO_ASISTIO')
  }

  marcarAusenteFijo(id: string): Promise<TurnoData> {
    return agendaRepository.patchTurnoEstado(id, 'AUSENTE_FIJO')
  }

  async liberarTurnoFijo(id: string, data: ReemplazoFijoInput, creadoPor: string): Promise<TurnoData> {
    const original = await agendaRepository.findTurno(id)
    if (!original) throw new Error('TURNO_NOT_FOUND')

    const reemplazo = await agendaRepository.insertTurno({
      sucursalId: original.sucursalId,
      barberoId: original.barberoId,
      fecha: original.fecha,
      hora: original.hora,
      horaFin: original.horaFin,
      servicioId: data.servicioId,
      clienteNombre: data.clienteNombre,
      clienteTelefono: data.clienteTelefono,
      metodoPago: data.metodoPago,
      estado: 'PENDIENTE',
      esFijo: false,
      esReemplazoFijo: true,
      turnoOriginalId: id,
      creadoPor,
    })

    await agendaRepository.patchTurnoEstado(id, 'AUSENTE_FIJO')
    return reemplazo
  }

  // ── Turnos Fijos ──────────────────────────────────────────────────────────

  listTurnosFijos(filters: TurnosFijosFilters): Promise<TurnoFijoData[]> {
    return agendaRepository.findTurnosFijos(filters)
  }

  async createTurnoFijo(input: CreateTurnoFijoInput): Promise<TurnoFijoData> {
    const fechasSet = new Set(input.fechasAgendadas)

    const [fijosPorHora, turnosPorHora] = await Promise.all([
      agendaRepository.findTurnosFijosByBarberoHora(input.barberoId, input.hora),
      agendaRepository.findTurnosByBarberoHora(input.barberoId, input.hora),
    ])

    const fijoConflict = fijosPorHora.some((fijo) => {
      const existing = fijo.fechasAgendadas ?? []
      return existing.some((f) => fechasSet.has(f))
    })
    if (fijoConflict) {
      throw new ConflictError('El barbero ya tiene un turno fijo en ese horario para alguna de las fechas seleccionadas')
    }

    const turnoConflict = turnosPorHora.some((t) => {
      const estado = t.estado
      if (estado === 'CANCELADO' || estado === 'NO_ASISTIO' || estado === 'AUSENTE_FIJO') return false
      return fechasSet.has(t.fecha ?? '')
    })
    if (turnoConflict) {
      throw new ConflictError('Ya existe un turno en ese horario para alguna de las fechas seleccionadas')
    }

    return agendaRepository.insertTurnoFijo(input)
  }

  async updateTurnoFijo(id: string, input: UpdateTurnoFijoInput): Promise<TurnoFijoData> {
    const { cascadeToFutureTurnos, ...updateData } = input
    const fijo = await agendaRepository.patchTurnoFijo(id, updateData)

    if (cascadeToFutureTurnos) {
      const cascadeFields: Record<string, unknown> = {}
      if (updateData.barberoId) cascadeFields['barberoId'] = updateData.barberoId
      if (updateData.servicioId) cascadeFields['servicioId'] = updateData.servicioId
      if (updateData.clienteNombre) cascadeFields['clienteNombre'] = updateData.clienteNombre
      if (updateData.clienteTelefono !== undefined) cascadeFields['clienteTelefono'] = updateData.clienteTelefono
      if (updateData.hora) cascadeFields['hora'] = updateData.hora
      if (updateData.sucursalId) cascadeFields['sucursalId'] = updateData.sucursalId

      if (Object.keys(cascadeFields).length > 0) {
        const hoy = new Date().toLocaleDateString('en-CA', { timeZone: 'America/Argentina/Buenos_Aires' })
        const linkedTurnos = await agendaRepository.findTurnosByFijoId(id)
        const updates = linkedTurnos
          .filter((t) => (t.fecha ?? '') >= hoy && (t.estado === 'PENDIENTE' || t.estado === 'CONFIRMADO'))
          .map((t) => ({ id: t.id, data: cascadeFields }))
        if (updates.length > 0) {
          await agendaRepository.batchUpdateTurnos(updates)
        }
      }
    }

    return fijo
  }

  async deleteTurnoFijo(id: string): Promise<void> {
    const fijo = await agendaRepository.findTurnoFijo(id)
    if (!fijo) throw new Error('TURNO_FIJO_NOT_FOUND')

    const hoy = new Date().toLocaleDateString('en-CA', { timeZone: 'America/Argentina/Buenos_Aires' })
    const linkedTurnos = await agendaRepository.findTurnosByFijoId(id)
    const turnoIdsAEliminar = linkedTurnos
      .filter((t) => (t.fecha ?? '') >= hoy && (t.estado === 'PENDIENTE' || t.estado === 'CONFIRMADO'))
      .map((t) => t.id)

    await agendaRepository.batchDeleteTurnoFijoYTurnos(id, turnoIdsAEliminar)
  }

  async generarProximoTurnoFijo(id: string, creadoPor: string): Promise<TurnoData[]> {
    const fijo = await agendaRepository.findTurnoFijo(id)
    if (!fijo) throw new Error('TURNO_FIJO_NOT_FOUND')

    const hoy = new Date().toLocaleDateString('en-CA', { timeZone: 'America/Argentina/Buenos_Aires' })
    const fechasFuturas = fijo.fechasAgendadas.filter((f) => f >= hoy).sort()

    const existingTurnos = await agendaRepository.findTurnosByFijoId(id)
    const existingFechas = new Set(
      existingTurnos.filter((t) => t.estado !== 'CANCELADO').map((t) => t.fecha as string),
    )

    const fechasPendientes = fechasFuturas.filter((f) => !existingFechas.has(f))
    if (fechasPendientes.length === 0) return []

    if (fijo.paquetePrepagId) {
      for (const _ of fechasPendientes) {
        await paquetesRepository.decrementarUso(fijo.paquetePrepagId)
      }
    }

    const turnosData: TurnoInsertData[] = fechasPendientes.map((fecha) => ({
      sucursalId: fijo.sucursalId,
      barberoId: fijo.barberoId,
      servicioId: fijo.servicioId,
      clienteNombre: fijo.clienteNombre,
      clienteTelefono: fijo.clienteTelefono,
      fecha,
      hora: fijo.hora,
      estado: 'PENDIENTE',
      esFijo: true,
      turnoFijoId: id,
      prepagado: fijo.paquetePrepagId ? true : fijo.prepagado,
      paquetePrepagId: fijo.paquetePrepagId,
      creadoPor,
    }))

    return agendaRepository.insertTurnos(turnosData)
  }
}

export const agendaService = new AgendaService()
