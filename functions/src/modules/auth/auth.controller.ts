import type { Request, Response } from 'express'
import { loginSchema, registroSchema } from './auth.schemas'
import { authService } from './auth.service'

export class AuthController {
  async login(request: Request, response: Response) {
    try {
      const input = loginSchema.parse(request.body)
      const result = await authService.login(input)
      response.json(result)
    } catch (error) {
      if (error instanceof Error && error.message === 'USER_NOT_FOUND') {
        response.status(404).json({ error: 'User profile not found' })
        return
      }
      response.status(401).json({ error: 'Invalid or expired token' })
    }
  }

  async registro(request: Request, response: Response) {
    try {
      const input = registroSchema.parse(request.body)
      const result = await authService.registro(input)
      response.status(201).json(result)
    } catch (error) {
      if (error instanceof Error) {
        switch (error.message) {
          case 'INVALID_TOKEN':
            response.status(400).json({ error: 'Invitación inválida o inexistente' })
            return
          case 'TOKEN_USED':
            response.status(400).json({ error: 'Esta invitación ya fue utilizada' })
            return
          case 'TOKEN_EXPIRED':
            response.status(400).json({ error: 'La invitación expiró' })
            return
          case 'EMAIL_ALREADY_EXISTS':
            response.status(409).json({ error: 'Ya existe una cuenta con ese email' })
            return
          case 'BARBERO_NOT_FOUND':
            response.status(400).json({ error: 'Invitación inválida' })
            return
        }
      }
      response.status(500).json({ error: 'Error al crear la cuenta' })
    }
  }
}

export const authController = new AuthController()
