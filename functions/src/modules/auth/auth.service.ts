import type { LoginInput } from './auth.schemas'

export class AuthService {
  login(input: LoginInput) {
    return {
      token: input.token,
      user: null,
    }
  }
}

export const authService = new AuthService()
