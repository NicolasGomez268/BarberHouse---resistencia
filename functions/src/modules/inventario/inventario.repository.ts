import { FieldValue } from 'firebase-admin/firestore'
import { firestore } from '../../config/firebase'
import type { AjusteStockInput, ProductoInput, ProductoUpdateInput, VentaInput } from './inventario.schemas'

export type ProductoData = {
  id: string
  nombre: string
  variante?: string
  categoria?: string
  precioCosto?: number
  precioVenta?: number
  stockActual: number
  stock: number
  stockMinimo: number
  descripcion?: string
  isActive: boolean
}

export type VentaData = {
  id: string
  sucursalId: string
  productoId: string
  cantidad: number
  precioUnitario: number
  total: number
  metodoPago: string
  vendedorId: string
  notas?: string
  fecha?: unknown
}

function docToProducto(doc: FirebaseFirestore.DocumentSnapshot): ProductoData {
  const d = doc.data()!
  return {
    id: doc.id,
    nombre: d['nombre'],
    variante: d['variante'],
    categoria: d['categoria'],
    precioCosto: d['precioCosto'],
    precioVenta: d['precioVenta'],
    stockActual: d['stockActual'] ?? 0,
    stock: d['stockActual'] ?? 0,
    stockMinimo: d['stockMinimo'] ?? 0,
    descripcion: d['descripcion'],
    isActive: d['isActive'] ?? true,
  }
}

export class InventarioRepository {
  async findAll(): Promise<ProductoData[]> {
    const snap = await firestore.collection('productos').orderBy('nombre').get()
    return snap.docs.map(docToProducto)
  }

  async create(input: ProductoInput): Promise<ProductoData> {
    const data: Record<string, unknown> = {
      nombre: input.nombre,
      stockActual: input.stockActual ?? 0,
      stockMinimo: input.stockMinimo ?? 0,
      isActive: input.isActive ?? true,
      creadoEn: FieldValue.serverTimestamp(),
    }
    if (input.variante !== undefined) data['variante'] = input.variante
    if (input.categoria !== undefined) data['categoria'] = input.categoria
    if (input.precioCosto !== undefined) data['precioCosto'] = input.precioCosto
    if (input.precioVenta !== undefined) data['precioVenta'] = input.precioVenta
    if (input.descripcion !== undefined) data['descripcion'] = input.descripcion

    const ref = await firestore.collection('productos').add(data)
    return docToProducto(await ref.get())
  }

  async update(id: string, input: ProductoUpdateInput): Promise<ProductoData | null> {
    const ref = firestore.collection('productos').doc(id)
    const doc = await ref.get()
    if (!doc.exists) return null

    const { stock: _stock, ...rest } = input as ProductoUpdateInput & { stock?: number }
    const payload: Record<string, unknown> = { actualizadoEn: FieldValue.serverTimestamp() }
    for (const [key, value] of Object.entries(rest)) {
      if (value !== undefined) payload[key] = value
    }

    await ref.update(payload)
    return docToProducto(await ref.get())
  }

  async delete(id: string): Promise<boolean> {
    const doc = await firestore.collection('productos').doc(id).get()
    if (!doc.exists) return false
    await firestore.collection('productos').doc(id).delete()
    return true
  }

  async ajustarStock(id: string, input: AjusteStockInput): Promise<ProductoData | null> {
    const ref = firestore.collection('productos').doc(id)
    const doc = await ref.get()
    if (!doc.exists) return null

    const actual = doc.data()!['stockActual'] ?? 0
    let nuevoStock: number
    if (input.operacion === 'agregar') nuevoStock = actual + input.cantidad
    else if (input.operacion === 'restar') nuevoStock = Math.max(0, actual - input.cantidad)
    else nuevoStock = input.cantidad

    await ref.update({ stockActual: nuevoStock, actualizadoEn: FieldValue.serverTimestamp() })
    return docToProducto(await ref.get())
  }

  async registrarVenta(input: VentaInput): Promise<VentaData> {
    const productoRef = firestore.collection('productos').doc(input.productoId)
    const ventaRef = firestore.collection('ventas').doc()

    await firestore.runTransaction(async (tx) => {
      const productoDoc = await tx.get(productoRef)
      if (!productoDoc.exists) throw new Error('Producto no encontrado')

      const stockActual = productoDoc.data()!['stockActual'] ?? 0
      const nuevoStock = Math.max(0, stockActual - input.cantidad)

      tx.set(ventaRef, {
        ...input,
        fecha: FieldValue.serverTimestamp(),
      })
      tx.update(productoRef, {
        stockActual: nuevoStock,
        actualizadoEn: FieldValue.serverTimestamp(),
      })
    })

    return { id: ventaRef.id, ...input }
  }
}

export const inventarioRepository = new InventarioRepository()
