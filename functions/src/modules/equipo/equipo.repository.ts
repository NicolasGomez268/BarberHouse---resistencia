import { FieldValue, Timestamp } from 'firebase-admin/firestore'
import { firestore } from '../../config/firebase'
import type { BarberoInput, BarberoUpdateInput, HorarioInput } from './equipo.schemas'

export type BarberoData = {
  id: string
  nombre: string
  telefono?: string
  fotoUrl?: string
  porcentajeCasa: number
  colorHex?: string
  sucursalId?: string
  fechaIngreso?: string
  activo: boolean
  esDueno: boolean
}

export type HorarioData = {
  barberoId: string
  dias: Record<number, {
    activo: boolean
    horaInicio: string
    horaFin: string
    descansoInicio?: string
    descansoFin?: string
  }>
}

function docToBarbero(doc: FirebaseFirestore.DocumentSnapshot): BarberoData {
  const d = doc.data()!
  return {
    id: doc.id,
    nombre: d['nombre'],
    telefono: d['telefono'],
    fotoUrl: d['fotoUrl'],
    porcentajeCasa: d['porcentajeCasa'] ?? 0,
    colorHex: d['colorHex'],
    sucursalId: d['sucursalId'],
    fechaIngreso: d['fechaIngreso'],
    activo: d['activo'] ?? true,
    esDueno: d['esDueno'] ?? false,
  }
}

function docToHorario(doc: FirebaseFirestore.DocumentSnapshot): HorarioData {
  const d = doc.data()!
  return {
    barberoId: doc.id,
    dias: d['dias'] ?? {},
  }
}

export class EquipoRepository {
  async findAll(): Promise<BarberoData[]> {
    const snap = await firestore.collection('barberos').orderBy('nombre').get()
    return snap.docs.map(docToBarbero)
  }

  async findAllHorarios(): Promise<HorarioData[]> {
    const snap = await firestore.collection('horarios').get()
    return snap.docs.map(docToHorario)
  }

  async insertBarbero(input: BarberoInput): Promise<BarberoData> {
    const data: Record<string, unknown> = {
      nombre: input.nombre,
      porcentajeCasa: input.porcentajeCasa,
      activo: input.activo ?? true,
      esDueno: input.esDueno ?? false,
      creadoEn: FieldValue.serverTimestamp(),
    }
    if (input.telefono !== undefined) data['telefono'] = input.telefono
    if (input.fotoUrl !== undefined) data['fotoUrl'] = input.fotoUrl
    if (input.colorHex !== undefined) data['colorHex'] = input.colorHex
    if (input.sucursalId !== undefined) data['sucursalId'] = input.sucursalId
    if (input.fechaIngreso !== undefined) data['fechaIngreso'] = input.fechaIngreso

    const ref = await firestore.collection('barberos').add(data)
    return docToBarbero(await ref.get())
  }

  async patchBarbero(id: string, input: BarberoUpdateInput): Promise<BarberoData | null> {
    const ref = firestore.collection('barberos').doc(id)
    const doc = await ref.get()
    if (!doc.exists) return null

    const payload: Record<string, unknown> = { actualizadoEn: FieldValue.serverTimestamp() }
    for (const [key, value] of Object.entries(input)) {
      if (value !== undefined) payload[key] = value
    }

    await ref.update(payload)
    return docToBarbero(await ref.get())
  }

  async deleteBarbero(id: string): Promise<boolean> {
    const doc = await firestore.collection('barberos').doc(id).get()
    if (!doc.exists) return false
    await firestore.collection('barberos').doc(id).delete()
    return true
  }

  async deleteHorario(barberoId: string): Promise<void> {
    await firestore.collection('horarios').doc(barberoId).delete()
  }

  async patchBarberoActivo(id: string): Promise<BarberoData | null> {
    const ref = firestore.collection('barberos').doc(id)
    const doc = await ref.get()
    if (!doc.exists) return null
    const current = doc.data()!['activo'] ?? true
    await ref.update({ activo: !current, actualizadoEn: FieldValue.serverTimestamp() })
    return docToBarbero(await ref.get())
  }

  async upsertHorario(input: HorarioInput): Promise<HorarioData> {
    const ref = firestore.collection('horarios').doc(input.barberoId)
    await ref.set({ barberoId: input.barberoId, dias: input.dias }, { merge: false })
    return docToHorario(await ref.get())
  }

  async findHorario(barberoId: string): Promise<HorarioData | null> {
    const doc = await firestore.collection('horarios').doc(barberoId).get()
    if (!doc.exists) return null
    return docToHorario(doc)
  }

  async insertInvitacion(token: string, barberoId: string): Promise<void> {
    const expiresAt = new Date()
    expiresAt.setDate(expiresAt.getDate() + 7)
    await firestore.collection('invitaciones').doc(token).set({
      barberoId,
      expiresAt: Timestamp.fromDate(expiresAt),
      usado: false,
      creadoEn: FieldValue.serverTimestamp(),
    })
  }
}

export const equipoRepository = new EquipoRepository()
