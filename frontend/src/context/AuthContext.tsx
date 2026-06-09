import { signInWithEmailAndPassword, signOut, onAuthStateChanged } from 'firebase/auth'
import { createContext, useEffect, useState, type ReactNode } from 'react'
import { auth } from '../lib/firebase'
import { apiClient } from '../shared/api/client'
import { authMock } from '../mocks/auth.mock'
import type { Usuario } from '../types'

const USE_MOCKS = import.meta.env.VITE_USE_MOCKS !== 'false'

type AuthContextValue = {
  user: Usuario | null
  loading: boolean
  error: string | null
  login: (email: string, password: string) => Promise<void>
  logout: () => Promise<void>
}

export const AuthContext = createContext<AuthContextValue>({
  user: null,
  loading: true,
  error: null,
  login: async () => undefined,
  logout: async () => undefined,
})

type AuthProviderProps = {
  children: ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<Usuario | null>(USE_MOCKS ? authMock.user : null)
  const [loading, setLoading] = useState(!USE_MOCKS)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (USE_MOCKS) return

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          const idToken = await firebaseUser.getIdToken()
          const response = await apiClient.post<{ user: Usuario }>('/auth/login', {
            token: idToken,
          })
          setUser(response.data.user)
        } catch {
          setUser(null)
        }
      } else {
        setUser(null)
      }
      setLoading(false)
    })
    return unsubscribe
  }, [])

  async function login(email: string, password: string) {
    if (USE_MOCKS) {
      setUser(authMock.user)
      return
    }
    setLoading(true)
    setError(null)
    try {
      const credential = await signInWithEmailAndPassword(auth, email, password)
      const idToken = await credential.user.getIdToken()
      const response = await apiClient.post<{ user: Usuario }>('/auth/login', { token: idToken })
      setUser(response.data.user)
    } catch (err) {
      const code = (err as { code?: string }).code
      setError(translateFirebaseError(code))
      throw err
    } finally {
      setLoading(false)
    }
  }

  async function logout() {
    if (USE_MOCKS) {
      setUser(null)
      return
    }
    await signOut(auth)
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, loading, error, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

function translateFirebaseError(code: string | undefined): string {
  switch (code) {
    case 'auth/invalid-credential':
    case 'auth/wrong-password':
    case 'auth/user-not-found':
      return 'Email o contraseña incorrectos'
    case 'auth/too-many-requests':
      return 'Demasiados intentos. Intentá más tarde'
    case 'auth/network-request-failed':
      return 'Error de conexión. Verificá tu red'
    default:
      return 'No se pudo iniciar sesión'
  }
}
