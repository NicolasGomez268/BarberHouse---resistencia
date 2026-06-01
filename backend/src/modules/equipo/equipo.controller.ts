import type { Request, Response } from 'express'
import { miembroEquipoSchema } from './equipo.schemas'
import { equipoService } from './equipo.service'

export class EquipoController {
  list(_request: Request, response: Response) {
    response.json(equipoService.list())
  }

  create(request: Request, response: Response) {
    const input = miembroEquipoSchema.parse(request.body)
    response.status(201).json(equipoService.create(input))
  }
}

export const equipoController = new EquipoController()
