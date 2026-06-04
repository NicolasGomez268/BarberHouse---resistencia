import { FieldValue } from 'firebase-admin/firestore'
import { firestore } from '../../config/firebase'
import type {
  CreateTurnoFijoInput,
  CreateTurnoInput,
  ReemplazoFijoInput,
  TurnoData,
  TurnoFijoData,
  TurnosFijosFilters,
  TurnosFilters,
  UpdateTurnoFijoInput,
} from './agenda.schemas'

function docToTurno(doc: FirebaseFirestore.DocumentSnapshot): TurnoData {
  const data = doc.data()
  if (!data) throw new Error('TURNO_NOT_FOUND')
  return { id: doc.id, ...data } as TurnoData
}

function docToTurnoFijo(doc: FirebaseFirestore.DocumentSnapshot): TurnoFijoData {
  const data = doc.data()
  if (!data) throw new Error('TURNO_FIJO_NOT_FOUND')
  return { id: doc.id, ...data } as TurnoFijoData
}

export class AgendaRepository {
  // ── Turnos ────────────────────────────────────────────────────────────────

  async findAllTurnos(filters: TurnosFilters): Promise<TurnoData[]> {
    let q: FirebaseFirestore.Query = firestore.collection('turnos')
    if (filters.sucursalId) q = q.where('sucursalId', '==', filters.sucursalId)
    if (filters.barberoId) q = q.where('barberoId', '==', filters.barberoId)
    if (filters.fecha) q = q.where('fecha', '==', filters.fecha)
    const snap = await q.get()
    return snap.docs.map(docToTurno)
  }

  async createTurno(data: CreateTurnoInput & { creadoPor: string }): Promise<TurnoData> {
    const ref = await firestore.collection('turnos').add({
      ...data,
      estado: 'PENDIENTE',
      createdAt: FieldValue.serverTimestamp(),
    })
    return docToTurno(await ref.get())
  }

  async updateTurnoEstado(id: string, estado: string): Promise<TurnoData> {
    const ref = firestore.collection('turnos').doc(id)
    const doc = await ref.get()
    if (!doc.exists) throw new Error('TURNO_NOT_FOUND')
    await ref.update({ estado })
    return docToTurno(await ref.get())
  }

  async realizarTurno(id: string, metodoPago: string): Promise<TurnoData> {
    const ref = firestore.collection('turnos').doc(id)
    const doc = await ref.get()
    if (!doc.exists) throw new Error('TURNO_NOT_FOUND')
    await ref.update({ estado: 'REALIZADO', metodoPago })
    return docToTurno(await ref.get())
  }

  async createReemplazoFijo(originalId: string, data: ReemplazoFijoInput, creadoPor: string): Promise<TurnoData> {
    const originalDoc = await firestore.collection('turnos').doc(originalId).get()
    if (!originalDoc.exists) throw new Error('TURNO_NOT_FOUND')
    const original = docToTurno(originalDoc)

    const ref = await firestore.collection('turnos').add({
      sucursalId: original.sucursalId,
      barberoId: original.barberoId,
      fecha: original.fecha,
      hora: original.hora,
      horaFin: original.horaFin,
      servicioId: data.servicioId,
      clienteNombre: data.clienteNombre,
      clienteTelefono: data.clienteTelefono,
      metodoPago: data.metodoPago,
      estado: 'PENDIENTE',
      esFijo: false,
      esReemplazoFijo: true,
      turnoOriginalId: originalId,
      creadoPor,
      createdAt: FieldValue.serverTimestamp(),
    })

    await firestore.collection('turnos').doc(originalId).update({ estado: 'AUSENTE_FIJO' })
    return docToTurno(await ref.get())
  }

  // ── Turnos Fijos ──────────────────────────────────────────────────────────

  async findAllTurnosFijos(filters: TurnosFijosFilters): Promise<TurnoFijoData[]> {
    let q: FirebaseFirestore.Query = firestore.collection('turnosFijos')
    if (filters.sucursalId) q = q.where('sucursalId', '==', filters.sucursalId)
    if (filters.barberoId) q = q.where('barberoId', '==', filters.barberoId)
    const snap = await q.get()
    return snap.docs.map(docToTurnoFijo)
  }

  async createTurnoFijo(data: CreateTurnoFijoInput): Promise<TurnoFijoData> {
    const ref = await firestore.collection('turnosFijos').add({ ...data })
    return docToTurnoFijo(await ref.get())
  }

  async updateTurnoFijo(id: string, data: UpdateTurnoFijoInput): Promise<TurnoFijoData> {
    const ref = firestore.collection('turnosFijos').doc(id)
    const doc = await ref.get()
    if (!doc.exists) throw new Error('TURNO_FIJO_NOT_FOUND')
    await ref.update({ ...data })
    return docToTurnoFijo(await ref.get())
  }

  async deleteTurnoFijo(id: string): Promise<void> {
    const doc = await firestore.collection('turnosFijos').doc(id).get()
    if (!doc.exists) throw new Error('TURNO_FIJO_NOT_FOUND')
    await firestore.collection('turnosFijos').doc(id).delete()
  }

  async pausarTurnoFijo(id: string, hasta: string): Promise<TurnoFijoData> {
    const ref = firestore.collection('turnosFijos').doc(id)
    const doc = await ref.get()
    if (!doc.exists) throw new Error('TURNO_FIJO_NOT_FOUND')
    await ref.update({ pausadoHasta: hasta })
    return docToTurnoFijo(await ref.get())
  }

  async reanudarTurnoFijo(id: string): Promise<TurnoFijoData> {
    const ref = firestore.collection('turnosFijos').doc(id)
    const doc = await ref.get()
    if (!doc.exists) throw new Error('TURNO_FIJO_NOT_FOUND')
    await ref.update({ pausadoHasta: FieldValue.delete() })
    return docToTurnoFijo(await ref.get())
  }

  async generarProximoTurnoFijo(fijoId: string, creadoPor: string): Promise<TurnoData[]> {
    const fijoDoc = await firestore.collection('turnosFijos').doc(fijoId).get()
    if (!fijoDoc.exists) throw new Error('TURNO_FIJO_NOT_FOUND')
    const fijo = docToTurnoFijo(fijoDoc)

    const hoy = new Date().toISOString().slice(0, 10)
    const fechasFuturas = fijo.fechasAgendadas.filter((f) => f >= hoy).sort()

    const existingSnap = await firestore.collection('turnos').where('turnoFijoId', '==', fijoId).get()
    const existingFechas = new Set(
      existingSnap.docs
        .map((d) => d.data())
        .filter((d) => d['estado'] !== 'CANCELADO')
        .map((d) => d['fecha'] as string),
    )

    const fechasPendientes = fechasFuturas.filter((f) => !existingFechas.has(f))
    const newTurnos: TurnoData[] = []

    for (const fecha of fechasPendientes) {
      const ref = await firestore.collection('turnos').add({
        sucursalId: fijo.sucursalId,
        barberoId: fijo.barberoId,
        servicioId: fijo.servicioId,
        clienteNombre: fijo.clienteNombre,
        clienteTelefono: fijo.clienteTelefono,
        fecha,
        hora: fijo.hora,
        estado: 'PENDIENTE',
        esFijo: true,
        turnoFijoId: fijoId,
        creadoPor,
        createdAt: FieldValue.serverTimestamp(),
      })
      newTurnos.push(docToTurno(await ref.get()))
    }

    return newTurnos
  }
}

export const agendaRepository = new AgendaRepository()
