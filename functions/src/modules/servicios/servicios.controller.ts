import type { Request, Response } from 'express'
import { ConflictError } from '../../shared/errors'
import { servicioSchema, servicioUpdateSchema } from './servicios.schemas'
import { serviciosService } from './servicios.service'

function pid(request: Request): string {
  return request.params['id'] as string
}

export class ServiciosController {
  async list(_request: Request, response: Response) {
    try {
      const servicios = await serviciosService.list()
      response.json({ servicios })
    } catch {
      response.status(500).json({ error: 'Error al obtener los servicios' })
    }
  }

  async create(request: Request, response: Response) {
    try {
      const parsed = servicioSchema.safeParse(request.body)
      if (!parsed.success) {
        response.status(400).json({ error: 'Datos inválidos', details: parsed.error.issues })
        return
      }
      const servicio = await serviciosService.create(parsed.data)
      response.status(201).json({ servicio })
    } catch {
      response.status(500).json({ error: 'Error al crear el servicio' })
    }
  }

  async update(request: Request, response: Response) {
    try {
      const parsed = servicioUpdateSchema.safeParse(request.body)
      if (!parsed.success) {
        response.status(400).json({ error: 'Datos inválidos', details: parsed.error.issues })
        return
      }
      const servicio = await serviciosService.update(pid(request), parsed.data)
      if (!servicio) {
        response.status(404).json({ error: 'Servicio no encontrado' })
        return
      }
      response.json({ servicio })
    } catch {
      response.status(500).json({ error: 'Error al actualizar el servicio' })
    }
  }

  async delete(request: Request, response: Response) {
    try {
      const deleted = await serviciosService.delete(pid(request))
      if (!deleted) {
        response.status(404).json({ error: 'Servicio no encontrado' })
        return
      }
      response.status(204).send()
    } catch (error) {
      if (error instanceof ConflictError) {
        response.status(409).json({ error: error.message })
        return
      }
      response.status(500).json({ error: 'Error al eliminar el servicio' })
    }
  }

  async toggle(request: Request, response: Response) {
    try {
      const servicio = await serviciosService.toggle(pid(request))
      if (!servicio) {
        response.status(404).json({ error: 'Servicio no encontrado' })
        return
      }
      response.json({ servicio })
    } catch {
      response.status(500).json({ error: 'Error al cambiar el estado del servicio' })
    }
  }
}

export const serviciosController = new ServiciosController()
