import { useEffect, useState } from 'react'
import { apiClient } from '../../../shared/api/client'
import type { MetricasMensualesResumen, SucursalId } from '../../../types'

export function useMetricasMensuales(mes: number, anio: number, sucursalId: SucursalId) {
  const [data, setData] = useState<MetricasMensualesResumen | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    setLoading(true)
    setError(null)
    apiClient
      .get<MetricasMensualesResumen>('/caja/metricas', { params: { mes, anio, sucursalId } })
      .then(({ data }) => setData(data))
      .catch(() => setError('Error al cargar las métricas'))
      .finally(() => setLoading(false))
  }, [mes, anio, sucursalId])

  return { data, loading, error }
}
