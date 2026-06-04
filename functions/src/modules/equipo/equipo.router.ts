import { Router } from 'express'
import { equipoController } from './equipo.controller'

export const equipoRouter = Router()

// Rutas estáticas con sufijo antes de /:id para evitar colisiones
equipoRouter.patch('/:id/toggle', (req, res) => equipoController.toggle(req, res))
equipoRouter.put('/:id/horario', (req, res) => equipoController.upsertHorario(req, res))
equipoRouter.get('/', (req, res) => equipoController.list(req, res))
equipoRouter.post('/', (req, res) => equipoController.create(req, res))
equipoRouter.patch('/:id', (req, res) => equipoController.update(req, res))
equipoRouter.delete('/:id', (req, res) => equipoController.delete(req, res))
