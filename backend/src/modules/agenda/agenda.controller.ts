import type { Request, Response } from 'express'
import { turnoSchema } from './agenda.schemas'
import { agendaService } from './agenda.service'

export class AgendaController {
  list(_request: Request, response: Response) {
    response.json(agendaService.list())
  }

  create(request: Request, response: Response) {
    const input = turnoSchema.parse(request.body)
    response.status(201).json(agendaService.create(input))
  }
}

export const agendaController = new AgendaController()
