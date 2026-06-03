import { firestore } from '../../config/firebase'
import { usuarioSchema, type UsuarioData } from './auth.schemas'

export class AuthRepository {
  async findByUid(uid: string): Promise<UsuarioData | null> {
    const doc = await firestore.collection('usuarios').doc(uid).get()
    if (!doc.exists) return null
    const parsed = usuarioSchema.safeParse({ id: doc.id, ...doc.data() })
    if (!parsed.success) return null
    return parsed.data
  }
}

export const authRepository = new AuthRepository()
