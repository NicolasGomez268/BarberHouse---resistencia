import { adminAuth } from '../../config/firebase'
import { authRepository } from './auth.repository'
import type { LoginInput, UsuarioData } from './auth.schemas'

export class AuthService {
  async login(input: LoginInput): Promise<{ user: UsuarioData }> {
    const decoded = await adminAuth.verifyIdToken(input.token)

    const user = await authRepository.findByUid(decoded.uid)
    if (!user) throw new Error('USER_NOT_FOUND')

    // Sincronizar custom claims si el rol o las sucursales cambiaron
    const claimsChanged =
      decoded['role'] !== user.rol ||
      JSON.stringify(decoded['sucursalesConAccesoCaja']) !==
        JSON.stringify(user.sucursalesConAccesoCaja)

    if (claimsChanged) {
      await adminAuth.setCustomUserClaims(decoded.uid, {
        role: user.rol,
        sucursalesConAccesoCaja: user.sucursalesConAccesoCaja,
      })
    }

    return { user }
  }
}

export const authService = new AuthService()
