import type { Request, Response } from 'express'
import { listClientesParamsSchema } from './clientes.schemas'
import { clientesService } from './clientes.service'

export class ClientesController {
  async list(request: Request, response: Response) {
    try {
      const parsed = listClientesParamsSchema.safeParse(request.query)
      if (!parsed.success) {
        response.status(400).json({ error: 'Parámetros inválidos' })
        return
      }
      const clientes = await clientesService.listClientes(parsed.data)
      response.json({ clientes })
    } catch {
      response.status(500).json({ error: 'Error al obtener clientes' })
    }
  }

  async detalle(request: Request, response: Response) {
    try {
      const id = request.params['id'] as string
      if (!id) { response.status(400).json({ error: 'ID requerido' }); return }
      const data = await clientesService.getClienteDetalle(id)
      if (!data) { response.status(404).json({ error: 'Cliente no encontrado' }); return }
      response.json(data)
    } catch {
      response.status(500).json({ error: 'Error al obtener el cliente' })
    }
  }

  async migrar(_request: Request, response: Response) {
    try {
      const result = await clientesService.migrar()
      response.json(result)
    } catch {
      response.status(500).json({ error: 'Error al migrar clientes' })
    }
  }
}

export const clientesController = new ClientesController()
