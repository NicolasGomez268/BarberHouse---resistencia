import { FieldValue } from 'firebase-admin/firestore'
import { firestore } from '../../config/firebase'
import type {
  CreateTurnoFijoInput,
  TurnoData,
  TurnoFijoData,
  TurnosFijosFilters,
  TurnosFilters,
  UpdateTurnoFijoInput,
  UpdateTurnoInput,
} from './agenda.schemas'

export type TurnoInsertData = Omit<TurnoData, 'id'>

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
  // ── Queries ───────────────────────────────────────────────────────────────

  async findTurnos(filters: TurnosFilters): Promise<TurnoData[]> {
    let q: FirebaseFirestore.Query = firestore.collection('turnos')
    if (filters.sucursalId) q = q.where('sucursalId', '==', filters.sucursalId)
    if (filters.barberoId) q = q.where('barberoId', '==', filters.barberoId)
    if (filters.fecha) q = q.where('fecha', '==', filters.fecha)
    const snap = await q.get()
    return snap.docs.map(docToTurno)
  }

  async findTurno(id: string): Promise<TurnoData | null> {
    const doc = await firestore.collection('turnos').doc(id).get()
    if (!doc.exists) return null
    return docToTurno(doc)
  }

  async findTurnosFijos(filters: TurnosFijosFilters): Promise<TurnoFijoData[]> {
    let q: FirebaseFirestore.Query = firestore.collection('turnosFijos')
    if (filters.sucursalId) q = q.where('sucursalId', '==', filters.sucursalId)
    if (filters.barberoId) q = q.where('barberoId', '==', filters.barberoId)
    const snap = await q.get()
    return snap.docs.map(docToTurnoFijo)
  }

  async findTurnoFijo(id: string): Promise<TurnoFijoData | null> {
    const doc = await firestore.collection('turnosFijos').doc(id).get()
    if (!doc.exists) return null
    return docToTurnoFijo(doc)
  }

  async findTurnosByBarberoFecha(barberoId: string, fecha: string): Promise<TurnoData[]> {
    const snap = await firestore
      .collection('turnos')
      .where('barberoId', '==', barberoId)
      .where('fecha', '==', fecha)
      .get()
    return snap.docs.map(docToTurno)
  }

  async findTurnosByBarberoHora(barberoId: string, hora: string): Promise<TurnoData[]> {
    const snap = await firestore
      .collection('turnos')
      .where('barberoId', '==', barberoId)
      .where('hora', '==', hora)
      .get()
    return snap.docs.map(docToTurno)
  }

  async findTurnosFijosByBarberoHora(barberoId: string, hora: string): Promise<TurnoFijoData[]> {
    const snap = await firestore
      .collection('turnosFijos')
      .where('barberoId', '==', barberoId)
      .where('hora', '==', hora)
      .get()
    return snap.docs.map(docToTurnoFijo)
  }

  async findTurnosByFijoId(fijoId: string): Promise<TurnoData[]> {
    const snap = await firestore.collection('turnos').where('turnoFijoId', '==', fijoId).get()
    return snap.docs.map(docToTurno)
  }

  // ── Writes ────────────────────────────────────────────────────────────────

  async insertTurno(data: TurnoInsertData): Promise<TurnoData> {
    const ref = await firestore.collection('turnos').add({
      ...data,
      createdAt: FieldValue.serverTimestamp(),
    })
    return docToTurno(await ref.get())
  }

  async insertTurnos(turnos: TurnoInsertData[]): Promise<TurnoData[]> {
    const results: TurnoData[] = []
    for (const data of turnos) {
      const ref = await firestore.collection('turnos').add({
        ...data,
        createdAt: FieldValue.serverTimestamp(),
      })
      results.push(docToTurno(await ref.get()))
    }
    return results
  }

  async patchTurnoEstado(id: string, estado: string): Promise<TurnoData> {
    const ref = firestore.collection('turnos').doc(id)
    const doc = await ref.get()
    if (!doc.exists) throw new Error('TURNO_NOT_FOUND')
    await ref.update({ estado })
    return docToTurno(await ref.get())
  }

  async patchTurnoRealizado(
    id: string,
    metodoPago: string,
    montoEfectivo?: number,
    montoTransferencia?: number,
  ): Promise<TurnoData> {
    const ref = firestore.collection('turnos').doc(id)
    const doc = await ref.get()
    if (!doc.exists) throw new Error('TURNO_NOT_FOUND')
    const existingFechaPago = doc.data()?.['fechaPago'] as string | undefined
    const fechaPago = existingFechaPago ?? new Date().toLocaleDateString('en-CA', { timeZone: 'America/Argentina/Buenos_Aires' })
    const fields: Record<string, unknown> = { estado: 'REALIZADO', metodoPago, fechaPago }
    if (montoEfectivo !== undefined) fields['montoEfectivo'] = montoEfectivo
    if (montoTransferencia !== undefined) fields['montoTransferencia'] = montoTransferencia
    await ref.update(fields)
    return docToTurno(await ref.get())
  }

  async patchTurno(id: string, data: UpdateTurnoInput): Promise<TurnoData> {
    const ref = firestore.collection('turnos').doc(id)
    const doc = await ref.get()
    if (!doc.exists) throw new Error('TURNO_NOT_FOUND')
    await ref.update({ ...data })
    return docToTurno(await ref.get())
  }

  async insertTurnoFijo(data: CreateTurnoFijoInput): Promise<TurnoFijoData> {
    const ref = await firestore.collection('turnosFijos').add({ ...data })
    return docToTurnoFijo(await ref.get())
  }

  async patchTurnoFijo(id: string, data: Omit<UpdateTurnoFijoInput, 'cascadeToFutureTurnos'>): Promise<TurnoFijoData> {
    const ref = firestore.collection('turnosFijos').doc(id)
    const doc = await ref.get()
    if (!doc.exists) throw new Error('TURNO_FIJO_NOT_FOUND')
    await ref.update({ ...data })
    return docToTurnoFijo(await ref.get())
  }

  async batchUpdateTurnos(updates: Array<{ id: string; data: Record<string, unknown> }>): Promise<void> {
    const batch = firestore.batch()
    updates.forEach(({ id, data }) => {
      batch.update(firestore.collection('turnos').doc(id), data)
    })
    await batch.commit()
  }

  async batchDeleteTurnoFijoYTurnos(fijoId: string, turnoIds: string[]): Promise<void> {
    const batch = firestore.batch()
    batch.delete(firestore.collection('turnosFijos').doc(fijoId))
    turnoIds.forEach((tid) => batch.delete(firestore.collection('turnos').doc(tid)))
    await batch.commit()
  }
}

export const agendaRepository = new AgendaRepository()
