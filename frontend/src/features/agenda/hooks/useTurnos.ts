import { useState } from 'react'
import type { Turno } from '../../../types'

const USE_MOCKS = import.meta.env.VITE_USE_MOCKS === 'true'

export function useTurnos() {
  // TODO: reemplazar con llamada real a API cuando VITE_USE_MOCKS=false
  const [turnos, setTurnos] = useState<Turno[]>([])
  const loading = false
  const error = null

  void USE_MOCKS

  return { turnos, loading, error, setTurnos }
}
