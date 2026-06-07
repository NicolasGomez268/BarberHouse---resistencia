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
    return equipoRepository.insertBarbero(input)
  }

  update(id: string, input: BarberoUpdateInput) {
    return equipoRepository.patchBarbero(id, input)
  }

  async delete(id: string): Promise<boolean> {
    const deleted = await equipoRepository.deleteBarbero(id)
    if (!deleted) return false
    await equipoRepository.deleteHorario(id)
    return true
  }

  toggle(id: string) {
    return equipoRepository.patchBarberoActivo(id)
  }

  upsertHorario(input: HorarioInput) {
    return equipoRepository.upsertHorario(input)
  }
}

export const equipoService = new EquipoService()
