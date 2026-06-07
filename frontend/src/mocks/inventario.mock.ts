import type { Producto, Venta } from '../types'

export const MOCK_PRODUCTOS: Producto[] = [
  { id: 'prod-1', nombre: 'Cera Mate Barbieri', variante: '100ml', categoria: 'Peinado', precioCosto: 15, precioVenta: 25, stockActual: 50, activo: true },
  { id: 'prod-2', nombre: 'Shampoo Anticaspa', variante: '400ml', categoria: 'Cuidado Capilar', precioCosto: 8, precioVenta: 14, stockActual: 30, activo: true },
  { id: 'prod-3', nombre: 'Acondicionador Revitalizante', variante: '300ml', categoria: 'Cuidado Capilar', precioCosto: 9, precioVenta: 16, stockActual: 25, activo: true },
  { id: 'prod-4', nombre: 'Navaja Premium', variante: undefined, categoria: 'Herramientas', precioCosto: 45, precioVenta: 80, stockActual: 10, activo: true },
  { id: 'prod-5', nombre: 'Crema de Afeitar Clásica', variante: '200ml', categoria: 'Afeitado', precioCosto: 12, precioVenta: 20, stockActual: 40, activo: true },
  { id: 'prod-6', nombre: 'Gel Fijador Extrafuerte', variante: '250ml', categoria: 'Peinado', precioCosto: 10, precioVenta: 18, stockActual: 35, activo: true },
  { id: 'prod-7', nombre: 'Aftershave Bálsamo', variante: '150ml', categoria: 'Afeitado', precioCosto: 18, precioVenta: 30, stockActual: 3, activo: true },
  { id: 'prod-8', nombre: 'Peine de Carbono', variante: undefined, categoria: 'Herramientas', precioCosto: 5, precioVenta: 9, stockActual: 60, activo: true },
  { id: 'prod-9', nombre: 'Mascarilla Hidratante', variante: '200ml', categoria: 'Cuidado Capilar', precioCosto: 20, precioVenta: 35, stockActual: 4, activo: true },
  { id: 'prod-10', nombre: 'Spray Texturizador', variante: '250ml', categoria: 'Peinado', precioCosto: 14, precioVenta: 24, stockActual: 0, activo: false },
]

const hoy = new Date()
const offset = (days: number): string => {
  const d = new Date(hoy)
  d.setDate(d.getDate() + days)
  return d.toISOString().slice(0, 10)
}

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

export const inventarioMock: Producto[] = MOCK_PRODUCTOS
