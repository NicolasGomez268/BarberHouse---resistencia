import { useState } from 'react'
import { MOCK_PRODUCTOS, MOCK_TRANSFERENCIAS, MOCK_VENTAS } from '../../../mocks'
import { getStockSucursal } from '../../../shared/utils/stock'
import type { Producto, SucursalId, TransferenciaStock, Venta } from '../../../types'

const USE_MOCKS = import.meta.env.VITE_USE_MOCKS !== 'false'

export function useInventario() {
  const [productos, setProductos] = useState<Producto[]>(USE_MOCKS ? MOCK_PRODUCTOS : [])
  const [ventas, setVentas] = useState<Venta[]>(USE_MOCKS ? MOCK_VENTAS : [])
  const [transferencias, setTransferencias] = useState<TransferenciaStock[]>(USE_MOCKS ? MOCK_TRANSFERENCIAS : [])
  const [loading] = useState(false)
  const [error] = useState<string | null>(null)

  function agregarProducto(producto: Omit<Producto, 'id'>) {
    if (!USE_MOCKS) {
      // TODO: POST /api/v1/inventario/productos
      return
    }

    const nuevo: Producto = { ...producto, id: `prod-${Date.now()}` }
    setProductos((prev) => [nuevo, ...prev])
  }

  function actualizarProducto(id: string, datos: Partial<Producto>) {
    if (!USE_MOCKS) {
      // TODO: PATCH /api/v1/inventario/productos/:id
      return
    }

    setProductos((prev) => prev.map((producto) => (producto.id === id ? { ...producto, ...datos } : producto)))
  }

  function ajustarStock(
    productoId: string,
    sucursalId: SucursalId,
    cantidad: number,
    operacion: 'agregar' | 'restar' | 'establecer',
  ) {
    if (!USE_MOCKS) {
      // TODO: PATCH /api/v1/inventario/productos/:id/stock
      return
    }

    setProductos((prev) =>
      prev.map((producto) => {
        if (producto.id !== productoId) return producto

        return {
          ...producto,
          stockPorSucursal: producto.stockPorSucursal.map((stock) => {
            if (stock.sucursalId !== sucursalId) return stock

            let nuevoStock = stock.stockActual
            if (operacion === 'agregar') nuevoStock += cantidad
            if (operacion === 'restar') nuevoStock = Math.max(0, nuevoStock - cantidad)
            if (operacion === 'establecer') nuevoStock = cantidad

            return { ...stock, stockActual: nuevoStock }
          }),
        }
      }),
    )
  }

  function registrarVenta(venta: Omit<Venta, 'id'>) {
    if (!USE_MOCKS) {
      // TODO: POST /api/v1/inventario/ventas
      return
    }

    const producto = productos.find((current) => current.id === venta.productoId)
    if (!producto) throw new Error('Producto no encontrado')

    const stockSucursal = getStockSucursal(producto, venta.sucursalId)
    if (stockSucursal < venta.cantidad) {
      throw new Error(`Stock insuficiente en esta sucursal. Disponible: ${stockSucursal}`)
    }

    const nueva: Venta = { ...venta, id: `vta-${Date.now()}` }
    setVentas((prev) => [...prev, nueva])
    ajustarStock(venta.productoId, venta.sucursalId, venta.cantidad, 'restar')
  }

  function transferirStock(
    productoId: string,
    sucursalOrigen: SucursalId,
    sucursalDestino: SucursalId,
    cantidad: number,
    solicitadoPor: string,
    notas?: string,
  ) {
    if (!USE_MOCKS) {
      // TODO: POST /api/v1/inventario/transferencias
      return
    }

    const producto = productos.find((current) => current.id === productoId)
    if (!producto) throw new Error('Producto no encontrado')

    const stockOrigen = getStockSucursal(producto, sucursalOrigen)
    if (stockOrigen < cantidad) {
      throw new Error(`Stock insuficiente en sucursal origen. Disponible: ${stockOrigen}`)
    }

    ajustarStock(productoId, sucursalOrigen, cantidad, 'restar')
    ajustarStock(productoId, sucursalDestino, cantidad, 'agregar')

    const nueva: TransferenciaStock = {
      id: `transf-${Date.now()}`,
      productoId,
      sucursalOrigen,
      sucursalDestino,
      cantidad,
      fecha: new Date().toISOString().slice(0, 10),
      solicitadoPor,
      notas,
    }
    setTransferencias((prev) => [...prev, nueva])
  }

  return {
    productos,
    ventas,
    transferencias,
    loading,
    error,
    agregarProducto,
    actualizarProducto,
    ajustarStock,
    registrarVenta,
    transferirStock,
  }
}
