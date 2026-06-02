import type { Turno, TurnoFijo } from '../types'

const hoy = new Date()
const offset = (days: number): string => {
  const d = new Date(hoy)
  d.setDate(d.getDate() + days)
  return d.toISOString().slice(0, 10)
}

const BASE_TURNOS: Turno[] = [
  { id: 't-1', sucursalId: 's1', fecha: offset(0), hora: '09:00', barberoId: 'barbero-1', servicioId: 'srv-1', clienteNombre: 'Carlos Ruiz', clienteTelefono: '3621111111', estado: 'CONFIRMADO', esFijo: false, creadoPor: 'barbero-1' },
  { id: 't-2', sucursalId: 's1', fecha: offset(0), hora: '10:30', barberoId: 'barbero-2', servicioId: 'srv-2', clienteNombre: 'Nicolás García', clienteTelefono: '3731662839', estado: 'PENDIENTE', esFijo: true, turnoFijoId: 'tf-1', creadoPor: 'barbero-1' },
  { id: 't-3', sucursalId: 's2', fecha: offset(0), hora: '11:00', barberoId: 'barbero-3', servicioId: 'srv-4', clienteNombre: 'Valentina López', clienteTelefono: '3629999999', estado: 'REALIZADO', esFijo: false, metodoPago: 'EFECTIVO', creadoPor: 'barbero-3' },
  { id: 't-4', sucursalId: 's1', fecha: offset(0), hora: '12:00', barberoId: 'barbero-1', servicioId: 'srv-3', clienteNombre: 'Ramón Díaz', clienteTelefono: '3622222222', estado: 'PENDIENTE', esFijo: false, creadoPor: 'barbero-1' },
  { id: 't-5', sucursalId: 's1', fecha: offset(0), hora: '14:00', barberoId: 'barbero-2', servicioId: 'srv-1', clienteNombre: 'Mateo Silva', clienteTelefono: '3623333333', estado: 'PENDIENTE', esFijo: true, turnoFijoId: 'tf-2', creadoPor: 'barbero-2' },
  { id: 't-6', sucursalId: 's2', fecha: offset(0), hora: '15:30', barberoId: 'barbero-3', servicioId: 'srv-2', clienteNombre: 'Agustín Pérez', clienteTelefono: '3625555555', estado: 'CANCELADO', esFijo: false, creadoPor: 'barbero-3' },
  { id: 't-7', sucursalId: 's1', fecha: offset(1), hora: '09:30', barberoId: 'barbero-1', servicioId: 'srv-2', clienteNombre: 'Lautaro Flores', clienteTelefono: '3626666666', estado: 'PENDIENTE', esFijo: true, turnoFijoId: 'tf-1', creadoPor: 'barbero-1' },
  { id: 't-8', sucursalId: 's1', fecha: offset(1), hora: '11:00', barberoId: 'barbero-2', servicioId: 'srv-3', clienteNombre: 'Paula González', clienteTelefono: '3627777777', estado: 'PENDIENTE', esFijo: false, creadoPor: 'barbero-2' },
  { id: 't-9', sucursalId: 's2', fecha: offset(1), hora: '13:00', barberoId: 'barbero-3', servicioId: 'srv-1', clienteNombre: 'Tomás Heredia', clienteTelefono: '3628888888', estado: 'CONFIRMADO', esFijo: false, creadoPor: 'barbero-3' },
  { id: 't-10', sucursalId: 's1', fecha: offset(2), hora: '10:00', barberoId: 'barbero-1', servicioId: 'srv-5', clienteNombre: 'Marina Torres', clienteTelefono: '3624444444', estado: 'PENDIENTE', esFijo: false, creadoPor: 'barbero-1' },
  { id: 't-11', sucursalId: 's2', fecha: offset(2), hora: '14:00', barberoId: 'barbero-3', servicioId: 'srv-2', clienteNombre: 'Rodrigo Salas', clienteTelefono: '3620000000', estado: 'CONFIRMADO', esFijo: true, turnoFijoId: 'tf-3', creadoPor: 'barbero-3' },
  { id: 't-12', sucursalId: 's1', fecha: offset(3), hora: '09:00', barberoId: 'barbero-2', servicioId: 'srv-1', clienteNombre: 'Emilio Rueda', clienteTelefono: '3620000001', estado: 'PENDIENTE', esFijo: false, creadoPor: 'barbero-2' },
  { id: 't-13', sucursalId: 's1', fecha: offset(5), hora: '10:00', barberoId: 'barbero-1', servicioId: 'srv-2', clienteNombre: 'Fernando Cruz', clienteTelefono: '3620000003', estado: 'PENDIENTE', esFijo: true, turnoFijoId: 'tf-2', creadoPor: 'barbero-1' },
  { id: 't-14', sucursalId: 's2', fecha: offset(7), hora: '11:30', barberoId: 'barbero-3', servicioId: 'srv-4', clienteNombre: 'Claudia Meza', clienteTelefono: '3620000002', estado: 'PENDIENTE', esFijo: false, creadoPor: 'barbero-3' },
  { id: 't-15', sucursalId: 's1', fecha: offset(-1), hora: '10:00', barberoId: 'barbero-2', servicioId: 'srv-3', clienteNombre: 'Roberto Campos', clienteTelefono: '3620000004', estado: 'REALIZADO', esFijo: false, metodoPago: 'TRANSFERENCIA', creadoPor: 'barbero-2' },
  { id: 't-16', sucursalId: 's1', fecha: offset(-1), hora: '12:00', barberoId: 'barbero-1', servicioId: 'srv-1', clienteNombre: 'Luciana Vera', clienteTelefono: '3620000005', estado: 'REALIZADO', esFijo: true, turnoFijoId: 'tf-3', metodoPago: 'EFECTIVO', creadoPor: 'barbero-1' },
  { id: 't-17', sucursalId: 's2', fecha: offset(-2), hora: '09:00', barberoId: 'barbero-3', servicioId: 'srv-2', clienteNombre: 'Sebastián Ríos', clienteTelefono: '3620000006', estado: 'REALIZADO', esFijo: false, metodoPago: 'TARJETA', creadoPor: 'barbero-3' },
  { id: 't-18', sucursalId: 's1', fecha: offset(14), hora: '10:30', barberoId: 'barbero-1', servicioId: 'srv-2', clienteNombre: 'Daniela Mora', clienteTelefono: '3620000007', estado: 'PENDIENTE', esFijo: true, turnoFijoId: 'tf-1', creadoPor: 'barbero-1' },
  { id: 't-19', sucursalId: 's2', fecha: offset(14), hora: '13:00', barberoId: 'barbero-3', servicioId: 'srv-6', clienteNombre: 'Patricia Suárez', clienteTelefono: '3620000008', estado: 'PENDIENTE', esFijo: false, creadoPor: 'barbero-3' },
  { id: 't-20', sucursalId: 's1', fecha: offset(21), hora: '09:00', barberoId: 'barbero-2', servicioId: 'srv-1', clienteNombre: 'Gonzalo Navarro', clienteTelefono: '3620000009', estado: 'PENDIENTE', esFijo: true, turnoFijoId: 'tf-2', creadoPor: 'barbero-2' },
]

