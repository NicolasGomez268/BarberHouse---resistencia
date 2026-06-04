import { useEffect, useState } from 'react'
import { MOCK_PRODUCTOS, MOCK_VENTAS } from '../../../mocks'
import { apiClient } from '../../../shared/api/client'
import type { Producto, Venta } from '../../../types'

const USE_MOCKS = import.meta.env.VITE_USE_MOCKS !== 'false'

export function useInventario() {
  const [productos, setProductos] = useState<Producto[]>(USE_MOCKS ? MOCK_PRODUCTOS : [])
  const [ventas, setVentas] = useState<Venta[]>(USE_MOCKS ? MOCK_VENTAS : [])
  const [loading, setLoading] = useState(!USE_MOCKS)
  const [error, setError] = useState<string | null>(null)

  async function cargarInventario() {
    try {
      const { data } = await apiClient.get<{ productos: Producto[] }>('/inventario')
      setProductos(data.productos)
    } catch {
      setError('Error al cargar el inventario')
    }
  }

  useEffect(() => {
    if (USE_MOCKS) return
    setLoading(true)
    cargarInventario().finally(() => setLoading(false))
  }, [])

  async function agregarProducto(producto: Omit<Producto, 'id'>) {
    if (!USE_MOCKS) {
      try {
        await apiClient.post('/inventario', producto)
        await cargarInventario()
      } catch {
        setError('Error al crear el producto')
      }
      return
    }
    const nuevo: Producto = { ...producto, id: `prod-${Date.now()}` }
    setProductos((prev) => [nuevo, ...prev])
  }

  async function actualizarProducto(id: string, datos: Partial<Producto>) {
    if (!USE_MOCKS) {
      try {
        await apiClient.patch(`/inventario/${id}`, datos)
        await cargarInventario()
      } catch {
        setError('Error al actualizar el producto')
      }
      return
    }
    setProductos((prev) => prev.map((producto) => (producto.id === id ? { ...producto, ...datos } : producto)))
  }

  async function ajustarStock(id: string, cantidad: number, operacion: 'agregar' | 'restar' | 'establecer') {
    if (!USE_MOCKS) {
      try {
        await apiClient.patch(`/inventario/${id}/stock`, { operacion, cantidad })
        await cargarInventario()
      } catch {
        setError('Error al ajustar el stock')
      }
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

  async function registrarVenta(venta: Omit<Venta, 'id'>) {
    if (!USE_MOCKS) {
      try {
        await apiClient.post('/inventario/ventas', venta)
        await cargarInventario()
      } catch {
        setError('Error al registrar la venta')
        throw new Error('Error al registrar la venta')
      }
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
