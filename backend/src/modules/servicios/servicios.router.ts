import { Router } from 'express'
import { serviciosController } from './servicios.controller'

export const serviciosRouter = Router()

serviciosRouter.get('/', (request, response) => serviciosController.list(request, response))
serviciosRouter.post('/', (request, response) => serviciosController.create(request, response))
