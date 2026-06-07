import { isAxiosError } from 'axios'
import { useState } from 'react'
import { apiClient } from '../../../shared/api/client'
import type { SucursalId } from '../../../types'

export const SUCURSALES: Record<SucursalId, string> = {
  s1: 'Sucursal 1',
  s2: 'Sucursal 2',
}

export function useCaja() {
  const [pinValido, setPinValido] = useState(false)
  const [sucursalesDesbloqueadas, setSucursalesDesbloqueadas] = useState<SucursalId[]>([])

  async function validarPin(pin: string): Promise<string | null> {
    try {
      const { data } = await apiClient.post<{ sucursales: SucursalId[] }>('/caja/validar-pin', { pin })
      setPinValido(true)
      setSucursalesDesbloqueadas(data.sucursales)
      return null
    } catch (error) {
      setPinValido(false)
      setSucursalesDesbloqueadas([])
      if (isAxiosError(error) && error.response?.status === 401) {
        return error.response.data?.error ?? 'PIN incorrecto. Intentá nuevamente.'
      }
      return 'Error al validar el PIN.'
    }
  }

  return { pinValido, sucursalesDesbloqueadas, sucursales: SUCURSALES, validarPin }
}
