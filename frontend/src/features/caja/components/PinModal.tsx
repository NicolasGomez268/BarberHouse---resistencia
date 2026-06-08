import { useEffect, useRef, useState } from 'react'
import type { KeyboardEvent } from 'react'

type PinModalProps = {
  error: string | null
  onSubmit: (pin: string) => Promise<string | null>
}

export function PinModal({ error, onSubmit }: PinModalProps) {
  const [pin, setPin] = useState('')
  const [localError, setLocalError] = useState<string | null>(error)
  const [loading, setLoading] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  async function handleKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (loading) return

    if (event.key === 'Backspace') {
      setPin((current) => current.slice(0, -1))
      setLocalError(null)
      return
    }

    if (!/^[0-9]$/.test(event.key)) return

    const next = (pin + event.key).slice(0, 4)
    setPin(next)
    setLocalError(null)

    if (next.length === 4) {
      setLoading(true)
      const validationError = await onSubmit(next)
      setLoading(false)
      if (validationError) {
        setLocalError(validationError)
        setPin('')
        inputRef.current?.focus()
      }
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm"
      onClick={() => inputRef.current?.focus()}
    >
      <section className="w-full max-w-sm rounded-2xl border border-accent/40 bg-surface p-8 text-text-primary shadow-2xl">
        <h2 className="text-center text-2xl font-bold">Acceso a Caja</h2>
        <p className="mt-2 text-center text-sm text-text-secondary">Ingresá tu PIN con el teclado numérico</p>

        <input
          ref={inputRef}
          className="sr-only"
          onKeyDown={handleKeyDown}
          readOnly
          type="password"
          value={pin}
        />

        <div className="mt-8 flex justify-center gap-4">
          {[0, 1, 2, 3].map((index) => (
            <span
              className={`h-5 w-5 rounded-full border-2 border-accent transition-all duration-150 ${
                pin.length > index ? 'scale-110 bg-accent' : 'bg-transparent'
              }`}
              key={index}
            />
          ))}
        </div>

        <div className="mt-6 h-6 text-center text-sm font-bold">
          {loading ? (
            <span className="text-text-secondary">Verificando...</span>
          ) : localError ? (
            <span className="text-red-300">{localError}</span>
          ) : null}
        </div>
      </section>
    </div>
  )
}
