import { equipoRepository } from './equipo.repository'
import type { MiembroEquipoInput } from './equipo.schemas'

export class EquipoService {
  list() {
    return equipoRepository.findAll()
  }

  create(input: MiembroEquipoInput) {
    return equipoRepository.create(input)
  }
}

export const equipoService = new EquipoService()
