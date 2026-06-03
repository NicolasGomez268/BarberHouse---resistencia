import type { Producto, TransferenciaStock, Venta } from '../types'

const hoy = new Date()
const offset = (days: number): string => {
  const d = new Date(hoy)
  d.setDate(d.getDate() + days)
  return d.toISOString().slice(0, 10)
}

export const MOCK_PRODUCTOS: Producto[] = [
  {
    id: 'prod-1',
    nombre: 'Cera Mate Barbieri',
    variante: '100ml',
    categoria: 'Peinado',
    precioCosto: 15,
    precioVenta: 25,
    stockPorSucursal: [
      { sucursalId: 's1', stockActual: 30 },
      { sucursalId: 's2', stockActual: 20 },
    ],
    isActive: true,
  },
  {
    id: 'prod-2',
    nombre: 'Shampoo Anticaspa',
    variante: '400ml',
    categoria: 'Cuidado Capilar',
    precioCosto: 8,
    precioVenta: 14,
    stockPorSucursal: [
      { sucursalId: 's1', stockActual: 20 },
      { sucursalId: 's2', stockActual: 10 },
    ],
    isActive: true,
  },
  {
    id: 'prod-3',
    nombre: 'Acondicionador Revitalizante',
    variante: '300ml',
    categoria: 'Cuidado Capilar',
    precioCosto: 9,
    precioVenta: 16,
    stockPorSucursal: [
      { sucursalId: 's1', stockActual: 15 },
      { sucursalId: 's2', stockActual: 10 },
    ],
    isActive: true,
  },
  {
    id: 'prod-4',
    nombre: 'Navaja Premium',
    categoria: 'Herramientas',
    precioCosto: 45,
    precioVenta: 80,
    stockPorSucursal: [
      { sucursalId: 's1', stockActual: 8 },
      { sucursalId: 's2', stockActual: 2 },
    ],
    isActive: true,
  },
  {
    id: 'prod-5',
    nombre: 'Crema de Afeitar Clasica',
    variante: '200ml',
    categoria: 'Afeitado',
    precioCosto: 12,
    precioVenta: 20,
    stockPorSucursal: [
      { sucursalId: 's1', stockActual: 25 },
      { sucursalId: 's2', stockActual: 15 },
    ],
    isActive: true,
  },
  {
    id: 'prod-6',
    nombre: 'Gel Fijador Extrafuerte',
    variante: '250ml',
    categoria: 'Peinado',
    precioCosto: 10,
    precioVenta: 18,
    stockPorSucursal: [
      { sucursalId: 's1', stockActual: 20 },
      { sucursalId: 's2', stockActual: 15 },
    ],
    isActive: true,
  },
  {
    id: 'prod-7',
    nombre: 'Aftershave Balsamo',
    variante: '150ml',
    categoria: 'Afeitado',
    precioCosto: 18,
    precioVenta: 30,
    stockPorSucursal: [
      { sucursalId: 's1', stockActual: 2 },
      { sucursalId: 's2', stockActual: 1 },
    ],
    isActive: true,
  },
  {
    id: 'prod-8',
    nombre: 'Peine de Carbono',
    categoria: 'Herramientas',
    precioCosto: 5,
    precioVenta: 9,
    stockPorSucursal: [
      { sucursalId: 's1', stockActual: 35 },
      { sucursalId: 's2', stockActual: 25 },
    ],
    isActive: true,
  },
  {
    id: 'prod-9',
    nombre: 'Mascarilla Hidratante',
    variante: '200ml',
    categoria: 'Cuidado Capilar',
    precioCosto: 20,
    precioVenta: 35,
    stockPorSucursal: [
      { sucursalId: 's1', stockActual: 3 },
      { sucursalId: 's2', stockActual: 1 },
    ],
    isActive: true,
  },
  {
    id: 'prod-10',
    nombre: 'Spray Texturizador',
    variante: '250ml',
    categoria: 'Peinado',
    precioCosto: 14,
    precioVenta: 24,
    stockPorSucursal: [
      { sucursalId: 's1', stockActual: 0 },
      { sucursalId: 's2', stockActual: 0 },
    ],
    isActive: false,
  },
]

export const MOCK_VENTAS: Venta[] = [
  { id: 'vta-1', sucursalId: 's1', fecha: offset(0), productoId: 'prod-1', cantidad: 2, precioUnitario: 25, total: 50, metodoPago: 'EFECTIVO', vendedorId: 'barbero-1' },
  { id: 'vta-2', sucursalId: 's1', fecha: offset(0), productoId: 'prod-5', cantidad: 1, precioUnitario: 20, total: 20, metodoPago: 'TRANSFERENCIA', vendedorId: 'barbero-2' },
  { id: 'vta-3', sucursalId: 's2', fecha: offset(-1), productoId: 'prod-2', cantidad: 3, precioUnitario: 14, total: 42, metodoPago: 'TARJETA', vendedorId: 'barbero-3' },
  { id: 'vta-4', sucursalId: 's1', fecha: offset(-1), productoId: 'prod-6', cantidad: 1, precioUnitario: 18, total: 18, metodoPago: 'EFECTIVO', vendedorId: 'barbero-1' },
  { id: 'vta-5', sucursalId: 's2', fecha: offset(-2), productoId: 'prod-4', cantidad: 1, precioUnitario: 80, total: 80, metodoPago: 'TRANSFERENCIA', vendedorId: 'barbero-3' },
  { id: 'vta-6', sucursalId: 's1', fecha: offset(-3), productoId: 'prod-3', cantidad: 2, precioUnitario: 16, total: 32, metodoPago: 'EFECTIVO', vendedorId: 'barbero-2' },
  { id: 'vta-7', sucursalId: 's1', fecha: offset(-5), productoId: 'prod-7', cantidad: 1, precioUnitario: 30, total: 30, metodoPago: 'TARJETA', vendedorId: 'barbero-1' },
  { id: 'vta-8', sucursalId: 's2', fecha: offset(-7), productoId: 'prod-1', cantidad: 3, precioUnitario: 25, total: 75, metodoPago: 'EFECTIVO', vendedorId: 'barbero-3' },
  { id: 'vta-9', sucursalId: 's1', fecha: offset(-10), productoId: 'prod-8', cantidad: 5, precioUnitario: 9, total: 45, metodoPago: 'TRANSFERENCIA', vendedorId: 'barbero-2' },
  { id: 'vta-10', sucursalId: 's2', fecha: offset(-14), productoId: 'prod-2', cantidad: 2, precioUnitario: 14, total: 28, metodoPago: 'TARJETA', vendedorId: 'barbero-3' },
]

export const MOCK_TRANSFERENCIAS: TransferenciaStock[] = [
  {
    id: 'transf-1',
    productoId: 'prod-7',
    sucursalOrigen: 's1',
    sucursalDestino: 's2',
    cantidad: 3,
    fecha: offset(-5),
    solicitadoPor: 'barbero-3',
    notas: 'Stock bajo en sucursal 2',
  },
  {
    id: 'transf-2',
    productoId: 'prod-4',
    sucursalOrigen: 's1',
    sucursalDestino: 's2',
    cantidad: 2,
    fecha: offset(-10),
    solicitadoPor: 'barbero-1',
    notas: 'Pedido de sucursal 2',
  },
]

export const inventarioMock: Producto[] = MOCK_PRODUCTOS
