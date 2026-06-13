import type { Request, Response } from 'express'
import {
  cajaDiariaParamsSchema,
  createCierreSchema,
  getCierreParamsSchema,
  liquidacionParamsSchema,
  metricasParamsSchema,
  validarPinSchema,
} from './caja.schemas'
import { cajaService } from './caja.service'

export class CajaController {
  async validarPin(request: Request, response: Response) {
    try {
      const parsed = validarPinSchema.safeParse(request.body)
      if (!parsed.success) {
        response.status(400).json({ error: 'Datos inválidos', details: parsed.error.issues })
        return
      }
      const sucursales = await cajaService.validarPin(parsed.data.pin)
      if (!sucursales) {
        response.status(401).json({ error: 'PIN incorrecto. Intentá nuevamente.' })
        return
      }
      response.json({ sucursales })
    } catch {
      response.status(500).json({ error: 'Error al validar el PIN' })
    }
  }

  async cajaDiaria(request: Request, response: Response) {
    try {
      const parsed = cajaDiariaParamsSchema.safeParse(request.query)
      if (!parsed.success) {
        response.status(400).json({ error: 'Parámetros inválidos', details: parsed.error.issues })
        return
      }
      const data = await cajaService.calcularCajaDiaria(parsed.data)
      response.json(data)
    } catch {
      response.status(500).json({ error: 'Error al calcular la caja diaria' })
    }
  }

  async liquidacion(request: Request, response: Response) {
    try {
      const parsed = liquidacionParamsSchema.safeParse(request.query)
      if (!parsed.success) {
        response.status(400).json({ error: 'Parámetros inválidos', details: parsed.error.issues })
        return
      }
      const data = await cajaService.calcularLiquidacion(parsed.data)
      response.json(data)
    } catch {
      response.status(500).json({ error: 'Error al calcular la liquidación' })
    }
  }

  async metricas(request: Request, response: Response) {
    try {
      const parsed = metricasParamsSchema.safeParse(request.query)
      if (!parsed.success) {
        response.status(400).json({ error: 'Parámetros inválidos', details: parsed.error.issues })
        return
      }
      const data = await cajaService.calcularMetricas(parsed.data)
      response.json(data)
    } catch {
      response.status(500).json({ error: 'Error al calcular las métricas' })
    }
  }

  async guardarCierre(request: Request, response: Response) {
    try {
      const parsed = createCierreSchema.safeParse(request.body)
      if (!parsed.success) {
        response.status(400).json({ error: 'Datos inválidos', details: parsed.error.issues })
        return
      }
      const cierre = await cajaService.guardarCierre(parsed.data)
      response.json({ cierre })
    } catch {
      response.status(500).json({ error: 'Error al guardar el cierre' })
    }
  }

  async obtenerCierre(request: Request, response: Response) {
    try {
      const parsed = getCierreParamsSchema.safeParse(request.query)
      if (!parsed.success) {
        response.status(400).json({ error: 'Parámetros inválidos', details: parsed.error.issues })
        return
      }
      const cierre = await cajaService.obtenerCierre(parsed.data)
      response.json({ cierre })
    } catch {
      response.status(500).json({ error: 'Error al obtener el cierre' })
    }
  }
}

export const cajaController = new CajaController()
