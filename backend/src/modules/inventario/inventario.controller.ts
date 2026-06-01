import type { Request, Response } from 'express'
import { productoSchema } from './inventario.schemas'
import { inventarioService } from './inventario.service'

export class InventarioController {
  list(_request: Request, response: Response) {
    response.json(inventarioService.list())
  }

  create(request: Request, response: Response) {
    const input = productoSchema.parse(request.body)
    response.status(201).json(inventarioService.create(input))
  }
}

export const inventarioController = new InventarioController()
