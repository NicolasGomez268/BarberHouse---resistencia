import { z } from 'zod'

export const servicioSchema = z.object({
  nombre: z.string().min(1),
  descripcion: z.string().optional(),
  precio: z.number().positive(),
  duracionMinutos: z.number().int().positive(),
  isActive: z.boolean().optional().default(true),
})

export type ServicioInput = z.infer<typeof servicioSchema>

export const servicioUpdateSchema = servicioSchema.partial()

export type ServicioUpdateInput = z.infer<typeof servicioUpdateSchema>
