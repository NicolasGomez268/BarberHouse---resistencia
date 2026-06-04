import { Router } from 'express'
import { serviciosController } from './servicios.controller'

export const serviciosRouter = Router()

serviciosRouter.get('/', (req, res) => serviciosController.list(req, res))
serviciosRouter.post('/', (req, res) => serviciosController.create(req, res))
// /:id/toggle antes de /:id para evitar colisión de matching
serviciosRouter.patch('/:id/toggle', (req, res) => serviciosController.toggle(req, res))
serviciosRouter.patch('/:id', (req, res) => serviciosController.update(req, res))
serviciosRouter.delete('/:id', (req, res) => serviciosController.delete(req, res))
