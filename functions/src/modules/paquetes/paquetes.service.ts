import { paquetesRepository } from './paquetes.repository'
import type { CreatePaqueteInput, PaqueteData } from './paquetes.schemas'

function nowStrings(): { fecha: string; hora: string } {
  const now = new Date()
  const fecha = now.toISOString().slice(0, 10)
  const hora = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`
  return { fecha, hora }
}

export class PaquetesService {
  async vender(input: CreatePaqueteInput, creadoPor: string): Promise<PaqueteData> {
    const { fecha, hora } = nowStrings()
    return paquetesRepository.insert(input, fecha, hora, creadoPor)
  }

  async listar(sucursalId?: string, clienteTelefono?: string): Promise<PaqueteData[]> {
    return paquetesRepository.findAll(sucursalId, clienteTelefono)
  }

  async usarCredito(id: string): Promise<PaqueteData> {
    return paquetesRepository.decrementarUso(id)
  }
}

export const paquetesService = new PaquetesService()
