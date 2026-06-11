import { firestore } from '../../config/firebase'

export type TurnoParaCaja = {
  id: string
  sucursalId: string
  barberoId: string
  servicioId: string
  clienteNombre: string
  fecha: string
  hora: string
  metodoPago: string
  montoEfectivo?: number
  montoTransferencia?: number
}

export type VentaParaCaja = {
  id: string
  sucursalId: string
  productoId: string
  productoNombre?: string
  cantidad: number
  total: number
  metodoPago: string
  fecha: string
  hora: string
}

export type BarberoParaCaja = {
  nombre: string
  porcentajeCasa: number
  esDueno: boolean
}

export type ServicioParaCaja = {
  nombre: string
  precio: number
}

export type ProductoParaCaja = {
  nombre: string
}

export class CajaRepository {
  async validarPin(pin: string): Promise<string[] | null> {
    const doc = await firestore.collection('config').doc('pines').get()
    if (!doc.exists) return null
    const data = doc.data() as Record<string, string[]>
    return data[pin] ?? null
  }

  async findTurnosRealizados(sucursalId: string, desde: string, hasta: string): Promise<TurnoParaCaja[]> {
    const snap = await firestore
      .collection('turnos')
      .where('sucursalId', '==', sucursalId)
      .where('estado', '==', 'REALIZADO')
      .where('fecha', '>=', desde)
      .where('fecha', '<=', hasta)
      .get()
    return snap.docs.map((doc) => {
      const d = doc.data()
      return {
        id: doc.id,
        sucursalId: d['sucursalId'],
        barberoId: d['barberoId'],
        servicioId: d['servicioId'],
        clienteNombre: d['clienteNombre'] ?? '',
        fecha: d['fecha'],
        hora: d['hora'] ?? '00:00',
        metodoPago: d['metodoPago'],
        montoEfectivo: d['montoEfectivo'],
        montoTransferencia: d['montoTransferencia'],
      }
    })
  }

  async findVentas(sucursalId: string, desde: string, hasta: string): Promise<VentaParaCaja[]> {
    const snap = await firestore
      .collection('ventas')
      .where('sucursalId', '==', sucursalId)
      .where('fecha', '>=', desde)
      .where('fecha', '<=', hasta)
      .get()
    return snap.docs.map((doc) => {
      const d = doc.data()
      return {
        id: doc.id,
        sucursalId: d['sucursalId'],
        productoId: d['productoId'],
        productoNombre: d['productoNombre'],
        cantidad: d['cantidad'],
        total: d['total'],
        metodoPago: d['metodoPago'],
        fecha: d['fecha'],
        hora: d['hora'] ?? '00:00',
      }
    })
  }

  async getBarberos(): Promise<Map<string, BarberoParaCaja>> {
    const snap = await firestore.collection('barberos').get()
    const map = new Map<string, BarberoParaCaja>()
    snap.docs.forEach((doc) => {
      const d = doc.data()
      map.set(doc.id, {
        nombre: d['nombre'],
        porcentajeCasa: d['porcentajeCasa'] ?? 0,
        esDueno: d['esDueno'] ?? false,
      })
    })
    return map
  }

  async getServicios(): Promise<Map<string, ServicioParaCaja>> {
    const snap = await firestore.collection('servicios').get()
    const map = new Map<string, ServicioParaCaja>()
    snap.docs.forEach((doc) => {
      const d = doc.data()
      map.set(doc.id, {
        nombre: d['nombre'],
        precio: d['precio'] ?? 0,
      })
    })
    return map
  }

  async getProductos(): Promise<Map<string, ProductoParaCaja>> {
    const snap = await firestore.collection('productos').get()
    const map = new Map<string, ProductoParaCaja>()
    snap.docs.forEach((doc) => {
      const d = doc.data()
      map.set(doc.id, { nombre: d['nombre'] })
    })
    return map
  }
}

export const cajaRepository = new CajaRepository()
