import { inventarioRepository } from './inventario.repository'
import type { VentaInsertPayload } from './inventario.repository'
import type { AjusteStockInput, ProductoInput, ProductoUpdateInput, VentaInput, VentaMultipleInput } from './inventario.schemas'

export class InventarioService {
  list() {
    return inventarioRepository.findAll()
  }

  create(input: ProductoInput) {
    return inventarioRepository.insertProducto(input)
  }

  update(id: string, input: ProductoUpdateInput) {
    return inventarioRepository.patchProducto(id, input)
  }

  delete(id: string) {
    return inventarioRepository.deleteProducto(id)
  }

  async ajustarStock(id: string, input: AjusteStockInput) {
    const producto = await inventarioRepository.findProducto(id)
    if (!producto) return null

    let nuevoStock: number
    if (input.operacion === 'agregar') nuevoStock = producto.stockActual + input.cantidad
    else if (input.operacion === 'restar') nuevoStock = Math.max(0, producto.stockActual - input.cantidad)
    else nuevoStock = input.cantidad

    return inventarioRepository.setStock(id, nuevoStock)
  }

  async registrarVenta(input: VentaInput) {
    const producto = await inventarioRepository.findProducto(input.productoId)
    if (!producto) throw new Error('Producto no encontrado')

    const precioUnitario = producto.precioVenta ?? 0
    if (precioUnitario <= 0) throw new Error('El producto no tiene precio de venta configurado')
    if (producto.stockActual < input.cantidad) throw new Error('Stock insuficiente')

    return inventarioRepository.insertVentaAtómica(input, precioUnitario, precioUnitario * input.cantidad, producto.nombre)
  }

  async registrarVentaMultiple(input: VentaMultipleInput) {
    const productos = await Promise.all(
      input.items.map((item) => inventarioRepository.findProducto(item.productoId)),
    )

    const payloads: VentaInsertPayload[] = input.items.map((item, i) => {
      const producto = productos[i]
      if (!producto) throw new Error(`Producto ${item.productoId} no encontrado`)

      const precioUnitario = producto.precioVenta ?? 0
      if (precioUnitario <= 0) throw new Error(`${producto.nombre} no tiene precio de venta configurado`)
      if (producto.stockActual < item.cantidad) throw new Error(`Stock insuficiente para ${producto.nombre}`)

      return {
        sucursalId: input.sucursalId,
        productoId: item.productoId,
        productoNombre: producto.nombre,
        cantidad: item.cantidad,
        metodoPago: input.metodoPago,
        vendedorId: input.vendedorId,
        notas: input.notas,
        precioUnitario,
        total: precioUnitario * item.cantidad,
      }
    })

    return inventarioRepository.insertVentasAtómicas(payloads)
  }

  listVentas(sucursalId?: string, fecha?: string) {
    return inventarioRepository.findVentas(sucursalId, fecha)
  }
}

export const inventarioService = new InventarioService()
