import { FieldValue } from 'firebase-admin/firestore'
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
  isActive: boolean
  activo: boolean
  isOwner: boolean
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
    isActive: d['isActive'] ?? true,
    activo: d['isActive'] ?? true,
    isOwner: d['isOwner'] ?? false,
    esDueno: d['isOwner'] ?? false,
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

  async create(input: BarberoInput): Promise<BarberoData> {
    const data: Record<string, unknown> = {
      nombre: input.nombre,
      porcentajeCasa: input.porcentajeCasa,
      isActive: input.isActive ?? true,
      isOwner: input.isOwner ?? false,
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

  async update(id: string, input: BarberoUpdateInput): Promise<BarberoData | null> {
    const ref = firestore.collection('barberos').doc(id)
    const doc = await ref.get()
    if (!doc.exists) return null

    // Ignorar aliases del frontend; omitir undefined (Firestore no los acepta)
    const { activo: _activo, esDueno: _esDueno, ...rest } = input as BarberoUpdateInput & { activo?: boolean; esDueno?: boolean }
    const payload: Record<string, unknown> = { actualizadoEn: FieldValue.serverTimestamp() }
    for (const [key, value] of Object.entries(rest)) {
      if (value !== undefined) payload[key] = value
    }

    await ref.update(payload)
    return docToBarbero(await ref.get())
  }

  async delete(id: string): Promise<boolean> {
    const doc = await firestore.collection('barberos').doc(id).get()
    if (!doc.exists) return false
    await firestore.collection('barberos').doc(id).delete()
    return true
  }

  async toggle(id: string): Promise<BarberoData | null> {
    const ref = firestore.collection('barberos').doc(id)
    const doc = await ref.get()
    if (!doc.exists) return null
    const current = doc.data()!['isActive'] ?? true
    await ref.update({ isActive: !current, actualizadoEn: FieldValue.serverTimestamp() })
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
}

export const equipoRepository = new EquipoRepository()
