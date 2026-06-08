import { FieldValue } from 'firebase-admin/firestore'
import { firestore } from '../../config/firebase'
import type { ServicioInput, ServicioUpdateInput } from './servicios.schemas'

export type ServicioData = {
  id: string
  nombre: string
  descripcion?: string
  precio: number
  duracionMinutos: number
  activo: boolean
}

function docToServicio(doc: FirebaseFirestore.DocumentSnapshot): ServicioData {
  const data = doc.data()!
  return {
    id: doc.id,
    nombre: data['nombre'],
    descripcion: data['descripcion'],
    precio: data['precio'],
    duracionMinutos: data['duracionMinutos'],
    activo: data['activo'] ?? true,
  }
}

export class ServiciosRepository {
  async findAll(): Promise<ServicioData[]> {
    const snap = await firestore.collection('servicios').orderBy('nombre').get()
    return snap.docs.map(docToServicio)
  }

  async insertServicio(input: ServicioInput): Promise<ServicioData> {
    const ref = await firestore.collection('servicios').add({
      ...input,
      activo: input.activo ?? true,
      creadoEn: FieldValue.serverTimestamp(),
    })
    return docToServicio(await ref.get())
  }

  async patchServicio(id: string, input: ServicioUpdateInput): Promise<ServicioData | null> {
    const ref = firestore.collection('servicios').doc(id)
    const doc = await ref.get()
    if (!doc.exists) return null
    await ref.update({ ...input, actualizadoEn: FieldValue.serverTimestamp() })
    return docToServicio(await ref.get())
  }

  async deleteServicio(id: string): Promise<boolean> {
    const doc = await firestore.collection('servicios').doc(id).get()
    if (!doc.exists) return false
    await firestore.collection('servicios').doc(id).delete()
    return true
  }

  async patchServicioActivo(id: string): Promise<ServicioData | null> {
    const ref = firestore.collection('servicios').doc(id)
    const doc = await ref.get()
    if (!doc.exists) return null
    const current = doc.data()!['activo'] ?? true
    await ref.update({ activo: !current, actualizadoEn: FieldValue.serverTimestamp() })
    return docToServicio(await ref.get())
  }

  async hasTurnosAsignados(id: string): Promise<boolean> {
    const [turnosSnap, turnosFijosSnap] = await Promise.all([
      firestore.collection('turnos').where('servicioId', '==', id).limit(1).get(),
      firestore.collection('turnosFijos').where('servicioId', '==', id).limit(1).get(),
    ])
    return !turnosSnap.empty || !turnosFijosSnap.empty
  }
}

export const serviciosRepository = new ServiciosRepository()
