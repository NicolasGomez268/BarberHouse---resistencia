import type { NextFunction, Request, Response } from 'express'

export function cajaMiddleware(_request: Request, _response: Response, next: NextFunction) {
  next()
}
