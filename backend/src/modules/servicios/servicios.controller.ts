import type { Request, Response } from 'express'
import { servicioSchema } from './servicios.schemas'
import { serviciosService } from './servicios.service'

export class ServiciosController {
  list(_request: Request, response: Response) {
    response.json(serviciosService.list())
  }

  create(request: Request, response: Response) {
    const input = servicioSchema.parse(request.body)
    response.status(201).json(serviciosService.create(input))
  }
}

export const serviciosController = new ServiciosController()
