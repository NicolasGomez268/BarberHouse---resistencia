import type { Request, Response } from 'express'
import { movimientoCajaSchema } from './caja.schemas'
import { cajaService } from './caja.service'

export class CajaController {
  list(_request: Request, response: Response) {
    response.json(cajaService.list())
  }

  create(request: Request, response: Response) {
    const input = movimientoCajaSchema.parse(request.body)
    response.status(201).json(cajaService.create(input))
  }
}

export const cajaController = new CajaController()
