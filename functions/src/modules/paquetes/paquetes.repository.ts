import { FieldValue } from 'firebase-admin/firestore'
import { firestore } from '../../config/firebase'
import type { CreatePaqueteInput, PaqueteData } from './paquetes.schemas'

function docToPaquete(doc: FirebaseFirestore.DocumentSnapshot): PaqueteData {
  const d = doc.data()
  if (!d) throw new Error('PAQUETE_NOT_FOUND')
  return { id: doc.id, ...d } as PaqueteData
}

export class PaquetesRepository {
  async insert(data: CreatePaqueteInput, fecha: string, hora: string, creadoPor: string): Promise<PaqueteData> {
    const ref = await firestore.collection('paquetesPrepagos').add({
      ...data,
      cantidadUsada: 0,
      fecha,
      hora,
      creadoPor,
    })
    return docToPaquete(await ref.get())
  }

  async findAll(sucursalId?: string, clienteTelefono?: string): Promise<PaqueteData[]> {
    let q: FirebaseFirestore.Query = firestore.collection('paquetesPrepagos')
    if (sucursalId) q = q.where('sucursalId', '==', sucursalId)
    if (clienteTelefono) q = q.where('clienteTelefono', '==', clienteTelefono)
    const snap = await q.get()
    return snap.docs.map(docToPaquete)
  }

  async findByTelefono(clienteTelefono: string): Promise<PaqueteData[]> {
    const snap = await firestore
      .collection('paquetesPrepagos')
      .where('clienteTelefono', '==', clienteTelefono)
      .get()
    return snap.docs.map(docToPaquete)
  }

  async findByFecha(sucursalId: string, desde: string, hasta: string): Promise<PaqueteData[]> {
    const snap = await firestore
      .collection('paquetesPrepagos')
      .where('fecha', '>=', desde)
      .where('fecha', '<=', hasta)
      .get()
    return snap.docs.map(docToPaquete).filter((p) => p.sucursalId === sucursalId)
  }

  async decrementarUso(id: string): Promise<PaqueteData> {
    const ref = firestore.collection('paquetesPrepagos').doc(id)
    const doc = await ref.get()
    if (!doc.exists) throw new Error('PAQUETE_NOT_FOUND')
    const data = doc.data()!
    if ((data['cantidadUsada'] as number) >= (data['cantidadTotal'] as number)) {
      throw new Error('PAQUETE_SIN_CREDITOS')
    }
    await ref.update({ cantidadUsada: FieldValue.increment(1) })
    return docToPaquete(await ref.get())
  }
}

export const paquetesRepository = new PaquetesRepository()
