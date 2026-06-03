import { z } from 'zod'

export const miembroEquipoSchema = z.object({
  nombre: z.string().min(1),
  email: z.string().email(),
  rol: z.literal('admin'),
})

export type MiembroEquipoInput = z.infer<typeof miembroEquipoSchema>
