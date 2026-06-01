import { serviciosRepository } from './servicios.repository'
import type { ServicioInput } from './servicios.schemas'

export class ServiciosService {
  list() {
    return serviciosRepository.findAll()
  }

  create(input: ServicioInput) {
    return serviciosRepository.create(input)
  }
}

export const serviciosService = new ServiciosService()
