import { useEffect, useState } from 'react'
import { apiClient } from '../../../shared/api/client'
import type { CajaDiariaResumen, SucursalId } from '../../../types'

export function useCajaDiaria(fecha: string, sucursalId: SucursalId) {
  const [data, setData] = useState<CajaDiariaResumen | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    setLoading(true)
    setError(null)
    apiClient
      .get<CajaDiariaResumen>('/caja/diaria', { params: { fecha, sucursalId } })
      .then(({ data }) => setData(data))
      .catch(() => setError('Error al cargar la caja diaria'))
      .finally(() => setLoading(false))
  }, [fecha, sucursalId])

  return { data, loading, error }
}
