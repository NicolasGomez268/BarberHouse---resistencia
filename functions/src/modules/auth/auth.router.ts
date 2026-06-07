import { Router } from 'express'
import { authController } from './auth.controller'

export const authRouter = Router()

authRouter.post('/login', (request, response) => authController.login(request, response))
authRouter.post('/registro', (request, response) => authController.registro(request, response))
