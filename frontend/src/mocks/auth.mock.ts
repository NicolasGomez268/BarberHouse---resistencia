import type { Usuario } from '../types'

export const authMock: { user: Usuario } = {
  user: {
    id: 'user-1',
    email: 'admin@barberhouse.local',
    nombre: 'Admin',
    rol: 'admin',
    sucursalesConAccesoCaja: ['s1', 's2'],
  },
}
