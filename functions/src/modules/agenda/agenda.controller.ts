import { z } from 'zod'
import type { Request, Response } from 'express'
import { ConflictError } from '../../shared/errors'
import {
  createTurnoFijoSchema,
  createTurnoSchema,
  realizadoSchema,
  reemplazoFijoSchema,
  turnosFijosFiltersSchema,
  turnosFiltersSchema,
  updateTurnoFijoSchema,
  updateTurnoSchema,
} from './agenda.schemas'
import { agendaService } from './agenda.service'

// Express 5 types params as string | string[] — always a string in practice for named params
function pid(request: Request): string {
  return request.params['id'] as string
}

function handleError(response: Response, error: unknown) {
  if (error instanceof z.ZodError) {
    response.status(422).json({ error: 'Datos inválidos', details: error.issues })
    return
  }
  if (error instanceof ConflictError) {
    response.status(409).json({ error: error.message })
    return
  }
  if (error instanceof Error) {
    if (error.message === 'TURNO_NOT_FOUND') {
      response.status(404).json({ error: 'Turno no encontrado' })
      return
    }
    if (error.message === 'TURNO_FIJO_NOT_FOUND') {
      response.status(404).json({ error: 'Turno fijo no encontrado' })
      return
    }
  }
  console.error(error)
  response.status(500).json({ error: 'Error interno del servidor' })
}

export class AgendaController {
  // ── Turnos ────────────────────────────────────────────────────────────────

  async listTurnos(request: Request, response: Response) {
    try {
      const filters = turnosFiltersSchema.parse(request.query)
      const turnos = await agendaService.listTurnos(filters)
      response.json({ turnos })
    } catch (error) {
      handleError(response, error)
    }
  }

  async createTurno(request: Request, response: Response) {
    try {
      const input = createTurnoSchema.parse(request.body)
      const turno = await agendaService.createTurno(input, request.user!.id)
      response.status(201).json({ turno })
    } catch (error) {
      handleError(response, error)
    }
  }

  async realizarTurno(request: Request, response: Response) {
    try {
      const { metodoPago, montoEfectivo, montoTransferencia } = realizadoSchema.parse(request.body)
      const turno = await agendaService.realizarTurno(pid(request), metodoPago, montoEfectivo, montoTransferencia)
      response.json({ turno })
    } catch (error) {
      handleError(response, error)
    }
  }

  async updateTurno(request: Request, response: Response) {
    try {
      const input = updateTurnoSchema.parse(request.body)
      const turno = await agendaService.updateTurno(pid(request), input)
      response.json({ turno })
    } catch (error) {
      handleError(response, error)
    }
  }

  async cancelarTurno(request: Request, response: Response) {
    try {
      const turno = await agendaService.cancelarTurno(pid(request))
      response.json({ turno })
    } catch (error) {
      handleError(response, error)
    }
  }

  async marcarNoAsistio(request: Request, response: Response) {
    try {
      const turno = await agendaService.marcarNoAsistio(pid(request))
      response.json({ turno })
    } catch (error) {
      handleError(response, error)
    }
  }

  async marcarAusenteFijo(request: Request, response: Response) {
    try {
      const turno = await agendaService.marcarAusenteFijo(pid(request))
      response.json({ turno })
    } catch (error) {
      handleError(response, error)
    }
  }

  async liberarTurnoFijo(request: Request, response: Response) {
    try {
      const input = reemplazoFijoSchema.parse(request.body)
      const turno = await agendaService.liberarTurnoFijo(pid(request), input, request.user!.id)
      response.status(201).json({ turno })
    } catch (error) {
      handleError(response, error)
    }
  }

  // ── Turnos Fijos ──────────────────────────────────────────────────────────

  async listTurnosFijos(request: Request, response: Response) {
    try {
      const filters = turnosFijosFiltersSchema.parse(request.query)
      const turnosFijos = await agendaService.listTurnosFijos(filters)
      response.json({ turnosFijos })
    } catch (error) {
      handleError(response, error)
    }
  }

  async createTurnoFijo(request: Request, response: Response) {
    try {
      const input = createTurnoFijoSchema.parse(request.body)
      const turnoFijo = await agendaService.createTurnoFijo(input)
      response.status(201).json({ turnoFijo })
    } catch (error) {
      handleError(response, error)
    }
  }

  async updateTurnoFijo(request: Request, response: Response) {
    try {
      const input = updateTurnoFijoSchema.parse(request.body)
      const turnoFijo = await agendaService.updateTurnoFijo(pid(request), input)
      response.json({ turnoFijo })
    } catch (error) {
      handleError(response, error)
    }
  }

  async deleteTurnoFijo(request: Request, response: Response) {
    try {
      await agendaService.deleteTurnoFijo(pid(request))
      response.status(204).send()
    } catch (error) {
      handleError(response, error)
    }
  }

  async generarProximoTurnoFijo(request: Request, response: Response) {
    try {
      const turnos = await agendaService.generarProximoTurnoFijo(pid(request), request.user!.id)
      response.json({ turnos })
    } catch (error) {
      handleError(response, error)
    }
  }

  async deduplicarFijos(_request: Request, response: Response) {
    try {
      const result = await agendaService.deduplicarTurnosFijos()
      response.json(result)
    } catch (error) {
      handleError(response, error)
    }
  }
}

export const agendaController = new AgendaController()
