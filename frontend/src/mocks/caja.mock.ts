import type { CajaMockData, CajaTurnoRealizado, CajaVentaProducto, MetodoPago, SucursalId } from '../types'

const paymentMethods: MetodoPago[] = ['efectivo', 'transferencia', 'tarjeta']
const branches: SucursalId[] = ['s1', 's2']

const barbers = [
  { id: 'barbero-1', nombre: 'Carlos Sando', porcentajeCasa: 40, isOwner: false },
  { id: 'barbero-2', nombre: 'Diego Martínez', porcentajeCasa: 40, isOwner: false },
  { id: 'barbero-3', nombre: 'Juan Pérez', porcentajeCasa: 0, isOwner: true },
  { id: 'barbero-4', nombre: 'Mario', porcentajeCasa: 45, isOwner: false },
]

const services = [
  { nombre: 'Corte de Cabello', monto: 8000 },
  { nombre: 'Arreglo de Barba', monto: 6000 },
  { nombre: 'Corte + Barba', monto: 13000 },
  { nombre: 'Depilación Facial', monto: 5000 },
  { nombre: 'Depilación de Cejas', monto: 3500 },
]

const products = [
  { nombre: 'Aceite para Barba', monto: 6000 },
  { nombre: 'Pomada Mate', monto: 6500 },
  { nombre: 'Cera para Bigote', monto: 4000 },
  { nombre: 'Peine de Madera', monto: 3000 },
]

function dateKey(daysAgo: number) {
  const date = new Date()
  date.setDate(date.getDate() - daysAgo)
  return date.toISOString().slice(0, 10)
}

function createTurnos(): CajaTurnoRealizado[] {
  const turnos: CajaTurnoRealizado[] = []

  for (let day = 0; day < 30; day += 1) {
    branches.forEach((sucursalId, branchIndex) => {
      for (let index = 0; index < 4; index += 1) {
        const barber = barbers[(day + index + branchIndex) % barbers.length]
        const service = services[(day + index) % services.length]
        turnos.push({
          id: `turno-${sucursalId}-${day}-${index}`,
          sucursalId,
          fecha: dateKey(day),
          hora: `${String(9 + index * 2).padStart(2, '0')}:30`,
          cliente: `Cliente ${day + 1}-${index + 1}`,
          servicio: service.nombre,
          barberoId: barber.id,
          barberoNombre: barber.nombre,
          monto: service.monto,
          metodoPago: paymentMethods[(day + index) % paymentMethods.length],
          estado: 'realizado',
          porcentajeCasa: barber.isOwner ? 0 : barber.porcentajeCasa,
          isOwner: barber.isOwner,
        })
      }
    })
  }

  return turnos
}

function createVentas(): CajaVentaProducto[] {
  const ventas: CajaVentaProducto[] = []

  for (let day = 0; day < 30; day += 1) {
    branches.forEach((sucursalId, branchIndex) => {
      for (let index = 0; index < 2; index += 1) {
        const product = products[(day + index + branchIndex) % products.length]
        const cantidad = ((day + index) % 3) + 1
        ventas.push({
          id: `venta-${sucursalId}-${day}-${index}`,
          sucursalId,
          fecha: dateKey(day),
          hora: `${String(12 + index * 3).padStart(2, '0')}:15`,
          producto: product.nombre,
          cantidad,
          monto: product.monto * cantidad,
          metodoPago: paymentMethods[(day + index + 1) % paymentMethods.length],
        })
      }
    })
  }

  return ventas
}

export const cajaMock: CajaMockData = {
  pines: {
    '1234': ['s1'],
    '5678': ['s2'],
    '9999': ['s1', 's2'],
  },
  sucursales: {
    s1: 'Sucursal 1',
    s2: 'Sucursal 2',
  },
  turnos: createTurnos(),
  ventas: createVentas(),
}
