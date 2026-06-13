import { useCallback, useEffect, useState } from 'react'
import { apiClient } from '../../../shared/api/client'
import type { CierreDeCaja, SucursalId } from '../../../types'

export function useCierre(fecha: string, sucursalId: SucursalId) {
  const [cierre, setCierre] = useState<CierreDeCaja | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const fetchCierre = useCallback(async () => {
    setLoading(true)
    try {
      const { data } = await apiClient.get<{ cierre: CierreDeCaja | null }>('/caja/cierre', {
        params: { fecha, sucursalId },
      })
      setCierre(data.cierre)
    } catch {
      setCierre(null)
    } finally {
      setLoading(false)
    }
  }, [fecha, sucursalId])

  useEffect(() => { fetchCierre() }, [fetchCierre])

  async function guardarCierre(data: Omit<CierreDeCaja, 'id' | 'diferenciaEfectivo' | 'diferenciaTransferencia'>): Promise<void> {
    setSaving(true)
    try {
      const { data: res } = await apiClient.post<{ cierre: CierreDeCaja }>('/caja/cierre', data)
      setCierre(res.cierre)
    } finally {
      setSaving(false)
    }
  }

  return { cierre, loading, saving, guardarCierre }
}
