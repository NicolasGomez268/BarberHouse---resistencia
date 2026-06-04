import { agendaRepository } from './agenda.repository'
import type {
  CreateTurnoFijoInput,
  CreateTurnoInput,
  PausarTurnoFijoInput,
  ReemplazoFijoInput,
  TurnosFijosFilters,
  TurnosFilters,
  UpdateTurnoFijoInput,
} from './agenda.schemas'

export class AgendaService {
  // ── Turnos ────────────────────────────────────────────────────────────────

  listTurnos(filters: TurnosFilters) {
    return agendaRepository.findAllTurnos(filters)
  }

  createTurno(input: CreateTurnoInput, creadoPor: string) {
    return agendaRepository.createTurno({ ...input, creadoPor })
  }

  realizarTurno(id: string, metodoPago: string) {
    return agendaRepository.realizarTurno(id, metodoPago)
  }

  cancelarTurno(id: string) {
    return agendaRepository.updateTurnoEstado(id, 'CANCELADO')
  }

  marcarNoAsistio(id: string) {
    return agendaRepository.updateTurnoEstado(id, 'NO_ASISTIO')
  }

  marcarAusenteFijo(id: string) {
    return agendaRepository.updateTurnoEstado(id, 'AUSENTE_FIJO')
  }

  liberarTurnoFijo(id: string, data: ReemplazoFijoInput, creadoPor: string) {
    return agendaRepository.createReemplazoFijo(id, data, creadoPor)
  }

  // ── Turnos Fijos ──────────────────────────────────────────────────────────

  listTurnosFijos(filters: TurnosFijosFilters) {
    return agendaRepository.findAllTurnosFijos(filters)
  }

  createTurnoFijo(input: CreateTurnoFijoInput) {
    return agendaRepository.createTurnoFijo(input)
  }

  updateTurnoFijo(id: string, input: UpdateTurnoFijoInput) {
    return agendaRepository.updateTurnoFijo(id, input)
  }

  deleteTurnoFijo(id: string) {
    return agendaRepository.deleteTurnoFijo(id)
  }

  pausarTurnoFijo(id: string, input: PausarTurnoFijoInput) {
    return agendaRepository.pausarTurnoFijo(id, input.hasta)
  }

  reanudarTurnoFijo(id: string) {
    return agendaRepository.reanudarTurnoFijo(id)
  }

  generarProximoTurnoFijo(id: string, creadoPor: string) {
    return agendaRepository.generarProximoTurnoFijo(id, creadoPor)
  }
}

export const agendaService = new AgendaService()
