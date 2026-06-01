import { z } from 'zod'

export const servicioSchema = z.object({
  nombre: z.string().min(1),
  precio: z.number().nonnegative(),
  duracionMinutos: z.number().int().positive(),
})

export type ServicioInput = z.infer<typeof servicioSchema>
