import type { Request, Response } from 'express'
import { barberoSchema, barberoUpdateSchema, horarioSchema } from './equipo.schemas'
import { equipoService } from './equipo.service'

function pid(request: Request): string {
  return request.params['id'] as string
}

export class EquipoController {
  async list(_request: Request, response: Response) {
    try {
      const { barberos, horarios } = await equipoService.list()
      response.json({ barberos, horarios })
    } catch {
      response.status(500).json({ error: 'Error al obtener el equipo' })
    }
  }

  async create(request: Request, response: Response) {
    try {
      const parsed = barberoSchema.safeParse(request.body)
      if (!parsed.success) {
        response.status(400).json({ error: 'Datos inválidos', details: parsed.error.issues })
        return
      }
      const barbero = await equipoService.create(parsed.data)
      response.status(201).json({ barbero })
    } catch {
      response.status(500).json({ error: 'Error al crear el barbero' })
    }
  }

  async update(request: Request, response: Response) {
    try {
      const parsed = barberoUpdateSchema.safeParse(request.body)
      if (!parsed.success) {
        response.status(400).json({ error: 'Datos inválidos', details: parsed.error.issues })
        return
      }
      const barbero = await equipoService.update(pid(request), parsed.data)
      if (!barbero) {
        response.status(404).json({ error: 'Barbero no encontrado' })
        return
      }
      response.json({ barbero })
    } catch {
      response.status(500).json({ error: 'Error al actualizar el barbero' })
    }
  }

  async delete(request: Request, response: Response) {
    try {
      const deleted = await equipoService.delete(pid(request))
      if (!deleted) {
        response.status(404).json({ error: 'Barbero no encontrado' })
        return
      }
      response.status(204).send()
    } catch {
      response.status(500).json({ error: 'Error al eliminar el barbero' })
    }
  }

  async toggle(request: Request, response: Response) {
    try {
      const barbero = await equipoService.toggle(pid(request))
      if (!barbero) {
        response.status(404).json({ error: 'Barbero no encontrado' })
        return
      }
      response.json({ barbero })
    } catch {
      response.status(500).json({ error: 'Error al cambiar el estado del barbero' })
    }
  }

  async upsertHorario(request: Request, response: Response) {
    try {
      const parsed = horarioSchema.safeParse({ ...request.body, barberoId: pid(request) })
      if (!parsed.success) {
        response.status(400).json({ error: 'Datos inválidos', details: parsed.error.issues })
        return
      }
      const horario = await equipoService.upsertHorario(parsed.data)
      response.json({ horario })
    } catch {
      response.status(500).json({ error: 'Error al guardar el horario' })
    }
  }
}

export const equipoController = new EquipoController()
