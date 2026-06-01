import { Router } from 'express'
import { inventarioController } from './inventario.controller'

export const inventarioRouter = Router()

inventarioRouter.get('/', (request, response) => inventarioController.list(request, response))
inventarioRouter.post('/', (request, response) => inventarioController.create(request, response))
