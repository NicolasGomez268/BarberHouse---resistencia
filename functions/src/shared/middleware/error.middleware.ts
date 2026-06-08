import type { NextFunction, Request, Response } from 'express'
import { ZodError } from 'zod'
import { ConflictError } from '../errors'

export function errorMiddleware(error: unknown, _request: Request, response: Response, _next: NextFunction) {
  if (error instanceof ZodError) {
    response.status(400).json({ error: 'Validation error', issues: error.issues })
    return
  }

  if (error instanceof ConflictError) {
    response.status(409).json({ error: error.message })
    return
  }

  response.status(500).json({ error: 'Internal server error' })
}
