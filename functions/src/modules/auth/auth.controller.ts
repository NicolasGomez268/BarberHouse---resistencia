import type { Request, Response } from 'express'
import { loginSchema } from './auth.schemas'
import { authService } from './auth.service'

export class AuthController {
  login(request: Request, response: Response) {
    const input = loginSchema.parse(request.body)
    response.json(authService.login(input))
  }
}

export const authController = new AuthController()
