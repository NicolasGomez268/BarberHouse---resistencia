import type { ServicioInput } from './servicios.schemas'

export class ServiciosRepository {
  findAll() {
    return []
  }

  create(input: ServicioInput) {
    return { id: crypto.randomUUID(), ...input }
  }
}

export const serviciosRepository = new ServiciosRepository()
