import { firestore } from '../../config/firebase'
import { usuarioSchema, type UsuarioData } from './auth.schemas'

type InvitacionData = {
  barberoId: string
  expiresAt: FirebaseFirestore.Timestamp
  usado: boolean
}

export class AuthRepository {
  async findByUid(uid: string): Promise<UsuarioData | null> {
    const doc = await firestore.collection('usuarios').doc(uid).get()
    if (!doc.exists) return null
    const parsed = usuarioSchema.safeParse({ id: doc.id, ...doc.data() })
    if (!parsed.success) return null
    return parsed.data
  }

  async createUsuario(uid: string, data: Omit<UsuarioData, 'id'>): Promise<void> {
    await firestore.collection('usuarios').doc(uid).set(data)
  }

  async findInvitacion(token: string): Promise<InvitacionData | null> {
    const doc = await firestore.collection('invitaciones').doc(token).get()
    if (!doc.exists) return null
    return doc.data() as InvitacionData
  }

  async marcarInvitacionUsada(token: string): Promise<void> {
    await firestore.collection('invitaciones').doc(token).update({ usado: true })
  }

  async findBarberoNombre(barberoId: string): Promise<string | null> {
    const doc = await firestore.collection('barberos').doc(barberoId).get()
    if (!doc.exists) return null
    return (doc.data()!['nombre'] as string) ?? null
  }

  async linkBarberoUid(barberoId: string, uid: string): Promise<void> {
    await firestore.collection('barberos').doc(barberoId).update({ uid })
  }
}

export const authRepository = new AuthRepository()
