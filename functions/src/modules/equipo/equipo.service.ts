import { randomUUID } from 'node:crypto'
import { equipoRepository } from './equipo.repository'
import type { BarberoData } from './equipo.repository'
import type { BarberoInput, BarberoUpdateInput, HorarioInput } from './equipo.schemas'

const FRONTEND_URL = process.env.CORS_ORIGIN ?? 'http://localhost:5173'

export class EquipoService {
  async list() {
    const [barberos, horarios] = await Promise.all([
      equipoRepository.findAll(),
      equipoRepository.findAllHorarios(),
    ])
    return { barberos, horarios }
  }

  async create(input: BarberoInput): Promise<{ barbero: BarberoData; invitacionUrl: string }> {
    const barbero = await equipoRepository.insertBarbero(input)
    const token = randomUUID()
    await equipoRepository.insertInvitacion(token, barbero.id)
    const invitacionUrl = `${FRONTEND_URL}/registro?token=${token}`
    return { barbero, invitacionUrl }
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
