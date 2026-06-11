import { z } from 'zod'
import type { Request, Response } from 'express'
import { createPaqueteSchema } from './paquetes.schemas'
import { paquetesService } from './paquetes.service'

function handleError(response: Response, error: unknown) {
  if (error instanceof z.ZodError) {
    response.status(422).json({ error: 'Datos inválidos', details: error.issues })
    return
  }
  if (error instanceof Error) {
    if (error.message === 'PAQUETE_NOT_FOUND') {
      response.status(404).json({ error: 'Paquete no encontrado' })
      return
    }
    if (error.message === 'PAQUETE_SIN_CREDITOS') {
      response.status(409).json({ error: 'El paquete no tiene créditos disponibles' })
      return
    }
  }
  console.error(error)
  response.status(500).json({ error: 'Error interno del servidor' })
}

export class PaquetesController {
  async vender(request: Request, response: Response) {
    try {
      const input = createPaqueteSchema.parse(request.body)
      const paquete = await paquetesService.vender(input, request.user!.id)
      response.status(201).json({ paquete })
    } catch (error) {
      handleError(response, error)
    }
  }

  async listar(request: Request, response: Response) {
    try {
      const sucursalId = request.query['sucursalId'] as string | undefined
      const clienteTelefono = request.query['clienteTelefono'] as string | undefined
      const paquetes = await paquetesService.listar(sucursalId, clienteTelefono)
      response.json({ paquetes })
    } catch (error) {
      handleError(response, error)
    }
  }

  async usarCredito(request: Request, response: Response) {
    try {
      const id = request.params['id'] as string
      const paquete = await paquetesService.usarCredito(id)
      response.json({ paquete })
    } catch (error) {
      handleError(response, error)
    }
  }
}

export const paquetesController = new PaquetesController()
