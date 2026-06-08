import { FieldValue } from 'firebase-admin/firestore'
import { firestore } from '../../config/firebase'
import type { ProductoInput, ProductoUpdateInput, VentaData, VentaInput } from './inventario.schemas'

export type ProductoData = {
  id: string
  nombre: string
  variante?: string
  categoria?: string
  precioCosto?: number
  precioVenta?: number
  stockActual: number
  stockMinimo: number
  descripcion?: string
  activo: boolean
}

export type VentaInsertPayload = {
  sucursalId: string
  productoId: string
  productoNombre: string
  cantidad: number
  metodoPago: VentaData['metodoPago']
  vendedorId: string
  notas?: string
  precioUnitario: number
  total: number
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
    stockMinimo: d['stockMinimo'] ?? 0,
    descripcion: d['descripcion'],
    activo: d['activo'] ?? true,
  }
}

function docToVenta(doc: FirebaseFirestore.DocumentSnapshot): VentaData {
  const d = doc.data()!
  return {
    id: doc.id,
    sucursalId: d['sucursalId'],
    productoId: d['productoId'],
    cantidad: d['cantidad'],
    metodoPago: d['metodoPago'],
    vendedorId: d['vendedorId'],
    notas: d['notas'],
    fecha: d['fecha'],
    hora: d['hora'],
    productoNombre: d['productoNombre'],
    precioUnitario: d['precioUnitario'],
    total: d['total'],
  }
}

function normalizeCategoria(categoria: string | undefined): string | undefined {
  return categoria ? categoria.trim().toLowerCase() : undefined
}

export class InventarioRepository {
  async findAll(): Promise<ProductoData[]> {
    const snap = await firestore.collection('productos').orderBy('nombre').get()
    return snap.docs.map(docToProducto)
  }

  async findProducto(id: string): Promise<ProductoData | null> {
    const doc = await firestore.collection('productos').doc(id).get()
    if (!doc.exists) return null
    return docToProducto(doc)
  }

  async insertProducto(input: ProductoInput): Promise<ProductoData> {
    const data: Record<string, unknown> = {
      nombre: input.nombre,
      stockActual: input.stockActual ?? 0,
      stockMinimo: input.stockMinimo ?? 0,
      activo: input.activo ?? true,
      creadoEn: FieldValue.serverTimestamp(),
    }
    if (input.variante !== undefined) data['variante'] = input.variante
    if (input.categoria !== undefined) data['categoria'] = normalizeCategoria(input.categoria)
    if (input.precioCosto !== undefined) data['precioCosto'] = input.precioCosto
    if (input.precioVenta !== undefined) data['precioVenta'] = input.precioVenta
    if (input.descripcion !== undefined) data['descripcion'] = input.descripcion

    const ref = await firestore.collection('productos').add(data)
    return docToProducto(await ref.get())
  }

  async patchProducto(id: string, input: ProductoUpdateInput): Promise<ProductoData | null> {
    const ref = firestore.collection('productos').doc(id)
    const doc = await ref.get()
    if (!doc.exists) return null

    const payload: Record<string, unknown> = { actualizadoEn: FieldValue.serverTimestamp() }
    for (const [key, value] of Object.entries(input)) {
      if (value !== undefined) {
        payload[key] = key === 'categoria' ? normalizeCategoria(value as string) : value
      }
    }

    await ref.update(payload)
    return docToProducto(await ref.get())
  }

  async deleteProducto(id: string): Promise<boolean> {
    const doc = await firestore.collection('productos').doc(id).get()
    if (!doc.exists) return false
    await firestore.collection('productos').doc(id).delete()
    return true
  }

  // Recibe el valor de stock ya calculado por el service.
  async setStock(id: string, nuevoStock: number): Promise<ProductoData | null> {
    const ref = firestore.collection('productos').doc(id)
    const doc = await ref.get()
    if (!doc.exists) return null
    await ref.update({ stockActual: nuevoStock, actualizadoEn: FieldValue.serverTimestamp() })
    return docToProducto(await ref.get())
  }

  // Recibe datos pre-calculados por el service. Re-verifica el stock dentro de la transacción
  // como invariante de consistencia (previene stock negativo bajo concurrencia).
  async insertVentaAtómica(
    input: VentaInput,
    precioUnitario: number,
    total: number,
    productoNombre: string,
  ): Promise<VentaData> {
    const productoRef = firestore.collection('productos').doc(input.productoId)
    const ventaRef = firestore.collection('ventas').doc()
    const fecha = new Date().toISOString().slice(0, 10)
    const hora = new Date().toISOString().slice(11, 16)

    await firestore.runTransaction(async (tx) => {
      const productoDoc = await tx.get(productoRef)
      if (!productoDoc.exists) throw new Error('Producto no encontrado')
      const stockActual: number = productoDoc.data()!['stockActual'] ?? 0
      if (stockActual < input.cantidad) throw new Error('Stock insuficiente')

      tx.set(ventaRef, { ...input, fecha, hora, precioUnitario, total, productoNombre })
      tx.update(productoRef, {
        stockActual: stockActual - input.cantidad,
        actualizadoEn: FieldValue.serverTimestamp(),
      })
    })

    return { id: ventaRef.id, ...input, fecha, hora, precioUnitario, total, productoNombre }
  }

  // Recibe payloads pre-calculados por el service. Re-verifica stock en transacción por atomicidad.
  async insertVentasAtómicas(payloads: VentaInsertPayload[]): Promise<VentaData[]> {
    const fecha = new Date().toISOString().slice(0, 10)
    const hora = new Date().toISOString().slice(11, 16)
    const resultado: VentaData[] = []

    const productoRefs = payloads.map((p) => firestore.collection('productos').doc(p.productoId))
    const ventaRefs = payloads.map(() => firestore.collection('ventas').doc())

    await firestore.runTransaction(async (tx) => {
      const productoDocs = await Promise.all(productoRefs.map((ref) => tx.get(ref)))

      for (let i = 0; i < payloads.length; i++) {
        const doc = productoDocs[i]
        if (!doc.exists) throw new Error(`Producto ${payloads[i].productoId} no encontrado`)
        const stockActual: number = doc.data()!['stockActual'] ?? 0
        if (stockActual < payloads[i].cantidad) throw new Error(`Stock insuficiente para ${payloads[i].productoNombre}`)

        tx.set(ventaRefs[i], { ...payloads[i], fecha, hora })
        tx.update(productoRefs[i], {
          stockActual: stockActual - payloads[i].cantidad,
          actualizadoEn: FieldValue.serverTimestamp(),
        })
      }
    })

    payloads.forEach((p, i) => {
      resultado.push({ id: ventaRefs[i].id, ...p, fecha, hora })
    })

    return resultado
  }

  async findVentas(sucursalId?: string, fecha?: string): Promise<VentaData[]> {
    let query: FirebaseFirestore.Query = firestore.collection('ventas')
    if (sucursalId) query = query.where('sucursalId', '==', sucursalId)
    if (fecha) query = query.where('fecha', '==', fecha)
    const snap = await query.get()
    return snap.docs.map(docToVenta)
  }
}

export const inventarioRepository = new InventarioRepository()
