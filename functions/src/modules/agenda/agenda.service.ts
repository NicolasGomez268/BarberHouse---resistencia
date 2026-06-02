import { agendaRepository } from './agenda.repository'
import type { TurnoInput } from './agenda.schemas'

export class AgendaService {
  list() {
    return agendaRepository.findAll()
  }

  create(input: TurnoInput) {
    return agendaRepository.create(input)
  }
}

export const agendaService = new AgendaService()
