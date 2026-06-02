import { Delete } from 'lucide-react'
import { useState } from 'react'

type PinModalProps = {
  error: string | null
  onSubmit: (pin: string) => string | null
}

const numbers = ['1', '2', '3', '4', '5', '6', '7', '8', '9']

export function PinModal({ error, onSubmit }: PinModalProps) {
  const [pin, setPin] = useState('')
  const [localError, setLocalError] = useState<string | null>(error)

  function addDigit(digit: string) {
    const nextPin = `${pin}${digit}`.slice(0, 4)
    setPin(nextPin)
    setLocalError(null)

    if (nextPin.length === 4) {
      const validationError = onSubmit(nextPin)
      if (validationError) {
        setLocalError(validationError)
        setPin('')
      }
    }
  }

  function removeDigit() {
    setPin((currentPin) => currentPin.slice(0, -1))
    setLocalError(null)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
      <section className="w-full max-w-sm rounded-2xl border border-accent/40 bg-surface p-6 text-text-primary shadow-2xl">
        <h2 className="text-center text-2xl font-bold">Acceso a Caja</h2>
        <div className="mt-6 flex justify-center gap-3">
          {[0, 1, 2, 3].map((index) => (
            <span
              className={`h-4 w-4 rounded-full border border-accent ${pin.length > index ? 'bg-accent' : 'bg-transparent'}`}
              key={index}
            />
          ))}
        </div>
        {localError ? <p className="mt-4 text-center text-sm font-bold text-red-300">{localError}</p> : null}
        <div className="mt-6 grid grid-cols-3 gap-3">
          {numbers.map((number) => (
            <button
              className="rounded-xl bg-surface-deep py-4 text-xl font-bold transition hover:bg-accent hover:text-background"
              key={number}
              onClick={() => addDigit(number)}
              type="button"
            >
              {number}
            </button>
          ))}
          <span />
          <button
            className="rounded-xl bg-surface-deep py-4 text-xl font-bold transition hover:bg-accent hover:text-background"
            onClick={() => addDigit('0')}
            type="button"
          >
            0
          </button>
          <button
            aria-label="Borrar último dígito"
            className="flex items-center justify-center rounded-xl bg-surface-deep py-4 transition hover:bg-accent hover:text-background"
            onClick={removeDigit}
            type="button"
          >
            <Delete className="h-6 w-6" />
          </button>
        </div>
      </section>
    </div>
  )
}
