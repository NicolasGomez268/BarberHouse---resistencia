import { FieldValue } from 'firebase-admin/firestore'
import { firestore } from '../../config/firebase'
import type { ServicioInput, ServicioUpdateInput } from './servicios.schemas'

export type ServicioData = {
  id: string
  nombre: string
  descripcion?: string
  precio: number
  duracionMinutos: number
  isActive: boolean
}

function docToServicio(doc: FirebaseFirestore.DocumentSnapshot): ServicioData {
  const data = doc.data()!
  return {
    id: doc.id,
    nombre: data['nombre'],
    descripcion: data['descripcion'],
    precio: data['precio'],
    duracionMinutos: data['duracionMinutos'],
    isActive: data['isActive'] ?? true,
  }
}

export class ServiciosRepository {
  async findAll(): Promise<ServicioData[]> {
    const snap = await firestore.collection('servicios').orderBy('nombre').get()
    return snap.docs.map(docToServicio)
  }

  async create(input: ServicioInput): Promise<ServicioData> {
    const ref = await firestore.collection('servicios').add({
      ...input,
      isActive: input.isActive ?? true,
      creadoEn: FieldValue.serverTimestamp(),
    })
    return docToServicio(await ref.get())
  }

  async update(id: string, input: ServicioUpdateInput): Promise<ServicioData | null> {
    const ref = firestore.collection('servicios').doc(id)
    const doc = await ref.get()
    if (!doc.exists) return null
    await ref.update({ ...input, actualizadoEn: FieldValue.serverTimestamp() })
    return docToServicio(await ref.get())
  }

  async delete(id: string): Promise<boolean> {
    const doc = await firestore.collection('servicios').doc(id).get()
    if (!doc.exists) return false
    await firestore.collection('servicios').doc(id).delete()
    return true
  }

  async toggle(id: string): Promise<ServicioData | null> {
    const ref = firestore.collection('servicios').doc(id)
    const doc = await ref.get()
    if (!doc.exists) return null
    const current = doc.data()!['isActive'] ?? true
    await ref.update({ isActive: !current, actualizadoEn: FieldValue.serverTimestamp() })
    return docToServicio(await ref.get())
  }
}

export const serviciosRepository = new ServiciosRepository()
