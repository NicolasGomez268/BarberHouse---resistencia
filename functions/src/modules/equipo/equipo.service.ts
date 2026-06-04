import { equipoRepository } from './equipo.repository'
import type { BarberoInput, BarberoUpdateInput, HorarioInput } from './equipo.schemas'

export class EquipoService {
  async list() {
    const [barberos, horarios] = await Promise.all([
      equipoRepository.findAll(),
      equipoRepository.findAllHorarios(),
    ])
    return { barberos, horarios }
  }

  create(input: BarberoInput) {
    return equipoRepository.create(input)
  }

  update(id: string, input: BarberoUpdateInput) {
    return equipoRepository.update(id, input)
  }

  delete(id: string) {
    return equipoRepository.delete(id)
  }

  toggle(id: string) {
    return equipoRepository.toggle(id)
  }

  upsertHorario(input: HorarioInput) {
    return equipoRepository.upsertHorario(input)
  }
}

export const equipoService = new EquipoService()
