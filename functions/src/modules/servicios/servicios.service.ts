import { ConflictError } from '../../shared/errors'
import { serviciosRepository } from './servicios.repository'
import type { ServicioInput, ServicioUpdateInput } from './servicios.schemas'

export class ServiciosService {
  list() {
    return serviciosRepository.findAll()
  }

  create(input: ServicioInput) {
    return serviciosRepository.insertServicio(input)
  }

  update(id: string, input: ServicioUpdateInput) {
    return serviciosRepository.patchServicio(id, input)
  }

  async delete(id: string): Promise<boolean> {
    if (await serviciosRepository.hasTurnosAsignados(id)) {
      throw new ConflictError('No se puede eliminar un servicio con turnos asignados')
    }
    return serviciosRepository.deleteServicio(id)
  }

  toggle(id: string) {
    return serviciosRepository.patchServicioActivo(id)
  }
}

export const serviciosService = new ServiciosService()
