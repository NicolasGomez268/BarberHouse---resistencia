import { FieldValue } from 'firebase-admin/firestore'
import { firestore } from '../../config/firebase'
import type { ClienteData } from './clientes.schemas'

export type TurnoParaCliente = {
  id: string
  fecha: string
  hora: string
  servicioNombre: string
  barberoNombre: string
  sucursalId: string
  estado: string
  metodoPago?: string
  monto?: number
  prepagado?: boolean
}

export type PaqueteParaCliente = {
  id: string
  fecha: string
  cantidadTotal: number
  cantidadUsada: number
  precioTotal: number
  metodoPago: string
  sucursalId: string
  activo: boolean
}

export class ClientesRepository {
  async findClientes(search?: string): Promise<ClienteData[]> {
    const [clientesSnap, paquetesSnap] = await Promise.all([
      firestore.collection('clientes').orderBy('nombre').get(),
      firestore.collection('paquetes').get(),
    ])

    const activosPorTelefono = new Map<string, number>()
    for (const doc of paquetesSnap.docs) {
      const d = doc.data()
      const tel: string = d['clienteTelefono'] ?? ''
      const usado: number = d['cantidadUsada'] ?? 0
      const total: number = d['cantidadTotal'] ?? 0
      if (tel && usado < total) activosPorTelefono.set(tel, (activosPorTelefono.get(tel) ?? 0) + 1)
    }

    const docs: ClienteData[] = clientesSnap.docs.map((doc) => {
      const d = doc.data()
      const telefono: string = d['telefono'] ?? ''
      return {
        id: doc.id,
        nombre: d['nombre'] ?? '',
        telefono,
        ultimaVisita: d['ultimaVisita'],
        paquetesActivos: activosPorTelefono.get(telefono) ?? 0,
      }
    })

    if (!search) return docs
    const s = search.toLowerCase()
    return docs.filter((c) => c.nombre.toLowerCase().includes(s) || c.telefono.includes(s))
  }

  async findClienteById(id: string): Promise<ClienteData | null> {
    const doc = await firestore.collection('clientes').doc(id).get()
    if (!doc.exists) return null
    const d = doc.data()!
    return { id: doc.id, nombre: d['nombre'], telefono: d['telefono'], ultimaVisita: d['ultimaVisita'] }
  }

  async findClienteByTelefono(telefono: string): Promise<(ClienteData & { ref: FirebaseFirestore.DocumentReference }) | null> {
    const snap = await firestore.collection('clientes').where('telefono', '==', telefono).limit(1).get()
    if (snap.empty) return null
    const doc = snap.docs[0]!
    const d = doc.data()
    return { id: doc.id, nombre: d['nombre'], telefono: d['telefono'], ultimaVisita: d['ultimaVisita'], ref: doc.ref }
  }

  async upsertClienteByTelefono(nombre: string, telefono: string, ultimaVisita?: string): Promise<ClienteData> {
    const existing = await this.findClienteByTelefono(telefono)
    if (existing) {
      const updates: Record<string, unknown> = { nombre }
      if (ultimaVisita && (!existing.ultimaVisita || ultimaVisita > existing.ultimaVisita)) {
        updates['ultimaVisita'] = ultimaVisita
      }
      await existing.ref.update(updates)
      return { id: existing.id, nombre, telefono, ultimaVisita: updates['ultimaVisita'] as string | undefined ?? existing.ultimaVisita }
    }
    const ref = await firestore.collection('clientes').add({
      nombre,
      telefono,
      ...(ultimaVisita ? { ultimaVisita } : {}),
      creadoAt: FieldValue.serverTimestamp(),
    })
    return { id: ref.id, nombre, telefono, ultimaVisita }
  }

