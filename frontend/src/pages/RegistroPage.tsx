import { useState, type FormEvent } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { Button } from '../shared/components/ui/Button'
import { apiClient } from '../shared/api/client'

export function RegistroPage() {
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token')

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  if (!token) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-background px-4 text-text-primary">
        <section className="w-full max-w-sm rounded-lg border border-white/10 bg-surface p-6 text-center">
          <p className="text-lg font-semibold text-red-400">Link inválido</p>
          <p className="mt-2 text-sm text-text-secondary">Este enlace de invitación no es válido.</p>
        </section>
      </main>
    )
  }

  if (success) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-background px-4 text-text-primary">
        <section className="w-full max-w-sm rounded-lg border border-white/10 bg-surface p-6 text-center">
          <p className="text-2xl">✓</p>
          <p className="mt-2 text-lg font-semibold">¡Cuenta creada!</p>
          <p className="mt-2 text-sm text-text-secondary">Ya podés iniciar sesión con tu email y contraseña.</p>
          <Link
            className="mt-4 inline-block rounded-md bg-accent px-4 py-2 text-sm font-medium text-background hover:brightness-95"
            to="/login"
          >
            Ir al inicio de sesión
          </Link>
        </section>
      </main>
    )
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)

    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden')
      return
    }

    setLoading(true)
    try {
      await apiClient.post('/auth/registro', { token, email, password })
      setSuccess(true)
    } catch (err) {
      const message = (err as { response?: { data?: { error?: string } } }).response?.data?.error
      setError(message ?? 'No se pudo crear la cuenta. Intentá de nuevo.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-4 text-text-primary">
      <section className="w-full max-w-sm rounded-lg border border-white/10 bg-surface p-6">
        <p className="text-sm text-text-secondary">BarberHouse</p>
        <h1 className="mt-2 text-2xl font-semibold">Activar cuenta</h1>
        <p className="mt-1 text-sm text-text-secondary">Ingresá tu email y elegí una contraseña para acceder al sistema.</p>

        {error ? <p className="mt-4 text-sm text-red-300">{error}</p> : null}

        <form className="mt-6 flex flex-col gap-3" onSubmit={handleSubmit}>
          <input
            className="rounded-md border border-white/10 bg-background px-3 py-2 text-sm text-text-primary placeholder:text-text-secondary focus:outline-none focus:ring-1 focus:ring-accent disabled:opacity-50"
            disabled={loading}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            required
            type="email"
            value={email}
          />
          <input
            className="rounded-md border border-white/10 bg-background px-3 py-2 text-sm text-text-primary placeholder:text-text-secondary focus:outline-none focus:ring-1 focus:ring-accent disabled:opacity-50"
            disabled={loading}
            minLength={6}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Contraseña (mínimo 6 caracteres)"
            required
            type="password"
            value={password}
          />
          <input
            className="rounded-md border border-white/10 bg-background px-3 py-2 text-sm text-text-primary placeholder:text-text-secondary focus:outline-none focus:ring-1 focus:ring-accent disabled:opacity-50"
            disabled={loading}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Confirmar contraseña"
            required
            type="password"
            value={confirmPassword}
          />
          <Button className="mt-2 w-full" isLoading={loading} type="submit">
            Crear cuenta
          </Button>
        </form>
      </section>
    </main>
  )
}
