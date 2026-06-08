import { Router } from 'express'
import { agendaController } from './agenda.controller'

export const agendaRouter = Router()

// Rutas estáticas ANTES que /:id para evitar colisiones de matching
agendaRouter.get('/fijos', (req, res) => agendaController.listTurnosFijos(req, res))
agendaRouter.post('/fijos', (req, res) => agendaController.createTurnoFijo(req, res))
agendaRouter.patch('/fijos/:id', (req, res) => agendaController.updateTurnoFijo(req, res))
agendaRouter.delete('/fijos/:id', (req, res) => agendaController.deleteTurnoFijo(req, res))
agendaRouter.post('/fijos/:id/generar-proximo', (req, res) => agendaController.generarProximoTurnoFijo(req, res))

// Turnos
agendaRouter.get('/', (req, res) => agendaController.listTurnos(req, res))
agendaRouter.post('/', (req, res) => agendaController.createTurno(req, res))
agendaRouter.patch('/:id/realizado', (req, res) => agendaController.realizarTurno(req, res))
agendaRouter.patch('/:id/cancelar', (req, res) => agendaController.cancelarTurno(req, res))
agendaRouter.patch('/:id/no-asistio', (req, res) => agendaController.marcarNoAsistio(req, res))
agendaRouter.patch('/:id/ausente-fijo', (req, res) => agendaController.marcarAusenteFijo(req, res))
agendaRouter.post('/:id/reemplazo-fijo', (req, res) => agendaController.liberarTurnoFijo(req, res))
agendaRouter.patch('/:id', (req, res) => agendaController.updateTurno(req, res))
