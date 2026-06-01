import type { Usuario } from '../types'

export const authMock: { user: Usuario } = {
  user: {
    id: 'user-1',
    email: 'admin@peluqueria.local',
    nombre: 'Admin',
    rol: 'admin',
  },
}
