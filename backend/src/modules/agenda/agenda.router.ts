import { Router } from 'express'
import { agendaController } from './agenda.controller'

export const agendaRouter = Router()

agendaRouter.get('/', (request, response) => agendaController.list(request, response))
agendaRouter.post('/', (request, response) => agendaController.create(request, response))
