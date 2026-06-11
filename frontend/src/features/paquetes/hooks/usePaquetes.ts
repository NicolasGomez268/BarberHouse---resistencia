import { useState } from 'react'
import { apiClient } from '../../../shared/api/client'
import type { PaquetePrepago, SucursalId } from '../../../types'

export type VenderPaqueteParams = {
  sucursalId: SucursalId
  clienteNombre: string
  clienteTelefono: string
  cantidadTotal: number
  precioTotal: number
  metodoPago: 'EFECTIVO' | 'TRANSFERENCIA' | 'TARJETA' | 'MIXTO'
  montoEfectivo?: number
  montoTransferencia?: number
}

export function usePaquetes() {
  const [paquetes, setPaquetes] = useState<PaquetePrepago[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function fetchPaquetes(sucursalId?: SucursalId) {
    setLoading(true)
    setError(null)
    try {
      const params = sucursalId ? { sucursalId } : {}
      const { data } = await apiClient.get<{ paquetes: PaquetePrepago[] }>('/paquetes', { params })
      setPaquetes(data.paquetes)
    } catch {
      setError('Error al cargar los paquetes')
    } finally {
      setLoading(false)
    }
  }

  async function buscarPorTelefono(clienteTelefono: string, sucursalId?: SucursalId): Promise<PaquetePrepago[]> {
    const params: Record<string, string> = { clienteTelefono }
    if (sucursalId) params['sucursalId'] = sucursalId
    const { data } = await apiClient.get<{ paquetes: PaquetePrepago[] }>('/paquetes', { params })
    return data.paquetes.filter((p) => p.cantidadUsada < p.cantidadTotal)
  }

  async function venderPaquete(params: VenderPaqueteParams): Promise<PaquetePrepago> {
    const { data } = await apiClient.post<{ paquete: PaquetePrepago }>('/paquetes', params)
    setPaquetes((prev) => [...prev, data.paquete])
    return data.paquete
  }

  return {
    paquetes,
    loading,
    error,
    fetchPaquetes,
    buscarPorTelefono,
    venderPaquete,
  }
}
