import { Button } from '../shared/components/ui/Button'
import { useAuth } from '../shared/hooks/useAuth'

export function LoginPage() {
  const { login, loading, error } = useAuth()

  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-4 text-text-primary">
      <section className="w-full max-w-sm rounded-lg border border-white/10 bg-surface p-6">
        <p className="text-sm text-text-secondary">Peluqueria App</p>
        <h1 className="mt-2 text-2xl font-semibold">Iniciar sesion</h1>
        {error ? <p className="mt-4 text-sm text-red-300">{error}</p> : null}
        <Button className="mt-6 w-full" isLoading={loading} onClick={login}>
          Entrar
        </Button>
      </section>
    </main>
  )
}
