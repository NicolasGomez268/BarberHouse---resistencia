import { useState, type FormEvent } from 'react'
import { Navigate } from 'react-router-dom'
import { Button } from '../shared/components/ui/Button'
import { useAuth } from '../shared/hooks/useAuth'

export function LoginPage() {
  const { login, loading, error, user } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  if (user) {
    return <Navigate to="/agenda" replace />
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    try {
      await login(email, password)
    } catch {
      // El error ya queda en el contexto
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-4 text-text-primary">
      <section className="w-full max-w-sm rounded-lg border border-white/10 bg-surface p-6">
        <p className="text-sm text-text-secondary">Peluqueria App</p>
        <h1 className="mt-2 text-2xl font-semibold">Iniciar sesion</h1>
        {error ? <p className="mt-4 text-sm text-red-300">{error}</p> : null}
        <form className="mt-6 flex flex-col gap-3" onSubmit={handleSubmit}>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            required
            disabled={loading}
            className="rounded-md border border-white/10 bg-background px-3 py-2 text-sm text-text-primary placeholder:text-text-secondary focus:outline-none focus:ring-1 focus:ring-accent disabled:opacity-50"
          />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Contraseña"
            required
            disabled={loading}
            className="rounded-md border border-white/10 bg-background px-3 py-2 text-sm text-text-primary placeholder:text-text-secondary focus:outline-none focus:ring-1 focus:ring-accent disabled:opacity-50"
          />
          <Button type="submit" className="mt-2 w-full" isLoading={loading}>
            Entrar
          </Button>
        </form>
      </section>
    </main>
  )
}
