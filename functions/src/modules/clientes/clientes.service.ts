import { clientesRepository } from './clientes.repository'
import type { ClienteData, ListClientesParams } from './clientes.schemas'
import type { TurnoParaCliente, PaqueteParaCliente } from './clientes.repository'

type ClienteDetalle = {
  cliente: ClienteData
  turnos: TurnoParaCliente[]
  paquetes: PaqueteParaCliente[]
  stats: {
    totalTurnos: number
    turnosRealizados: number
    totalGastado: number
    ultimaVisita: string | null
    paquetesActivos: number
  }
}

export class ClientesService {
  async listClientes(params: ListClientesParams): Promise<ClienteData[]> {
    return clientesRepository.findClientes(params.search)
  }

  async getClienteDetalle(id: string): Promise<ClienteDetalle | null> {
    const cliente = await clientesRepository.findClienteById(id)
    if (!cliente) return null

    const { turnos, paquetes } = await clientesRepository.findHistorialByTelefono(cliente.telefono)

    const turnosRealizados = turnos.filter((t) => t.estado === 'REALIZADO' && !t.prepagado)
    const totalGastado = turnosRealizados.reduce((sum, t) => sum + (t.monto ?? 0), 0)
    const ultimaVisita = turnosRealizados.length > 0
      ? turnosRealizados.sort((a, b) => b.fecha.localeCompare(a.fecha))[0]!.fecha
      : null
    const paquetesActivos = paquetes.filter((p) => p.activo).length

    return {
      cliente,
      turnos,
      paquetes,
      stats: {
        totalTurnos: turnos.length,
        turnosRealizados: turnosRealizados.length,
        totalGastado,
        ultimaVisita,
        paquetesActivos,
      },
    }
  }

  async upsertCliente(nombre: string, telefono: string, ultimaVisita?: string): Promise<ClienteData> {
    return clientesRepository.upsertClienteByTelefono(nombre, telefono, ultimaVisita)
  }

  async migrar(): Promise<{ creados: number; actualizados: number }> {
    return clientesRepository.migrarDesdeTurnos()
  }
}

export const clientesService = new ClientesService()
