import { useState } from 'react'
import { Delete } from 'lucide-react'

type PinModalProps = {
  error: string | null
  onSubmit: (pin: string) => Promise<string | null>
}

const KEYS = ['1', '2', '3', '4', '5', '6', '7', '8', '9', null, '0', 'backspace']

export function PinModal({ error, onSubmit }: PinModalProps) {
  const [pin, setPin] = useState('')
  const [localError, setLocalError] = useState<string | null>(error)
  const [loading, setLoading] = useState(false)

  async function handleKey(key: string) {
    if (loading) return

    if (key === 'backspace') {
      setPin((current) => current.slice(0, -1))
      setLocalError(null)
      return
    }

    const next = (pin + key).slice(0, 4)
    setPin(next)
    setLocalError(null)

    if (next.length === 4) {
      setLoading(true)
      const validationError = await onSubmit(next)
      setLoading(false)
      if (validationError) {
        setLocalError(validationError)
        setPin('')
      }
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
      <section className="w-full max-w-xs rounded-2xl border border-accent/40 bg-surface p-6 text-text-primary shadow-2xl">
        <h2 className="text-center text-2xl font-bold">Acceso a Caja</h2>
        <p className="mt-1 text-center text-sm text-text-secondary">Ingresá tu PIN</p>

        <div className="mt-6 flex justify-center gap-4">
          {[0, 1, 2, 3].map((index) => (
            <span
              className={`h-5 w-5 rounded-full border-2 border-accent transition-all duration-150 ${
                pin.length > index ? 'scale-110 bg-accent' : 'bg-transparent'
              }`}
              key={index}
            />
          ))}
        </div>

        <div className="mt-3 h-5 text-center text-sm font-bold">
          {loading ? (
            <span className="text-text-secondary">Verificando...</span>
          ) : localError ? (
            <span className="text-red-300">{localError}</span>
          ) : null}
        </div>

        <div className="mt-4 grid grid-cols-3 gap-2">
          {KEYS.map((key, index) =>
            key === null ? (
              <span key={index} />
            ) : key === 'backspace' ? (
              <button
                className="flex items-center justify-center rounded-xl border border-white/10 bg-background py-4 text-text-secondary transition active:bg-white/10 disabled:opacity-40"
                disabled={loading || pin.length === 0}
                key={key}
                onClick={() => handleKey('backspace')}
                type="button"
              >
                <Delete className="h-5 w-5" />
              </button>
            ) : (
              <button
                className="rounded-xl border border-white/10 bg-background py-4 text-xl font-bold text-text-primary transition active:bg-accent active:text-black disabled:opacity-40"
                disabled={loading || pin.length === 4}
                key={key}
                onClick={() => handleKey(key)}
                type="button"
              >
                {key}
              </button>
            ),
          )}
        </div>
      </section>
    </div>
  )
}
