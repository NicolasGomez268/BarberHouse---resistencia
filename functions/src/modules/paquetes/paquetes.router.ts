import { Router } from 'express'
import { paquetesController } from './paquetes.controller'

export const paquetesRouter = Router()

paquetesRouter.get('/', (req, res) => paquetesController.listar(req, res))
paquetesRouter.post('/', (req, res) => paquetesController.vender(req, res))
paquetesRouter.patch('/:id/usar', (req, res) => paquetesController.usarCredito(req, res))
