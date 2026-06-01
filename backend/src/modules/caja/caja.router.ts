import { Router } from 'express'
import { cajaController } from './caja.controller'

export const cajaRouter = Router()

cajaRouter.get('/', (request, response) => cajaController.list(request, response))
cajaRouter.post('/', (request, response) => cajaController.create(request, response))
