import { Router } from 'express'
import { equipoController } from './equipo.controller'

export const equipoRouter = Router()

equipoRouter.get('/', (request, response) => equipoController.list(request, response))
equipoRouter.post('/', (request, response) => equipoController.create(request, response))
