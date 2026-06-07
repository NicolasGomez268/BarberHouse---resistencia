import type { Barbero, HorarioSemanal, Usuario } from '../types'

export const MOCK_BARBEROS: Barbero[] = [
  {
    id: 'barbero-1',
    nombre: 'Carlos Sando',
    telefono: '3624111111',
    fotoUrl: undefined,
    activo: true,
    esDueno: true,
    porcentajeCasa: 0,
    colorHex: '#f5c518',
    sucursalId: 's1',
    fechaIngreso: '2020-01-15',
  },
  {
    id: 'barbero-2',
    nombre: 'Diego Martínez',
    telefono: '3624222222',
    fotoUrl: undefined,
    activo: true,
    esDueno: false,
    porcentajeCasa: 40,
    colorHex: '#6b6b6b',
    sucursalId: 's1',
    fechaIngreso: '2021-03-10',
  },
  {
    id: 'barbero-3',
    nombre: 'Juan Pérez',
    telefono: '3624333333',
    fotoUrl: undefined,
    activo: true,
    esDueno: false,
    porcentajeCasa: 40,
    colorHex: '#4caf72',
    sucursalId: 's2',
    fechaIngreso: '2022-06-01',
  },
  {
    id: 'barbero-4',
    nombre: 'Mario López',
    telefono: '3624444444',
    fotoUrl: undefined,
    activo: false,
    esDueno: false,
    porcentajeCasa: 50,
    colorHex: '#c97fd5',
    sucursalId: 's2',
    fechaIngreso: '2023-01-20',
  },
]

export const MOCK_HORARIOS: HorarioSemanal[] = [
  {
    barberoId: 'barbero-1',
    dias: {
      0: { activo: true, horaInicio: '09:00', horaFin: '20:00', descansoInicio: '13:00', descansoFin: '14:00' },
      1: { activo: true, horaInicio: '09:00', horaFin: '20:00', descansoInicio: '13:00', descansoFin: '14:00' },
      2: { activo: true, horaInicio: '09:00', horaFin: '20:00', descansoInicio: '13:00', descansoFin: '14:00' },
      3: { activo: true, horaInicio: '09:00', horaFin: '20:00', descansoInicio: '13:00', descansoFin: '14:00' },
      4: { activo: true, horaInicio: '09:00', horaFin: '20:00', descansoInicio: '13:00', descansoFin: '14:00' },
      5: { activo: true, horaInicio: '09:00', horaFin: '15:00' },
    },
  },
  {
    barberoId: 'barbero-2',
    dias: {
      0: { activo: true, horaInicio: '09:00', horaFin: '20:00', descansoInicio: '13:00', descansoFin: '14:00' },
      1: { activo: true, horaInicio: '09:00', horaFin: '20:00', descansoInicio: '13:00', descansoFin: '14:00' },
      2: { activo: false, horaInicio: '09:00', horaFin: '20:00' },
      3: { activo: true, horaInicio: '09:00', horaFin: '20:00', descansoInicio: '13:00', descansoFin: '14:00' },
      4: { activo: true, horaInicio: '09:00', horaFin: '20:00', descansoInicio: '13:00', descansoFin: '14:00' },
      5: { activo: true, horaInicio: '09:00', horaFin: '15:00' },
    },
  },
]

export const equipoMock: Usuario[] = MOCK_BARBEROS.map((barbero) => ({
  id: barbero.id,
  email: `${barbero.id}@peluqueria.local`,
  nombre: barbero.nombre,
  rol: 'admin',
  sucursalesConAccesoCaja: [],
}))
