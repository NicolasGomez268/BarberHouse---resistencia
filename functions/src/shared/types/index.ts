export type UserRole = 'admin' | 'barbero' | 'cajero'

export type AuthenticatedUser = {
  id: string
  email: string
  role: UserRole
}
