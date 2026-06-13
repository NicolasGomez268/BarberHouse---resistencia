import { z } from 'zod'

export const listClientesParamsSchema = z.object({
  search: z.string().optional(),
})
export type ListClientesParams = z.infer<typeof listClientesParamsSchema>

export const updateClienteSchema = z.object({
  nombre: z.string().min(1).optional(),
  telefono: z.string().optional(),
})
export type UpdateClienteInput = z.infer<typeof updateClienteSchema>

export const clienteDataSchema = z.object({
  id: z.string(),
  nombre: z.string(),
  telefono: z.string(),
  ultimaVisita: z.string().optional(),
  paquetesActivos: z.number().optional(),
})
export type ClienteData = z.infer<typeof clienteDataSchema>
