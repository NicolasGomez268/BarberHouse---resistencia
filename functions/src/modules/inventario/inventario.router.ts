import { Router } from 'express'
import { inventarioController } from './inventario.controller'

export const inventarioRouter = Router()

// Rutas estáticas antes de /:id para evitar colisiones
inventarioRouter.post('/ventas', (req, res) => inventarioController.registrarVenta(req, res))
inventarioRouter.patch('/:id/stock', (req, res) => inventarioController.ajustarStock(req, res))
inventarioRouter.get('/', (req, res) => inventarioController.list(req, res))
inventarioRouter.post('/', (req, res) => inventarioController.create(req, res))
inventarioRouter.patch('/:id', (req, res) => inventarioController.update(req, res))
inventarioRouter.delete('/:id', (req, res) => inventarioController.delete(req, res))
