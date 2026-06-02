import type { TurnoInput } from './agenda.schemas'

export class AgendaRepository {
  findAll() {
    return []
  }

  create(input: TurnoInput) {
    return { id: crypto.randomUUID(), ...input, estado: 'pendiente' as const }
  }
}

export const agendaRepository = new AgendaRepository()
