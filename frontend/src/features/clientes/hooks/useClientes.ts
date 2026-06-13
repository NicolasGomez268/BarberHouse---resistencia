import { useEffect, useState } from 'react'
import { apiClient } from '../../../shared/api/client'
import type { Cliente, ClienteDetalle } from '../../../types'

export function useClientes() {
  const [clientes, setClientes] = useState<Cliente[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  async function fetchClientes(search?: string) {
    setLoading(true)
    setError(null)
    try {
      const params = search ? { search } : {}
      const { data } = await apiClient.get<{ clientes: Cliente[] }>('/clientes', { params })
      setClientes(data.clientes)
    } catch {
      setError('Error al cargar clientes')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchClientes() }, [])

  async function getClienteDetalle(id: string): Promise<ClienteDetalle | null> {
    try {
      const { data } = await apiClient.get<ClienteDetalle>(`/clientes/${id}`)
      return data
    } catch {
      return null
    }
  }

  async function updateCliente(id: string, data: { nombre?: string; telefono?: string }): Promise<Cliente | null> {
    try {
      const { data: res } = await apiClient.patch<{ cliente: Cliente }>(`/clientes/${id}`, data)
      setClientes((prev) => prev.map((c) => (c.id === id ? { ...c, ...res.cliente } : c)))
      return res.cliente
    } catch {
      return null
    }
  }

  async function migrarClientes(): Promise<{ creados: number; actualizados: number } | null> {
    try {
      const { data } = await apiClient.post<{ creados: number; actualizados: number }>('/clientes/migrar')
      await fetchClientes()
      return data
    } catch {
      return null
    }
  }

  return { clientes, loading, error, fetchClientes, getClienteDetalle, migrarClientes, updateCliente }
}
