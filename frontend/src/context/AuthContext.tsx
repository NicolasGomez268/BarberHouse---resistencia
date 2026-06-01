import { createContext, useMemo, useState, type ReactNode } from 'react'
import { authMock } from '../mocks'
import type { Usuario } from '../types'

type AuthContextValue = {
  user: Usuario | null
  loading: boolean
  error: string | null
  login: () => Promise<void>
  logout: () => void
}

export const AuthContext = createContext<AuthContextValue>({
  user: null,
  loading: false,
  error: null,
  login: async () => undefined,
  logout: () => undefined,
})

type AuthProviderProps = {
  children: ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<Usuario | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      loading,
      error,
      login: async () => {
        setLoading(true)
        setError(null)
        try {
          setUser(authMock.user)
        } catch {
          setError('No se pudo iniciar sesion')
        } finally {
          setLoading(false)
        }
      },
      logout: () => setUser(null),
    }),
    [error, loading, user],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
