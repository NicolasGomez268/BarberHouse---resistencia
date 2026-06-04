import type { Request, Response } from 'express'
import { ajusteStockSchema, productoSchema, productoUpdateSchema, ventaSchema } from './inventario.schemas'
import { inventarioService } from './inventario.service'

function pid(request: Request): string {
  return request.params['id'] as string
}

export class InventarioController {
  async list(_request: Request, response: Response) {
    try {
      const productos = await inventarioService.list()
      response.json({ productos })
    } catch {
      response.status(500).json({ error: 'Error al obtener el inventario' })
    }
  }

  async create(request: Request, response: Response) {
    try {
      const parsed = productoSchema.safeParse(request.body)
      if (!parsed.success) {
        response.status(400).json({ error: 'Datos inválidos', details: parsed.error.issues })
        return
      }
      const producto = await inventarioService.create(parsed.data)
      response.status(201).json({ producto })
    } catch {
      response.status(500).json({ error: 'Error al crear el producto' })
    }
  }

  async update(request: Request, response: Response) {
    try {
      const parsed = productoUpdateSchema.safeParse(request.body)
      if (!parsed.success) {
        response.status(400).json({ error: 'Datos inválidos', details: parsed.error.issues })
        return
      }
      const producto = await inventarioService.update(pid(request), parsed.data)
      if (!producto) {
        response.status(404).json({ error: 'Producto no encontrado' })
        return
      }
      response.json({ producto })
    } catch {
      response.status(500).json({ error: 'Error al actualizar el producto' })
    }
  }

  async delete(request: Request, response: Response) {
    try {
      const deleted = await inventarioService.delete(pid(request))
      if (!deleted) {
        response.status(404).json({ error: 'Producto no encontrado' })
        return
      }
      response.status(204).send()
    } catch {
      response.status(500).json({ error: 'Error al eliminar el producto' })
    }
  }

  async ajustarStock(request: Request, response: Response) {
    try {
      const parsed = ajusteStockSchema.safeParse(request.body)
      if (!parsed.success) {
        response.status(400).json({ error: 'Datos inválidos', details: parsed.error.issues })
        return
      }
      const producto = await inventarioService.ajustarStock(pid(request), parsed.data)
      if (!producto) {
        response.status(404).json({ error: 'Producto no encontrado' })
        return
      }
      response.json({ producto })
    } catch {
      response.status(500).json({ error: 'Error al ajustar el stock' })
    }
  }

  async registrarVenta(request: Request, response: Response) {
    try {
      const parsed = ventaSchema.safeParse(request.body)
      if (!parsed.success) {
        response.status(400).json({ error: 'Datos inválidos', details: parsed.error.issues })
        return
      }
      const venta = await inventarioService.registrarVenta(parsed.data)
      response.status(201).json({ venta })
    } catch (error) {
      if (error instanceof Error && error.message === 'Producto no encontrado') {
        response.status(404).json({ error: 'Producto no encontrado' })
        return
      }
      response.status(500).json({ error: 'Error al registrar la venta' })
    }
  }
}

export const inventarioController = new InventarioController()
