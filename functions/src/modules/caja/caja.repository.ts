import { FieldValue } from 'firebase-admin/firestore'
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
  prepagado?: boolean
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

export type CierreDeCaja = {
  id: string
  sucursalId: string
  fecha: string
  sistemaEfectivo: number
  sistemaTransferencia: number
  contadoEfectivo: number
  contadoTransferencia: number
  oficialEfectivo: number
  oficialTransferencia: number
  diferenciaEfectivo: number
  diferenciaTransferencia: number
}

export class CajaRepository {
  async validarPin(pin: string): Promise<string[] | null> {
    const doc = await firestore.collection('config').doc('pines').get()
    if (!doc.exists) return null
    const data = doc.data() as Record<string, string[]>
    return data[pin] ?? null
  }

  async findTurnosRealizados(sucursalId: string, desde: string, hasta: string): Promise<TurnoParaCaja[]> {
    const snapFecha = await firestore.collection('turnos')
      .where('sucursalId', '==', sucursalId)
      .where('estado', '==', 'REALIZADO')
      .where('fecha', '>=', desde)
      .where('fecha', '<=', hasta)
      .get()

    let snapFechaPago: FirebaseFirestore.QuerySnapshot | null = null
    try {
      snapFechaPago = await firestore.collection('turnos')
        .where('sucursalId', '==', sucursalId)
        .where('estado', '==', 'REALIZADO')
        .where('fechaPago', '>=', desde)
        .where('fechaPago', '<=', hasta)
        .get()
    } catch {
      // índice aún construyéndose, se usa solo fecha como fallback
    }

    const seen = new Set<string>()
    const docs: FirebaseFirestore.QueryDocumentSnapshot[] = []

    if (snapFechaPago) {
      for (const doc of snapFechaPago.docs) {
        seen.add(doc.id)
        docs.push(doc)
      }
    }

    for (const doc of snapFecha.docs) {
      if (seen.has(doc.id)) continue
      if (doc.data()['fechaPago']) continue
      seen.add(doc.id)
      docs.push(doc)
    }

    return docs.map((doc) => {
      const d = doc.data()
      return {
        id: doc.id,
        sucursalId: d['sucursalId'],
        barberoId: d['barberoId'],
        servicioId: d['servicioId'],
        clienteNombre: d['clienteNombre'] ?? '',
        fecha: d['fechaPago'] ?? d['fecha'],
        hora: d['hora'] ?? '00:00',
        metodoPago: d['metodoPago'],
        montoEfectivo: d['montoEfectivo'],
        montoTransferencia: d['montoTransferencia'],
        prepagado: d['prepagado'],
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

  async upsertCierre(data: Omit<CierreDeCaja, 'id'>): Promise<CierreDeCaja> {
    const existing = await firestore
      .collection('cierresDeCaja')
      .where('sucursalId', '==', data.sucursalId)
      .where('fecha', '==', data.fecha)
      .limit(1)
      .get()

    if (!existing.empty) {
      const ref = existing.docs[0]!.ref
      await ref.update({ ...data, updatedAt: FieldValue.serverTimestamp() })
      return { id: ref.id, ...data }
    }

    const ref = await firestore.collection('cierresDeCaja').add({
      ...data,
      creadoAt: FieldValue.serverTimestamp(),
    })
    return { id: ref.id, ...data }
  }

  async findCierre(sucursalId: string, fecha: string): Promise<CierreDeCaja | null> {
    const snap = await firestore
      .collection('cierresDeCaja')
      .where('sucursalId', '==', sucursalId)
      .where('fecha', '==', fecha)
      .limit(1)
      .get()

    if (snap.empty) return null
    const doc = snap.docs[0]!
    const d = doc.data()
    return {
      id: doc.id,
      sucursalId: d['sucursalId'],
      fecha: d['fecha'],
      sistemaEfectivo: d['sistemaEfectivo'],
      sistemaTransferencia: d['sistemaTransferencia'],
      contadoEfectivo: d['contadoEfectivo'],
      contadoTransferencia: d['contadoTransferencia'],
      oficialEfectivo: d['oficialEfectivo'],
      oficialTransferencia: d['oficialTransferencia'],
      diferenciaEfectivo: d['diferenciaEfectivo'],
      diferenciaTransferencia: d['diferenciaTransferencia'],
    }
  }
}

export const cajaRepository = new CajaRepository()
