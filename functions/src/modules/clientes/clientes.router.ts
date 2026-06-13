import { Router } from 'express'
import { clientesController } from './clientes.controller'

export const clientesRouter = Router()

clientesRouter.get('/', (req, res) => clientesController.list(req, res))
clientesRouter.post('/migrar', (req, res) => clientesController.migrar(req, res))
clientesRouter.get('/:id', (req, res) => clientesController.detalle(req, res))