  async findHistorialByTelefono(telefono: string, nombre?: string): Promise<{ turnos: TurnoParaCliente[]; paquetes: PaqueteParaCliente[] }> {
    const usarNombre = !telefono && !!nombre
    const [turnosSnap, paquetesSnap, serviciosSnap, barberosSnap] = await Promise.all([
      usarNombre
        ? firestore.collection('turnos').where('clienteNombre', '==', nombre).get()
        : firestore.collection('turnos').where('clienteTelefono', '==', telefono).get(),
      usarNombre
        ? firestore.collection('paquetes').where('clienteNombre', '==', nombre).get()
        : firestore.collection('paquetes').where('clienteTelefono', '==', telefono).get(),
      firestore.collection('servicios').get(),
      firestore.collection('barberos').get(),
    ])

    const serviciosMap = new Map<string, string>()
    serviciosSnap.docs.forEach((d) => serviciosMap.set(d.id, d.data()['nombre'] ?? d.id))

    const barberosMap = new Map<string, string>()
    barberosSnap.docs.forEach((d) => barberosMap.set(d.id, d.data()['nombre'] ?? d.id))

    const preciosMap = new Map<string, number>()
    serviciosSnap.docs.forEach((d) => preciosMap.set(d.id, d.data()['precio'] ?? 0))

    const turnos: TurnoParaCliente[] = turnosSnap.docs
      .map((doc) => {
        const d = doc.data()
        return {
          id: doc.id,
          fecha: d['fecha'] ?? '',
          hora: d['hora'] ?? '',
          servicioNombre: serviciosMap.get(d['servicioId']) ?? d['servicioId'] ?? '',
          barberoNombre: barberosMap.get(d['barberoId']) ?? d['barberoId'] ?? '',
          sucursalId: d['sucursalId'] ?? '',
          estado: d['estado'] ?? '',
          metodoPago: d['metodoPago'],
          monto: preciosMap.get(d['servicioId']),
          prepagado: d['prepagado'],
        }
      })
      .sort((a, b) => b.fecha.localeCompare(a.fecha) || b.hora.localeCompare(a.hora))

    const paquetes: PaqueteParaCliente[] = paquetesSnap.docs
      .map((doc) => {
        const d = doc.data()
        const cantidadUsada = d['cantidadUsada'] ?? 0
        const cantidadTotal = d['cantidadTotal'] ?? 0
        return {
          id: doc.id,
          fecha: d['fecha'] ?? '',
          cantidadTotal,
          cantidadUsada,
          precioTotal: d['precioTotal'] ?? 0,
          metodoPago: d['metodoPago'] ?? '',
          sucursalId: d['sucursalId'] ?? '',
          activo: cantidadUsada < cantidadTotal,
        }
      })
      .sort((a, b) => b.fecha.localeCompare(a.fecha))

    return { turnos, paquetes }
  }

  async migrarDesdeTurnos(): Promise<{ creados: number; actualizados: number }> {
    const snap = await firestore.collection('turnos').get()

    const byPhone = new Map<string, { nombre: string; fecha: string }>()
    const byName = new Map<string, { nombre: string; fecha: string }>()

    for (const doc of snap.docs) {
      const d = doc.data()
      const telefono: string = (d['clienteTelefono'] ?? '').trim()
      const nombre: string = (d['clienteNombre'] ?? '').trim()
      const fecha: string = d['fecha'] ?? ''
      if (!nombre) continue

      if (telefono) {
        const existing = byPhone.get(telefono)
        if (!existing || fecha > existing.fecha) byPhone.set(telefono, { nombre, fecha })
      } else {
        const key = nombre.toLowerCase()
        const existing = byName.get(key)
        if (!existing || fecha > existing.fecha) byName.set(key, { nombre, fecha })
      }
    }

    let creados = 0
    let actualizados = 0

    // Clientes con teléfono: upsert por teléfono
    for (const [telefono, { nombre, fecha }] of byPhone) {
      const existing = await this.findClienteByTelefono(telefono)
      if (existing) {
        const updates: Record<string, unknown> = { nombre }
        if (!existing.ultimaVisita || fecha > existing.ultimaVisita) updates['ultimaVisita'] = fecha
        await existing.ref.update(updates)
        actualizados++
      } else {
        await firestore.collection('clientes').add({ nombre, telefono, ultimaVisita: fecha, creadoAt: FieldValue.serverTimestamp() })
        creados++
      }
    }

    // Clientes sin teléfono: upsert por nombre (evita duplicados)
    for (const [, { nombre, fecha }] of byName) {
      const existingSnap = await firestore.collection('clientes').where('nombre', '==', nombre).limit(1).get()
      if (!existingSnap.empty) {
        const doc = existingSnap.docs[0]!
        const existingFecha = doc.data()['ultimaVisita'] ?? ''
        if (!existingFecha || fecha > existingFecha) await doc.ref.update({ ultimaVisita: fecha })
        actualizados++
      } else {
        await firestore.collection('clientes').add({ nombre, telefono: '', ultimaVisita: fecha, creadoAt: FieldValue.serverTimestamp() })
        creados++
      }
    }

    return { creados, actualizados }
  }
}

export const clientesRepository = new ClientesRepository()
