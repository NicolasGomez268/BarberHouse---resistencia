import type { Request, Response } from 'express'
import { loginSchema } from './auth.schemas'
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
      // Token inválido o expirado
      response.status(401).json({ error: 'Invalid or expired token' })
    }
  }
}

export const authController = new AuthController()
