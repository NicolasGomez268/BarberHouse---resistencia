export type UserRole = 'admin'

export type SucursalId = 's1' | 's2'

export type AuthenticatedUser = {
  id: string
  email: string
  role: UserRole
  sucursalesConAccesoCaja: SucursalId[]
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthenticatedUser
    }
  }
}
