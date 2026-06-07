import { useEffect, useState } from 'react'
import { apiClient } from '../../../shared/api/client'
import type { LiquidacionResumen, SucursalId } from '../../../types'

export function useLiquidacion(desde: string, hasta: string, sucursalId: SucursalId) {
  const [data, setData] = useState<LiquidacionResumen | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  function cargar() {
    setLoading(true)
    setError(null)
    apiClient
      .get<LiquidacionResumen>('/caja/liquidacion', { params: { desde, hasta, sucursalId } })
      .then(({ data }) => setData(data))
      .catch(() => setError('Error al cargar la liquidación'))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    cargar()
  }, [desde, hasta, sucursalId])

  return { data, loading, error, recargar: cargar }
}
