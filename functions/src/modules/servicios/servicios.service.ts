import { serviciosRepository } from './servicios.repository'
import type { ServicioInput, ServicioUpdateInput } from './servicios.schemas'

export class ServiciosService {
  list() {
    return serviciosRepository.findAll()
  }

  create(input: ServicioInput) {
    return serviciosRepository.create(input)
  }

  update(id: string, input: ServicioUpdateInput) {
    return serviciosRepository.update(id, input)
  }

  delete(id: string) {
    return serviciosRepository.delete(id)
  }

  toggle(id: string) {
    return serviciosRepository.toggle(id)
  }
}

export const serviciosService = new ServiciosService()
