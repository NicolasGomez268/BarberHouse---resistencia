import type { Producto, SucursalId } from '../../types'

export function getStockSucursal(producto: Producto, sucursalId: SucursalId): number {
  return producto.stockPorSucursal.find((stock) => stock.sucursalId === sucursalId)?.stockActual ?? 0
}

export function getStockTotal(producto: Producto): number {
  return producto.stockPorSucursal.reduce((total, stock) => total + stock.stockActual, 0)
}