const nombresClientes = [
  'Carlos Ruiz',
  'Nicolas Garcia',
  'Valentina Lopez',
  'Ramon Diaz',
  'Mateo Silva',
  'Agustin Perez',
  'Lautaro Flores',
  'Paula Gonzalez',
  'Tomas Heredia',
  'Marina Torres',
  'Rodrigo Salas',
  'Emilio Rueda',
  'Fernando Cruz',
  'Claudia Meza',
  'Roberto Campos',
  'Luciana Vera',
  'Sebastian Rios',
  'Daniela Mora',
  'Patricia Suarez',
  'Gonzalo Navarro',
]

const horarios = [
  '08:00',
  '08:15',
  '08:30',
  '08:45',
  '09:00',
  '09:15',
  '09:30',
  '09:45',
  '10:00',
  '10:15',
  '10:30',
  '10:45',
  '11:00',
  '11:15',
  '11:30',
  '11:45',
  '12:00',
  '12:15',
  '12:30',
  '12:45',
  '13:00',
  '13:15',
  '13:30',
  '13:45',
  '14:00',
  '14:15',
  '14:30',
  '14:45',
  '15:00',
  '15:15',
  '15:30',
  '15:45',
  '16:00',
  '16:15',
  '16:30',
  '16:45',
  '17:00',
  '17:15',
  '17:30',
  '17:45',
  '18:00',
  '18:15',
  '18:30',
  '18:45',
  '19:00',
  '19:15',
  '19:30',
  '19:45',
  '20:00',
  '20:15',
]

function getMonthDateKey(year: number, month: number, day: number) {
  return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
}

function generateTurnosPorDia(): Turno[] {
  const year = hoy.getFullYear()
  const month = hoy.getMonth()
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const estados: Turno['estado'][] = ['PENDIENTE', 'CONFIRMADO', 'PENDIENTE', 'PENDIENTE']
  const seedOffset = BASE_TURNOS.length

  return Array.from({ length: daysInMonth }).flatMap((_, dayIndex) =>
    Array.from({ length: 50 }).map((__, turnoIndex) => {
      const clienteIndex = (seedOffset + dayIndex * 50 + turnoIndex) % nombresClientes.length
      const barberoNumber = (turnoIndex % 3) + 1
      const servicioNumber = (turnoIndex % 6) + 1

      return {
        id: `mock-${dayIndex + 1}-${turnoIndex + 1}`,
        sucursalId: turnoIndex % 4 === 0 ? 's2' : 's1',
        fecha: getMonthDateKey(year, month, dayIndex + 1),
        hora: horarios[turnoIndex],
        barberoId: `barbero-${barberoNumber}`,
        servicioId: `srv-${servicioNumber}`,
        clienteNombre: `${nombresClientes[clienteIndex]} ${turnoIndex + 1}`,
        clienteTelefono: `362${String(1000000 + dayIndex * 50 + turnoIndex).padStart(7, '0')}`,
        estado: estados[turnoIndex % estados.length],
        esFijo: turnoIndex % 10 === 0,
        creadoPor: `barbero-${barberoNumber}`,
      } satisfies Turno
    }),
  )
}

export const MOCK_TURNOS: Turno[] = generateTurnosPorDia()

export const MOCK_TURNOS_FIJOS: TurnoFijo[] = [
  { id: 'tf-1', sucursalId: 's1', barberoId: 'barbero-1', servicioId: 'srv-2', clienteNombre: 'Nicolás García', clienteTelefono: '3731662839', diaSemana: 1, hora: '10:30', frecuenciaSemanas: 1, activo: true, proximaFecha: offset(7) },
  { id: 'tf-2', sucursalId: 's1', barberoId: 'barbero-2', servicioId: 'srv-1', clienteNombre: 'Mateo Silva', clienteTelefono: '3623333333', diaSemana: 3, hora: '14:00', frecuenciaSemanas: 2, activo: true, proximaFecha: offset(14) },
  { id: 'tf-3', sucursalId: 's2', barberoId: 'barbero-3', servicioId: 'srv-2', clienteNombre: 'Rodrigo Salas', clienteTelefono: '3620000000', diaSemana: 5, hora: '13:00', frecuenciaSemanas: 1, activo: true, proximaFecha: offset(7) },
]

export const agendaMock: Turno[] = MOCK_TURNOS
