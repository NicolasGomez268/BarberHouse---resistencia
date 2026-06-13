import { useEffect, useState } from 'react'
import { apiClient } from '../../../shared/api/client'
import { localDateKey } from '../../../shared/utils/date'
import type { MetodoPago, Producto, SucursalId, Venta } from '../../../types'

export function useInventario() {
  const [productos, setProductos] = useState<Producto[]>([])
  const [ventas, setVentas] = useState<Venta[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  async function cargarInventario() {
    try {
      const { data } = await apiClient.get<{ productos: Producto[] }>('/inventario')
      setProductos(data.productos)
    } catch {
      setError('Error al cargar el inventario')
    }
  }

  async function cargarVentas(fecha?: string) {
    try {
      const params: Record<string, string> = {}
      if (fecha) params['fecha'] = fecha
      const { data } = await apiClient.get<{ ventas: Venta[] }>('/inventario/ventas', { params })
      setVentas(data.ventas)
    } catch {
      setError('Error al cargar las ventas')
    }
  }

  useEffect(() => {
    const today = localDateKey()
    setLoading(true)
    Promise.all([cargarInventario(), cargarVentas(today)]).finally(() => setLoading(false))
  }, [])

  async function agregarProducto(producto: Omit<Producto, 'id'>) {
    try {
      await apiClient.post('/inventario', producto)
      await cargarInventario()
    } catch {
      setError('Error al crear el producto')
    }
  }

  async function actualizarProducto(id: string, datos: Partial<Producto>) {
    try {
      await apiClient.patch(`/inventario/${id}`, datos)
      await cargarInventario()
    } catch {
      setError('Error al actualizar el producto')
    }
  }

  async function eliminarProducto(id: string) {
    try {
      await apiClient.delete(`/inventario/${id}`)
      await cargarInventario()
    } catch {
      setError('Error al eliminar el producto')
    }
  }

  async function ajustarStock(id: string, cantidad: number, operacion: 'agregar' | 'restar' | 'establecer') {
    try {
      await apiClient.patch(`/inventario/${id}/stock`, { operacion, cantidad })
      await cargarInventario()
    } catch {
      setError('Error al ajustar el stock')
    }
  }

  async function registrarVenta(venta: Omit<Venta, 'id'>): Promise<void> {
    const { fecha: _fecha, precioUnitario: _pu, total: _total, ...ventaInput } = venta
    const { data } = await apiClient.post<{ venta: Venta }>('/inventario/ventas', ventaInput)
    setVentas((prev) => [...prev, data.venta])
    await cargarInventario()
  }

  async function registrarVentaMultiple(
    items: Array<{ productoId: string; cantidad: number }>,
    meta: { sucursalId: SucursalId; metodoPago: MetodoPago; vendedorId: string; notas?: string },
  ): Promise<void> {
    const { data } = await apiClient.post<{ ventas: Venta[] }>('/inventario/ventas/multi', { ...meta, items })
    setVentas((prev) => [...prev, ...data.ventas])
    await cargarInventario()
  }

  return {
    productos,
    ventas,
    loading,
    error,
    agregarProducto,
    actualizarProducto,
    eliminarProducto,
    ajustarStock,
    registrarVenta,
    registrarVentaMultiple,
    cargarVentas,
  }
}
