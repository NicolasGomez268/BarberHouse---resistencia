import { useState } from 'react'
import { MOCK_PRODUCTOS, MOCK_VENTAS } from '../../../mocks'
import type { Producto, Venta } from '../../../types'

const USE_MOCKS = import.meta.env.VITE_USE_MOCKS !== 'false'

export function useInventario() {
  const [productos, setProductos] = useState<Producto[]>(USE_MOCKS ? MOCK_PRODUCTOS : [])
  const [ventas, setVentas] = useState<Venta[]>(USE_MOCKS ? MOCK_VENTAS : [])
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

  function ajustarStock(id: string, cantidad: number, operacion: 'agregar' | 'restar' | 'establecer') {
    if (!USE_MOCKS) {
      // TODO: PATCH /api/v1/inventario/productos/:id/stock
      return
    }

    setProductos((prev) =>
      prev.map((producto) => {
        if (producto.id !== id) return producto
        let nuevoStock = producto.stockActual ?? producto.stock ?? 0
        if (operacion === 'agregar') nuevoStock += cantidad
        if (operacion === 'restar') nuevoStock = Math.max(0, nuevoStock - cantidad)
        if (operacion === 'establecer') nuevoStock = cantidad
        return { ...producto, stockActual: nuevoStock, stock: nuevoStock }
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
    if ((producto.stockActual ?? producto.stock ?? 0) < venta.cantidad) {
      throw new Error('Stock insuficiente')
    }

    const nueva: Venta = { ...venta, id: `vta-${Date.now()}` }
    setVentas((prev) => [...prev, nueva])
    ajustarStock(venta.productoId, venta.cantidad, 'restar')
  }

  return {
    productos,
    ventas,
    loading,
    error,
    agregarProducto,
    actualizarProducto,
    ajustarStock,
    registrarVenta,
  }
}
