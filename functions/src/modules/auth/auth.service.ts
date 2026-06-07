import { adminAuth } from '../../config/firebase'
import { authRepository } from './auth.repository'
import type { LoginInput, RegistroInput, UsuarioData } from './auth.schemas'

export class AuthService {
  async login(input: LoginInput): Promise<{ user: UsuarioData }> {
    const decoded = await adminAuth.verifyIdToken(input.token)

    const user = await authRepository.findByUid(decoded.uid)
    if (!user) throw new Error('USER_NOT_FOUND')

    const claimsChanged =
      decoded['role'] !== user.rol ||
      JSON.stringify(decoded['sucursalesConAccesoCaja']) !== JSON.stringify(user.sucursalesConAccesoCaja) ||
      decoded['barberoId'] !== user.barberoId

    if (claimsChanged) {
      await adminAuth.setCustomUserClaims(decoded.uid, {
        role: user.rol,
        sucursalesConAccesoCaja: user.sucursalesConAccesoCaja,
        ...(user.barberoId ? { barberoId: user.barberoId } : {}),
      })
    }

    return { user }
  }

  async registro(input: RegistroInput): Promise<{ user: UsuarioData }> {
    const invitacion = await authRepository.findInvitacion(input.token)
    if (!invitacion) throw new Error('INVALID_TOKEN')
    if (invitacion.usado) throw new Error('TOKEN_USED')
    if (invitacion.expiresAt.toDate() < new Date()) throw new Error('TOKEN_EXPIRED')

    const nombre = await authRepository.findBarberoNombre(invitacion.barberoId)
    if (!nombre) throw new Error('BARBERO_NOT_FOUND')

    let authUser: { uid: string }
    try {
      authUser = await adminAuth.createUser({
        email: input.email,
        password: input.password,
        displayName: nombre,
      })
    } catch (err) {
      if ((err as { code?: string }).code === 'auth/email-already-exists') {
        throw new Error('EMAIL_ALREADY_EXISTS')
      }
      throw err
    }

    await adminAuth.setCustomUserClaims(authUser.uid, {
      role: 'barbero',
      barberoId: invitacion.barberoId,
    })

    const usuarioData: Omit<UsuarioData, 'id'> = {
      email: input.email,
      nombre,
      rol: 'barbero',
      sucursalesConAccesoCaja: [],
      barberoId: invitacion.barberoId,
    }

    await authRepository.createUsuario(authUser.uid, usuarioData)
    await authRepository.linkBarberoUid(invitacion.barberoId, authUser.uid)
    await authRepository.marcarInvitacionUsada(input.token)

    return { user: { id: authUser.uid, ...usuarioData } }
  }
}

export const authService = new AuthService()
