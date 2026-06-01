import type { MiembroEquipoInput } from './equipo.schemas'

export class EquipoRepository {
  findAll() {
    return []
  }

  create(input: MiembroEquipoInput) {
    return { id: crypto.randomUUID(), ...input }
  }
}

export const equipoRepository = new EquipoRepository()
