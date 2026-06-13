import { Router } from 'express'
import { cajaController } from './caja.controller'

export const cajaRouter = Router()

cajaRouter.post('/validar-pin', (req, res) => cajaController.validarPin(req, res))
cajaRouter.get('/diaria', (req, res) => cajaController.cajaDiaria(req, res))
cajaRouter.get('/liquidacion', (req, res) => cajaController.liquidacion(req, res))
cajaRouter.get('/metricas', (req, res) => cajaController.metricas(req, res))
cajaRouter.get('/cierre', (req, res) => cajaController.obtenerCierre(req, res))
cajaRouter.post('/cierre', (req, res) => cajaController.guardarCierre(req, res))
