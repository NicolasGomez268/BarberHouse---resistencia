import type { NextFunction, Request, Response } from 'express'
import type { UserRole } from '../types'

export function rolesMiddleware(_roles: UserRole[]) {
  return (_request: Request, _response: Response, next: NextFunction) => {
    next()
  }
}
